# Pre-Commit Checklist

Run through this checklist before every commit to ensure code quality.

## ✅ TypeScript

- [ ] **No `any` types** - Search codebase for `any`, replace with proper types
- [ ] **No `@ts-ignore`** - Fix underlying type issues instead
- [ ] **Explicit return types** - All exported functions have return types
- [ ] **Proper interfaces** - Object shapes use interfaces, not inline types
- [ ] **Build passes** - Run `npm run build` successfully

## ✅ React Patterns

- [ ] **Contexts memoized** - All context values wrapped in `useMemo`
- [ ] **Callbacks memoized** - Event handlers use `useCallback`
- [ ] **Computed values memoized** - Expensive operations use `useMemo`
- [ ] **Components under 200 lines** - Extract logic to hooks if exceeded
- [ ] **Hooks under 150 lines** - Split complex hooks
- [ ] **No inline event handlers** - No `onClick={() => ...}` creating new functions

## ✅ React 19.2 Features

- [ ] **Forms use `useActionState`** - Not manual `isSubmitting` state
- [ ] **Optimistic updates use `useOptimistic`** - For instant feedback
- [ ] **Event handlers use `useEffectEvent`** - In effects with event logic
- [ ] **Background loading uses `<Activity>`** - Pre-load components
- [ ] **Fetch uses `cacheSignal`** - For proper lifecycle management

## ✅ Tailwind v4

- [ ] **CSS-first config** - All design tokens in `src/index.css` `@theme`
- [ ] **Custom utilities in `@plugin`** - Not in component files
- [ ] **No v3 patterns** - No `@tailwind` directives, no `tailwind.config.js`
- [ ] **Proper utility usage** - Using documented Tailwind v4 classes

## ✅ Performance

- [ ] **React DevTools Profiler checked** - No unnecessary re-renders
- [ ] **Expensive operations memoized** - Array operations, computations
- [ ] **Context consumers optimized** - Not over-subscribing to context
- [ ] **No object/array creation in render** - Without memoization

## ✅ Testing (Once Added)

- [ ] **Tests written** - For new components/hooks/utilities
- [ ] **Tests pass** - Run `npm test` successfully
- [ ] **Coverage meets minimum** - 70% components, 80% hooks, 90% utils
- [ ] **Memoization tests** - Verify context values don't change unnecessarily

## ✅ Security

- [ ] **Input validated** - All user input validated (backend)
- [ ] **No XSS vulnerabilities** - User content sanitized
- [ ] **API endpoints secured** - Rate limiting, input sanitization
- [ ] **No secrets in code** - No API keys, passwords in source

## ✅ Code Style

- [ ] **Path aliases used** - `@components/X` not `../../components/X`
- [ ] **No magic numbers** - Extract to constants in `gameConfig.ts`
- [ ] **Proper file organization** - Follows structure in guidelines
- [ ] **ESLint passes** - Run `npm run lint` successfully

## ✅ Git

- [ ] **Meaningful commit message** - Follows `type(scope): description` format
- [ ] **No debugging code** - Remove `console.log`, commented code
- [ ] **Dependencies correct** - useEffect/useMemo/useCallback deps arrays
- [ ] **Effect cleanup** - Return cleanup functions where needed

## ✅ Documentation

- [ ] **JSDoc comments** - On exported functions and complex logic
- [ ] **Type annotations** - Interfaces documented if complex
- [ ] **Breaking changes noted** - In commit message if applicable

---

## Quick Commands

```bash
# Lint code
npm run lint

# Build project
npm run build

# Run tests (once added)
npm test

# Check for `any` types
grep -r "any" src/ --include="*.ts" --include="*.tsx"

# Check for unmemoized contexts
grep -r "Provider value={" src/components/ -A 2 | grep -v "useMemo"
```

---

## Before Pushing

1. **Review your diff**: `git diff` - Look for accidental changes
2. **Run full build**: `npm run build` - Ensure production build works
3. **Manual test**: Test affected features in browser
4. **Check bundle size**: Compare before/after if adding dependencies

---

## Common Issues Caught by This Checklist

- Unmemoized context values (30-50% performance impact!)
- Missing dependencies in useEffect/useMemo/useCallback
- `any` types that hide bugs
- Magic numbers instead of constants
- Components over 200 lines becoming unmaintainable
- Inline event handlers creating new functions
- Missing return types causing type confusion

---

**Last Updated**: 2026-01-02
