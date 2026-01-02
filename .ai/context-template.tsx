/**
 * Context Template - React 19.2 with Proper Memoization
 *
 * CRITICAL: This pattern MUST be followed for all contexts
 * Unmemoized contexts cause massive re-render cascades!
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode
} from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface MyContextState {
  value: number;
  isActive: boolean;
}

interface MyContextType {
  // State
  state: MyContextState;

  // Actions
  setValue: (value: number) => void;
  toggleActive: () => void;
  reset: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const MyContext = createContext<MyContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface MyProviderProps {
  children: ReactNode;
}

export function MyProvider({ children }: MyProviderProps) {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [state, setState] = useState<MyContextState>({
    value: 0,
    isActive: false,
  });

  // -------------------------------------------------------------------------
  // Callbacks - MUST use useCallback
  // -------------------------------------------------------------------------
  const setValue = useCallback((value: number) => {
    setState(prev => ({ ...prev, value }));
  }, []);

  const toggleActive = useCallback(() => {
    setState(prev => ({ ...prev, isActive: !prev.isActive }));
  }, []);

  const reset = useCallback(() => {
    setState({ value: 0, isActive: false });
  }, []);

  // -------------------------------------------------------------------------
  // Context Value - CRITICAL: MUST use useMemo
  // -------------------------------------------------------------------------
  const value = useMemo<MyContextType>(
    () => ({
      state,
      setValue,
      toggleActive,
      reset,
    }),
    [state, setValue, toggleActive, reset]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access MyContext
 *
 * @throws Error if used outside MyProvider
 * @returns Context value
 */
export function useMyContext(): MyContextType {
  const context = useContext(MyContext);

  if (context === undefined) {
    throw new Error('useMyContext must be used within MyProvider');
  }

  return context;
}

// ============================================================================
// VALIDATION CHECKLIST
// ============================================================================

/**
 * Before committing, verify:
 *
 * ✅ Context value wrapped in useMemo?
 * ✅ All callbacks wrapped in useCallback?
 * ✅ Dependencies array correct?
 * ✅ No inline functions in value object?
 * ✅ Context has <15 properties? (split if more)
 * ✅ Custom hook throws error if used outside provider?
 *
 * Performance Impact:
 * - Without useMemo: ALL consumers re-render on EVERY state change
 * - With useMemo: Only consumers using changed values re-render
 *
 * This can be a 30-50% performance difference!
 */
