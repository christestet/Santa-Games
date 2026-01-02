# AI Code Templates

This directory contains templates that follow the project's mandatory development guidelines.

## 📁 Files

### `component-template.tsx`
React 19.2 component boilerplate with:
- Proper TypeScript typing
- useMemo for computed values
- useCallback for event handlers
- memo for performance optimization
- Clear structure with sections

**Use when**: Creating any new React component

---

### `hook-template.ts`
Custom hook template with:
- TypeScript interfaces for options and return type
- Proper memoization patterns
- Effect management
- JSDoc documentation

**Use when**: Extracting logic from components into reusable hooks

---

### `context-template.tsx`
Context provider with **mandatory memoization**:
- useMemo-wrapped context value
- useCallback-wrapped actions
- Custom hook with error handling
- Validation checklist

**Use when**: Creating any new context provider

**CRITICAL**: This pattern is NON-NEGOTIABLE for all contexts!

---

### `checklist-pre-commit.md`
Complete validation checklist covering:
- TypeScript strictness
- React patterns
- React 19.2 features
- Tailwind v4
- Performance
- Security
- Testing
- Code style

**Use**: Before every git commit

---

## 🚀 How to Use

1. **Copy the template** for your use case
2. **Rename** to your component/hook name
3. **Fill in** the logic following the patterns
4. **Keep the structure** - don't remove the sections
5. **Verify** with the pre-commit checklist

## ✅ Example Workflow

```bash
# Creating new component
cp .ai/component-template.tsx src/components/MyNewComponent.tsx

# Edit the file
# ... implement your logic ...

# Before committing
cat .ai/checklist-pre-commit.md
# Go through checklist

# Commit
git add .
git commit -m "feat(components): add MyNewComponent"
```

---

## 📚 Related Files

- **[AI_DEVELOPMENT_GUIDELINES.md](../AI_DEVELOPMENT_GUIDELINES.md)** - Full development guidelines (READ FIRST!)
- **[CLAUDE.md](../CLAUDE.md)** - Project architecture overview
- **[Modernization Plan](../.claude/plans/zesty-brewing-dragonfly.md)** - Technical debt and refactoring roadmap

---

**Maintained By**: Project team + AI coding assistants
