/**
 * Custom Hook Template
 *
 * Usage: Copy this template when extracting logic from components
 * Remember: Hooks should be UNDER 150 lines - split if needed!
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface MyHookOptions {
  initialValue: number;
  onUpdate?: (value: number) => void;
}

interface MyHookReturn {
  value: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  isAtMax: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook description
 *
 * @param options - Hook configuration options
 * @returns Hook state and actions
 *
 * @example
 * ```tsx
 * const { value, increment, isAtMax } = useMyHook({ initialValue: 0 });
 * ```
 */
export function useMyHook({
  initialValue,
  onUpdate
}: MyHookOptions): MyHookReturn {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [value, setValue] = useState(initialValue);

  // -------------------------------------------------------------------------
  // Callbacks
  // -------------------------------------------------------------------------
  const increment = useCallback(() => {
    setValue(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setValue(prev => Math.max(0, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  // -------------------------------------------------------------------------
  // Memoized Values
  // -------------------------------------------------------------------------
  const isAtMax = useMemo(() => value >= 100, [value]);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => {
    onUpdate?.(value);
  }, [value, onUpdate]);

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    value,
    increment,
    decrement,
    reset,
    isAtMax,
  };
}

// ============================================================================
// NOTES
// ============================================================================

/**
 * Best Practices:
 *
 * 1. Always define return type explicitly
 * 2. Memoize callbacks with useCallback
 * 3. Memoize expensive computations with useMemo
 * 4. Use useEffectEvent (React 19.2) for event logic in effects
 * 5. Document complex logic with comments
 * 6. Export hook as named export (not default)
 */
