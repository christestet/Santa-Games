# Fix leaderboard score visibility for different time durations

## Summary

Fixes the issue where scores weren't visible after playing games with non-default time settings (30s, 90s, 120s). The problem had two parts:

1. **Client-side**: Leaderboard always defaulted to 60s tab, hiding scores from other durations
2. **Server-side**: Server only returned overall top 10 scores, not top scores per time duration

## Changes

### Client-Side Fix
- Added `lastPlayedTime` tracking to GameContext to remember the time setting used
- Leaderboard component now accepts `defaultTime` prop and auto-selects matching tab
- Both leaderboard instances (menu and game over) now show the correct time tab

**Files changed:**
- `src/context/GameContext.tsx` - Added lastPlayedTime property
- `src/components/GameProvider.tsx` - Track time when starting games
- `src/components/Leaderboard.tsx` - Use defaultTime for initial tab selection
- `src/App.tsx` - Pass lastPlayedTime to leaderboard components

### Server-Side Fix
- Server now returns top 10 scores **per time duration** (30s, 60s, 90s, 120s)
- During gameplay: Returns up to 40 scores total (10 per duration)
- After deadline (01.01.2026): Returns all scores as before
- Client-side filtering now has complete data to work with

**Files changed:**
- `server.js` - Modified score retrieval logic to return top scores per duration
- `package.json` & `package-lock.json` - Version bump to 3.1.1

## Testing

- ✅ Build successful
- ✅ Leaderboard auto-selects correct time tab after playing
- ✅ Scores from all time durations now visible (if in top 10 for that duration)
- ✅ Server returns proper score sets per duration

## Example

**Before:** Play 30s game with score 148 → Leaderboard shows 60s tab (default) → Score not visible

**After:** Play 30s game with score 148 → Leaderboard shows 30s tab (auto-selected) → Score visible (if top 10 for 30s)

## Resolves

Playing with non-default time settings (30s, 90s, 120s) now correctly displays scores on the leaderboard.
