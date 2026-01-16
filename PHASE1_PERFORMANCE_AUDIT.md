# Phase 1 Performance Refactor - Senior Audit Report

**Date:** January 2026  
**Auditor:** Senior Frontend Performance Reviewer  
**Target:** Real-time React multiplayer UNO game on Fly.io free tier  
**Phase 1 Goals:** Reduce re-renders, fix socket lifecycle, split components, eliminate timer storms, improve CPU/RAM

---

## 🚨 VERDICT: ⚠️ **INCOMPLETE** - Critical Issues Block Phase 2

**Status:** Phase 1 is **partially complete** but contains **critical blockers** that will cause memory leaks, duplicate event handling, and performance degradation on Fly.io free tier.

**Must Fix Before Phase 2:**
1. ❌ **CRITICAL:** Remove duplicate socket listener registrations (memory leak)
2. ❌ **CRITICAL:** Delete unused `useGameLogic.ts` (dead code, confusion)
3. ❌ **CRITICAL:** Integrate `useGameSocket.ts` or remove it (incomplete refactor)
4. ⚠️ **HIGH:** Fix timer re-render frequency (still causes unnecessary renders)
5. ⚠️ **MEDIUM:** Fix broken `GameHeader` memo comparison function

---

## ✅ What Was Done Correctly

### 1. Hook Separation Architecture
- ✅ **GOOD:** Created separate hooks: `useGameState`, `useGameTimer`, `useGameUI`
- ✅ **GOOD:** Clear separation of concerns (state, timer, UI)
- ✅ **GOOD:** `Game.tsx` uses split hooks correctly

### 2. Component Memoization
- ✅ **GOOD:** `PlayerHand` properly memoized with `memo()`
- ✅ **GOOD:** `OpponentHand` memoized at export
- ✅ **GOOD:** `GameHeader` has custom comparison function (but implementation is broken - see issues)

### 3. Timer Implementation (Partial)
- ✅ **GOOD:** Switched from `setInterval` to `requestAnimationFrame` in `useGameTimer.ts`
- ✅ **GOOD:** Added optimization check to prevent unnecessary state updates (line 45)
- ⚠️ **PARTIAL:** Still triggers re-render every second (see issues)

### 4. Callback Memoization
- ✅ **GOOD:** `onCardClick` in `Game.tsx` properly memoized with `useCallback`
- ✅ **GOOD:** Dependencies correctly specified

### 5. State Management
- ✅ **GOOD:** Using refs for accessing latest state without re-renders (`gameStateRef`)
- ✅ **GOOD:** Proper ref synchronization in effects

---

## ❌ Critical Issues (Blockers)

### 1. **DUPLICATE SOCKET LISTENERS** - Memory Leak & Event Duplication

**Severity:** 🔴 **CRITICAL**

**Problem:**
Multiple hooks are independently registering socket listeners for the same events:

- `useGameState.ts` (lines 64-69): Registers `game_state`, `hand_update`, `game_restored`, `game_over`, `should_reconnect`, `error`
- `useGameUI.ts` (lines 39-43): Registers `game_started`, `card_played`, `player_reconnected`, `turn_timeout`, `error`
- `useGameTimer.ts` (line 18): Registers `turn_timer_started`
- `useGameSocket.ts` (lines 131-143): Registers **ALL** events (13 listeners total)
- `useGameLogic.ts` (lines 194-206): Registers **ALL** events (13 listeners) - **DEAD CODE**

**Impact:**
- **Memory leak:** Listeners accumulate on every hook re-render
- **Duplicate event handling:** Same event fires multiple handlers
- **CPU waste:** Unnecessary function calls on every socket event
- **Fly.io free tier risk:** Memory pressure from listener accumulation

**Evidence:**
```typescript
// useGameState.ts:64
socketService.socket.on('game_state', handleGameState);

// useGameSocket.ts:131  
socketService.socket.on('game_state', handleGameState);

// useGameLogic.ts:194 (DEAD CODE)
socketService.socket.on('game_state', handleGameState);
```

**Fix Required:**
- **Option A (Recommended):** Use `useGameSocket.ts` as the **single source** for all socket listeners, remove listeners from other hooks
- **Option B:** Remove `useGameSocket.ts` entirely, consolidate listeners in `useGameState.ts` only
- **CRITICAL:** Ensure only ONE hook registers each event type

---

### 2. **DEAD CODE: `useGameLogic.ts` Still Exists**

**Severity:** 🔴 **CRITICAL**

**Problem:**
`useGameLogic.ts` contains 332 lines of old code with:
- All socket listeners (lines 194-206)
- Timer logic (lines 225-249)
- State management (lines 13-23)
- UI state (lines 15-22)

**Impact:**
- **Confusion:** Developers don't know which hook to use
- **Maintenance burden:** Two implementations of same logic
- **Risk:** Someone might accidentally import `useGameLogic` instead of split hooks
- **Bundle size:** Unused code increases bundle size

**Evidence:**
```bash
# File exists but is NOT imported anywhere:
frontend/src/hooks/useGameLogic.ts (332 lines)
# No imports found in codebase
```

**Fix Required:**
- **DELETE** `useGameLogic.ts` entirely
- Verify no imports exist (confirmed: none found)

---

### 3. **`useGameSocket.ts` Created But Never Integrated**

**Severity:** 🔴 **CRITICAL**

**Problem:**
`useGameSocket.ts` was created as part of the refactor (208 lines) but:
- ❌ Not imported in `Game.tsx`
- ❌ Not used anywhere in the codebase
- ❌ Other hooks duplicate its functionality

**Impact:**
- **Incomplete refactor:** Work was done but not integrated
- **Confusion:** Two competing socket management approaches
- **Wasted effort:** Hook exists but provides no value

**Evidence:**
```typescript
// Game.tsx uses:
import { useGameState } from "../hooks/useGameState";
import { useGameUI } from "../hooks/useGameUI";
import { useGameTimer } from "../hooks/useGameTimer";

// But NOT:
// import { useGameSocket } from "../hooks/useGameSocket"; ❌
```

**Fix Required:**
- **Either:** Integrate `useGameSocket.ts` into `Game.tsx` and remove duplicate listeners from other hooks
- **Or:** Delete `useGameSocket.ts` and consolidate socket logic in `useGameState.ts`

---

### 4. **Timer Still Causes Re-renders Every Second**

**Severity:** 🟠 **HIGH**

**Problem:**
`useGameTimer.ts` uses `requestAnimationFrame` (good) but still calls `setTurnTimeRemaining()` every second (line 42), causing:
- Re-render of `Game.tsx` every second
- Re-render of `GameHeader` every second (even with memo, see issue #5)
- Re-render of timer display every second

**Current Implementation:**
```typescript
// useGameTimer.ts:42
setTurnTimeRemaining((prev) => {
  const next = Math.max(0, prev - 1);
  return next !== prev ? next : prev; // ✅ Good optimization
});
```

**Why It's Still a Problem:**
- Even with the optimization check, React still schedules a re-render when `setState` is called
- The check happens **inside** the setState callback, but React has already queued the update
- `Game.tsx` receives new `turnTimeRemaining` prop → triggers re-render
- `GameHeader` receives new prop → memo comparison runs (but is broken, see issue #5)

**Impact:**
- **CPU waste:** Unnecessary re-renders every second
- **Fly.io free tier:** Wastes limited CPU cycles
- **Battery drain:** On mobile devices

**Fix Required:**
- Use a **ref** to track timer value, only update state when:
  - Timer reaches 0 (for timeout logic)
  - Component unmounts (cleanup)
  - User explicitly needs to see the value (e.g., in a display component that reads from ref)
- **OR:** Move timer display to a separate component that reads from ref, not state

---

### 5. **Broken `GameHeader` Memo Comparison Function**

**Severity:** 🟠 **MEDIUM**

**Problem:**
`GameHeader.tsx` line 81 has a broken comparison:

```typescript
// GameHeader.tsx:81 - WRONG
Math.floor((prevProps.turnTimeRemaining || 0) / 1000) === 
Math.floor((nextProps.turnTimeRemaining || 0) / 1000)
```

**Issue:**
- `turnTimeRemaining` is already in **seconds** (from `useGameTimer.ts`)
- Dividing by 1000 converts it to milliseconds, then floors it
- Example: `30 / 1000 = 0.03`, `Math.floor(0.03) = 0`
- This means the comparison **always returns true** for values 0-999 seconds
- Memoization is **completely ineffective**

**Impact:**
- `GameHeader` re-renders on **every** timer tick (every second)
- Wastes CPU on Fly.io free tier
- Defeats the purpose of memoization

**Fix Required:**
```typescript
// CORRECT comparison (turnTimeRemaining is already in seconds):
Math.floor(prevProps.turnTimeRemaining || 0) === 
Math.floor(nextProps.turnTimeRemaining || 0)

// OR better: Only re-render when second changes:
prevProps.turnTimeRemaining === nextProps.turnTimeRemaining
```

---

## ⚠️ Partial/Incomplete Work

### 1. Socket Lifecycle Management

**Status:** ⚠️ **PARTIALLY DONE**

**What's Good:**
- ✅ Cleanup functions exist in all hooks
- ✅ Listeners are removed in `return () => {}` blocks

**What's Missing:**
- ❌ **Duplicate registrations** (see Critical Issue #1)
- ❌ No single source of truth for socket events
- ❌ Each hook manages its own listeners independently

**Risk:**
- If a hook re-renders, listeners are removed and re-added
- If multiple hooks register same event, cleanup in one hook doesn't affect others
- Memory leaks on rapid re-renders

---

### 2. Component Render Boundaries

**Status:** ⚠️ **MOSTLY GOOD**

**What's Good:**
- ✅ `PlayerHand` memoized correctly
- ✅ `OpponentHand` memoized correctly
- ✅ `GameHeader` has memo (but broken comparison)

**What's Risky:**
- ⚠️ `GameTable` is **NOT memoized** - re-renders on every parent re-render
- ⚠️ Props passed to `OpponentHand` may not be stable (object references)

**Check Needed:**
```typescript
// Game.tsx:177 - Is `topOpponent` object reference stable?
<OpponentHand
  player={topOpponent}  // ← Object from useMemo, should be stable
  isCurrentTurn={gameState.currentPlayer === topOpponent.id}  // ← Computed, may change
/>
```

**Verdict:** Props look stable, but `isCurrentTurn` computation happens on every render. Consider memoizing.

---

### 3. Timer Implementation

**Status:** ⚠️ **PARTIALLY OPTIMIZED**

**What's Good:**
- ✅ Uses `requestAnimationFrame` instead of `setInterval`
- ✅ Only updates every 1000ms (not every frame)
- ✅ Has optimization check to prevent unnecessary updates

**What's Still Wrong:**
- ❌ Still calls `setState` every second (triggers re-render)
- ❌ Should use ref for timer value, state only for display updates

**Recommendation:**
Move timer value to ref, update state only when:
- Component needs to display it (debounced, e.g., every 5 seconds)
- Timer reaches 0 (for timeout logic)

---

## 🔍 Additional Findings

### 1. Notification Timeout Not Cleaned Up

**Location:** `useGameUI.ts:21`

```typescript
setTimeout(() => setNotification(""), 3000);
```

**Issue:** No cleanup if component unmounts before timeout fires.

**Impact:** Low (minor memory leak, but timeout is short)

**Fix:**
```typescript
const timeoutId = setTimeout(() => setNotification(""), 3000);
return () => clearTimeout(timeoutId);
```

---

### 2. Multiple `setTimeout` Calls Without Cleanup

**Locations:**
- `useGameSocket.ts:73` - `setTimeout(() => requestHand(), 500)`
- `useGameSocket.ts:150, 155` - State request timeouts (cleaned up ✅)
- `useGameLogic.ts` - Multiple timeouts (dead code, ignore)

**Impact:** Low (short timeouts, but best practice to clean up)

---

### 3. `useGameState` Has Duplicate Initialization Logic

**Location:** `useGameState.ts:82-106`

**Issue:** Has its own initialization effect that duplicates logic from `useGameSocket.ts`.

**Impact:** Medium (confusion, potential race conditions)

**Recommendation:** Consolidate initialization in one place.

---

## 📊 Performance Impact Assessment

### Current State (With Issues)

| Metric | Status | Impact on Fly.io Free Tier |
|--------|--------|---------------------------|
| **Socket Listeners** | ❌ Duplicated 3-4x | **HIGH** - Memory leak, CPU waste |
| **Timer Re-renders** | ⚠️ Every second | **MEDIUM** - Unnecessary CPU cycles |
| **Component Memoization** | ⚠️ Partial (GameHeader broken) | **MEDIUM** - Wasted renders |
| **Dead Code** | ❌ useGameLogic.ts exists | **LOW** - Bundle size |
| **Memory Leaks** | ❌ Listener accumulation | **HIGH** - Will degrade over time |

### Expected After Fixes

| Metric | Status | Impact |
|--------|--------|--------|
| **Socket Listeners** | ✅ Single registration | **LOW** - Clean, efficient |
| **Timer Re-renders** | ✅ Ref-based, minimal | **LOW** - Only when needed |
| **Component Memoization** | ✅ All working | **LOW** - Proper boundaries |
| **Dead Code** | ✅ Removed | **LOW** - Clean codebase |
| **Memory Leaks** | ✅ None | **LOW** - Stable over time |

---

## 🎯 Required Fixes (Priority Order)

### Priority 1: Critical Blockers (Must Fix)

1. **Remove duplicate socket listeners**
   - Choose: Use `useGameSocket.ts` OR remove it and consolidate in `useGameState.ts`
   - Remove listeners from `useGameUI.ts`, `useGameTimer.ts`
   - Ensure only ONE hook registers each event

2. **Delete `useGameLogic.ts`**
   - File is dead code, not imported anywhere
   - Remove entire file

3. **Fix or remove `useGameSocket.ts`**
   - If keeping: Integrate into `Game.tsx`, remove duplicate listeners
   - If removing: Consolidate socket logic in `useGameState.ts`

### Priority 2: High Impact (Should Fix)

4. **Fix timer re-render frequency**
   - Move timer value to ref
   - Only update state when needed (e.g., every 5 seconds for display)
   - Or: Use ref in display component, no state updates

5. **Fix `GameHeader` memo comparison**
   - Remove `/1000` division (turnTimeRemaining is already in seconds)
   - Or: Use simple equality check

### Priority 3: Best Practices (Nice to Have)

6. **Clean up notification timeout**
   - Store timeout ID, clear on unmount

7. **Memoize `GameTable` component**
   - Low priority (doesn't receive frequently changing props)

8. **Consolidate initialization logic**
   - Remove duplicate initialization from `useGameState.ts` or `useGameSocket.ts`

---

## 📝 Code Quality Assessment

### Architecture: ⚠️ **GOOD INTENT, POOR EXECUTION**

- ✅ **Intent:** Clear separation of concerns
- ❌ **Execution:** Incomplete integration, duplicate code
- ❌ **Result:** More complex than before, with memory leaks

### Maintainability: ⚠️ **CONFUSING**

- ❌ Multiple competing implementations (`useGameLogic.ts`, `useGameSocket.ts`, split hooks)
- ❌ Unclear which hook to use for what
- ❌ Dead code creates confusion

### Performance: ⚠️ **WORSE THAN BEFORE**

- ❌ Duplicate socket listeners = more CPU/memory usage
- ❌ Timer still causes unnecessary re-renders
- ❌ Broken memoization defeats optimization

---

## 🚦 Phase 2 Readiness

**Status:** ❌ **NOT READY**

**Blockers:**
1. Memory leaks from duplicate listeners will degrade over time
2. Timer re-renders waste CPU on free tier
3. Broken memoization defeats optimization efforts

**Recommendation:**
- **DO NOT** proceed to Phase 2 until Critical and High priority fixes are complete
- Current state will cause performance degradation on Fly.io free tier
- Memory leaks will accumulate over long-running games

---

## ✅ Summary

**What Phase 1 Achieved:**
- ✅ Good architectural intent (hook separation)
- ✅ Some optimizations (RAF for timer, memoization attempts)
- ✅ Clear separation of concerns in design

**What Phase 1 Failed:**
- ❌ Incomplete integration (hooks created but not used)
- ❌ Introduced memory leaks (duplicate listeners)
- ❌ Left dead code in codebase
- ❌ Timer still causes unnecessary re-renders
- ❌ Broken memoization defeats purpose

**Verdict:** ⚠️ **INCOMPLETE** - Fix critical issues before Phase 2.

**Estimated Fix Time:** 4-6 hours for Priority 1 & 2 fixes.

---

*End of Audit Report*
