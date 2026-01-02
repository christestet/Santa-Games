/**
 * Component Template - React 19.2
 *
 * Usage: Copy this template when creating new components
 * Remember: Components should be UNDER 200 lines - extract logic to hooks!
 */

import { memo, useCallback, useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface MyComponentProps {
  // Props interface - always define explicitly
  title: string;
  onAction: (value: string) => void;
  items?: readonly string[]; // Use readonly for arrays that shouldn't mutate
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * MyComponent description
 *
 * @param props - Component props
 * @returns JSX element
 */
function MyComponent({ title, onAction, items = [] }: MyComponentProps) {
  // -------------------------------------------------------------------------
  // State & Refs
  // -------------------------------------------------------------------------
  // Keep minimal state in components - extract complex logic to hooks

  // -------------------------------------------------------------------------
  // Hooks
  // -------------------------------------------------------------------------
  // Use custom hooks for complex logic
  // const gameState = useMyGame(settings);

  // -------------------------------------------------------------------------
  // Memoized Values
  // -------------------------------------------------------------------------
  // Use useMemo for expensive computations
  const processedItems = useMemo(
    () => items.filter(item => item.length > 0),
    [items]
  );

  // -------------------------------------------------------------------------
  // Callbacks
  // -------------------------------------------------------------------------
  // Use useCallback for event handlers passed as props
  const handleClick = useCallback(() => {
    onAction('clicked');
  }, [onAction]);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  // Prefer useEffectEvent (React 19.2) for event logic in effects
  // const onUpdate = useEffectEvent(() => { /* logic */ });

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="frost-card">
      <h2 className="text-2xl font-bold">{title}</h2>

      <ul>
        {processedItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <button onClick={handleClick} className="btn-primary">
        Click Me
      </button>
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

// Use memo for components that re-render with same props
// Only if profiling shows unnecessary re-renders
export default memo(MyComponent);

// Named export for testing
export { MyComponent };
