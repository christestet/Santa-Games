# AI Development Guidelines for Santa Games
## Mandatory Rules for All LLMs Working on This Project

> **CRITICAL**: This file contains ENFORCEABLE rules. Any code that violates these guidelines MUST be rejected in code review.
> Read this BEFORE making any changes to the codebase.

**Last Updated**: 2026-01-02
**Version**: 1.0.0
**Project**: Santa Games v4.6.1
**Stack**: React 19.2.0, Vite 7.2, TypeScript 5.9, Tailwind v4, Express 5

---

## 📋 Pre-Flight Checklist

Before making ANY code changes, verify:
- [ ] I have read this entire document
- [ ] I understand React 19.2 patterns (Activity, useEffectEvent, useActionState, useOptimistic)
- [ ] I know this project uses Tailwind v4 CSS-first (no v3 patterns)
- [ ] I will write tests for my changes
- [ ] I will memoize all context values
- [ ] I will keep components under 200 lines

---

## 🚫 ABSOLUTE PROHIBITIONS (Never Do These)

### 1. TypeScript Violations
❌ **NEVER** use `any` type
❌ **NEVER** use `@ts-ignore` or `@ts-expect-error` without explanation
❌ **NEVER** use type assertions (`as`) unless absolutely necessary

✅ **ALWAYS** use proper types, interfaces, or generics

### 2. Context Anti-Patterns
❌ **NEVER** create context value without `useMemo`
❌ **NEVER** put inline functions in context value
❌ **NEVER** create contexts with >15 properties (split them)

✅ **ALWAYS** wrap context values in `useMemo` with proper dependencies

### 3. Component Structure Violations
❌ **NEVER** create components >200 lines
❌ **NEVER** put game logic directly in component (extract to hooks)
❌ **NEVER** use inline event handlers that create new functions (use useCallback)

✅ **ALWAYS** extract complex logic to custom hooks
✅ **ALWAYS** keep components focused on rendering

### 4. Tailwind v4 Violations
❌ **NEVER** use `tailwind.config.js` JavaScript config
❌ **NEVER** mix Tailwind v3 patterns with v4
❌ **NEVER** use deprecated utility classes

✅ **ALWAYS** use CSS-first `@theme` and `@plugin` in `index.css`

### 5. Performance Anti-Patterns
❌ **NEVER** create new objects/arrays in render without memoization
❌ **NEVER** skip memoization of expensive computations
❌ **NEVER** use `array.map().filter()` chains without useMemo

✅ **ALWAYS** use useMemo for computed values
✅ **ALWAYS** use useCallback for event handlers passed as props

### 6. Backend Anti-Patterns
❌ **NEVER** use CommonJS `require()` in this ESM project
❌ **NEVER** use MD5 for hashing (use SHA-256)
❌ **NEVER** skip input validation on API endpoints

---

## ✅ MANDATORY PATTERNS (Always Do These)

### React 19.2 Required Features

#### 1. Use `useActionState` for Forms
**When**: ANY form submission (score submission, settings, etc.)

**Pattern**:
```typescript
import { useActionState } from 'react';

const [state, submitAction, isPending] = useActionState(
  async (prevState, formData) => {
    const result = await apiCall(formData);
    return { success: result.ok, error: result.error };
  },
  { success: false, error: null }
);

return <form action={submitAction}>...</form>;
```

#### 2. Use `useOptimistic` for Instant Feedback
**When**: Score updates, leaderboard changes, any user action with server roundtrip

**Pattern**:
```typescript
import { useOptimistic } from 'react';

const [optimisticData, addOptimistic] = useOptimistic(
  serverData,
  (state, newItem) => [...state, newItem]
);
```

#### 3. Use `useEffectEvent` for Event Handlers in Effects
**When**: Event logic that shouldn't trigger effect re-runs

**Pattern**:
```typescript
import { useEffectEvent } from 'react';

const onScore = useEffectEvent((points) => {
  updateScore(points); // Won't be in effect deps
});

useEffect(() => {
  // Can use onScore without listing in deps
}, []);
```

#### 4. Use `<Activity>` for Background Loading
**When**: Pre-loading games, lazy components, background data

**Pattern**:
```typescript
import { Activity } from 'react';

<Activity mode="hidden">
  <ExpensiveComponent />
</Activity>
```

#### 5. Use `cacheSignal` for Fetch Lifecycle
**When**: Cached API calls that need cleanup

**Pattern**:
```typescript
import { cache, cacheSignal } from 'react';

const fetchData = cache(async () => {
  const signal = cacheSignal();
  const res = await fetch(url, { signal });
  return res.json();
});
```

---

### Context Memoization (CRITICAL)

**Every context provider MUST follow this pattern**:

```typescript
import { createContext, useMemo, useCallback, ReactNode } from 'react';

export const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);

  // ✅ Memoize callbacks
  const someAction = useCallback(() => {
    // action logic
  }, [dependencies]);

  // ✅ Memoize context value
  const value = useMemo(
    () => ({ state, someAction }),
    [state, someAction]
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}
```

**Validation**:
- [ ] Context value wrapped in `useMemo`?
- [ ] All callbacks wrapped in `useCallback`?
- [ ] Dependencies array correct?
- [ ] No inline functions in value object?

---

### Component Structure Rules

#### Max Lines Enforcement
- **Components**: 200 lines MAX
- **Hooks**: 150 lines MAX
- **Utility files**: 100 lines MAX

**If exceeded**: Extract to smaller components/hooks

#### Single Responsibility Principle
Each component should do ONE thing:
- ✅ `GameRenderer` - only rendering
- ✅ `GameController` - only input handling
- ✅ `useGamePhysics` - only physics calculations

❌ `SnowballHunt` - doing rendering + logic + input + physics (BAD)

#### File Organization
```
src/
├── components/
│   ├── GameName/
│   │   ├── index.tsx           # Main component (composition only)
│   │   ├── GameRenderer.tsx    # Pure rendering
│   │   ├── GameTarget.tsx      # Sub-component
│   │   └── GameParticles.tsx   # Effects
│   └── ui/                     # Reusable UI components
├── hooks/
│   ├── useGameName.ts          # Game logic hook
│   └── useGamePhysics.ts       # Physics engine
└── constants/
    └── gameConfig.ts           # Configuration only
```

---

### TypeScript Strict Mode

#### Required tsconfig.json Options
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### Type Safety Rules
1. **No `any`** - Use `unknown` and narrow with type guards
2. **No `as any`** - Fix the underlying type issue
3. **Explicit return types** on exported functions
4. **Interfaces over types** for object shapes
5. **Readonly arrays** for data that shouldn't mutate

**Example**:
```typescript
// ❌ Bad
function getData(): any {
  return fetch('/api');
}

// ✅ Good
async function getData(): Promise<ApiResponse> {
  const res = await fetch('/api');
  return res.json() as ApiResponse;
}
```

---

### Performance Requirements

#### Memoization Checklist
Use when rendering depends on expensive computation:

```typescript
// ✅ For computed values
const filteredScores = useMemo(
  () => scores.filter(s => s.time === selectedTime),
  [scores, selectedTime]
);

// ✅ For callbacks passed as props
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ✅ For entire components (use sparingly)
const MemoizedComponent = React.memo(Component);
```

**When NOT to memoize**:
- Primitive values
- Components that always re-render anyway
- Premature optimization

#### React DevTools Profiler
Before committing:
1. Profile component with React DevTools
2. Check for unnecessary re-renders
3. Verify memoization is working

---

### Tailwind v4 CSS-First

#### Required Pattern
All design tokens go in `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-frost-blue: #4A90E2;
  --font-size-display: 2.5rem;
  --spacing-game: 1.25rem;
}

@plugin {
  @utility frost-card {
    @apply rounded-lg bg-white/10 backdrop-blur-md;
  }
}
```

#### Prohibited Patterns
❌ `tailwind.config.js` with JavaScript config
❌ Mixing v3 `@tailwind` directives with v4
❌ Using deprecated utilities

#### Validation
- [ ] All custom colors in `@theme`?
- [ ] All custom utilities in `@plugin`?
- [ ] No v3 patterns remaining?

---

### Testing Requirements

#### Minimum Coverage
- **Components**: 70% coverage
- **Hooks**: 80% coverage
- **Utilities**: 90% coverage

#### Required Tests
1. **Context Providers**: Verify memoization works
2. **Game Logic Hooks**: Unit test all mechanics
3. **API Integration**: Mock fetch calls
4. **Error Boundaries**: Test error handling

#### Test Pattern
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render without crashing', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should memoize expensive computation', () => {
    const { rerender } = render(<MyComponent data={data} />);
    const firstRender = screen.getByTestId('result').textContent;
    rerender(<MyComponent data={data} />);
    const secondRender = screen.getByTestId('result').textContent;
    expect(firstRender).toBe(secondRender); // Same object reference
  });
});
```

---

### Security Patterns

#### Input Validation (Backend)
**ALWAYS validate user input**:

```javascript
// ✅ Good
const validateName = (name) => {
  if (typeof name !== 'string') return false;
  if (name.length < 1 || name.length > 50) return false;
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) return false;
  return true;
};
```

#### XSS Prevention (Frontend)
**NEVER use `dangerouslySetInnerHTML`** unless absolutely necessary
**ALWAYS sanitize user input** before rendering

#### API Security
- [ ] Rate limiting enabled?
- [ ] Input sanitization on all endpoints?
- [ ] SQL injection patterns detected?
- [ ] CORS configured correctly?

---

### Git Commit Rules

#### Before Every Commit
1. Run `npm run lint` (must pass)
2. Run `npm test` (must pass, once tests are added)
3. Run `npm run build` (must succeed)
4. Review diff for accidental changes

#### Commit Message Format
```
type(scope): short description

- Detail 1
- Detail 2

Refs: #issue-number
```

**Types**: feat, fix, refactor, perf, test, docs, chore

---

## 🎮 Project-Specific Patterns

### Game Component Structure
```typescript
// ✅ Good: Logic in hook, component for rendering
function useSnowballGame(settings: GameSettings) {
  // All game logic here
  return { gameState, targets, handleThrow };
}

function SnowballHunt({ settings, onGameOver }: Props) {
  const { gameState, targets, handleThrow } = useSnowballGame(settings);
  return <div>{/* Rendering only */}</div>;
}
```

### Context Usage
- `useGame()` for game state (state, score, actions)
- `useTheme()` for theme (classic/grinch)
- `useSound()` for audio control
- `useLanguage()` for translations

**NEVER access contexts directly** - always use custom hooks

### Path Aliases
**ALWAYS use these imports**:
```typescript
import { Component } from '@components/Component';
import { useHook } from '@hooks/useHook';
import { CONSTANT } from '@constants/config';
```

❌ **NEVER** use relative paths: `../../components/Component`

### Configuration
- **Game mechanics**: All in `src/constants/gameConfig.ts`
- **No magic numbers**: Extract to named constants
- **API URLs**: Use `src/config.ts` with environment detection

---

## 🔍 Code Review Checklist

Before submitting PR:

### TypeScript
- [ ] No `any` types?
- [ ] No `@ts-ignore`?
- [ ] All functions have return types?
- [ ] All interfaces properly exported?

### React
- [ ] All contexts memoized?
- [ ] All callbacks use useCallback?
- [ ] All computed values use useMemo?
- [ ] Components under 200 lines?

### Performance
- [ ] No unnecessary re-renders?
- [ ] Expensive computations memoized?
- [ ] React DevTools Profiler checked?

### Testing
- [ ] Tests written for new code?
- [ ] Tests pass locally?
- [ ] Coverage meets minimum?

### Security
- [ ] User input validated?
- [ ] No XSS vulnerabilities?
- [ ] API endpoints secured?

### Style
- [ ] Uses Tailwind v4 patterns?
- [ ] Follows file organization?
- [ ] No magic numbers (use constants)?

---

## ⚠️ Common Pitfalls to Avoid

### 1. Unmemoized Context Values
**Problem**: Causes all consumers to re-render
**Detection**: Use React DevTools Profiler
**Fix**: Wrap value in `useMemo`

**Example**:
```typescript
// ❌ Bad
return <MyContext.Provider value={{ state, action }}>{children}</MyContext.Provider>;

// ✅ Good
const value = useMemo(() => ({ state, action }), [state, action]);
return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
```

### 2. Inline Event Handlers
**Problem**: Creates new function on every render
**Example**: `onClick={() => doSomething()}`
**Fix**: Use `useCallback` or CSS pseudo-classes

```typescript
// ❌ Bad
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Good
const onClick = useCallback(() => handleClick(id), [id]);
<button onClick={onClick}>Click</button>
```

### 3. Derived State
**Problem**: Duplicating data that can be computed
**Fix**: Use `useMemo` instead of `useState`

```typescript
// ❌ Bad
const [filteredScores, setFilteredScores] = useState([]);
useEffect(() => {
  setFilteredScores(scores.filter(s => s.time === selectedTime));
}, [scores, selectedTime]);

// ✅ Good
const filteredScores = useMemo(
  () => scores.filter(s => s.time === selectedTime),
  [scores, selectedTime]
);
```

### 4. Stale Closures in Effects
**Problem**: Effect uses old values
**Fix**: Use `useEffectEvent` (React 19.2) or add to dependencies

```typescript
// ❌ Bad (stale closure)
useEffect(() => {
  const timer = setInterval(() => {
    updateScore(score); // Uses old score
  }, 1000);
  return () => clearInterval(timer);
}, []); // Missing score dependency

// ✅ Good (React 19.2)
const onTick = useEffectEvent(() => {
  updateScore(score); // Always uses latest score
});

useEffect(() => {
  const timer = setInterval(onTick, 1000);
  return () => clearInterval(timer);
}, []); // Empty deps OK!
```

### 5. Missing Effect Cleanup
**Problem**: Memory leaks, event listeners not removed
**Fix**: Return cleanup function from useEffect

```typescript
// ❌ Bad
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// ✅ Good
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [handleResize]);
```

---

## 📚 References

**React 19.2 Documentation**:
- [Activity Component](https://react.dev/blog/2025/10/01/react-19-2)
- [useEffectEvent](https://react.dev/blog/2025/10/01/react-19-2)
- [useActionState](https://react.dev/reference/react/useActionState)
- [useOptimistic](https://react.dev/reference/react/useOptimistic)

**Tailwind v4**:
- [CSS-First Configuration](https://tailwindcss.com/docs/upgrade-guide)
- [Migration Guide](https://medium.com/better-dev-nextjs-react/tailwind-v4-migration-from-javascript-config-to-css-first-in-2025-ff3f59b215ca)

**TypeScript**:
- [Strict Mode Options](https://www.typescriptlang.org/tsconfig#strict)

**Project Documentation**:
- [CLAUDE.md](./CLAUDE.md) - Project architecture and patterns
- [Modernization Plan](/.claude/plans/zesty-brewing-dragonfly.md) - Full refactoring roadmap

---

## 🚀 Quick Start for New LLM Sessions

1. Read this file completely
2. Read [CLAUDE.md](./CLAUDE.md) for project architecture
3. Run `npm run dev:full` to start dev environment
4. Make changes following patterns above
5. Run tests before committing (once added)
6. Use React DevTools to verify performance

---

## 🛠️ Development Workflow

### Starting a New Feature
1. Check existing patterns in similar components
2. Create new branch: `git checkout -b feat/feature-name`
3. Use templates from `.ai/` directory
4. Write tests first (TDD recommended)
5. Implement feature following guidelines
6. Profile with React DevTools
7. Run full commit checklist
8. Submit PR with clear description

### Refactoring Existing Code
1. Read the code thoroughly first
2. Write tests to preserve behavior
3. Refactor incrementally
4. Verify tests still pass
5. Profile before/after with React DevTools
6. Document breaking changes

---

**Maintained By**: Project team + AI coding assistants
**Questions?**: Open an issue or check [CLAUDE.md](./CLAUDE.md)
