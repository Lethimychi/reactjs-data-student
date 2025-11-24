# 🚨 ISSUE: Continuous API Calls - ROOT CAUSE & SOLUTION

## Problem Identified

**API calls are running infinitely (liên tục)** because of a **bad dependency array** in the first custom hook.

---

## Root Cause

### ❌ THE BUG (Line 80)
```typescript
// ❌ WRONG - Inside the hook (created new every time)
export const useStudentInfoFetch = () => {
  const EMPTY_STUDENT = createEmptyStudent();  // 🚨 Creates NEW object each render!
  
  useEffect(() => {
    // API call...
  }, [EMPTY_STUDENT]);  // 🚨 This changes every render → API calls infinitely!
}
```

### Why This Happens

1. `EMPTY_STUDENT` is created **inside the component** 
2. Every time the component renders, `EMPTY_STUDENT` is a **brand new object** `{}`
3. JavaScript compares objects by **reference**, not by value
4. `[EMPTY_STUDENT]` is a different object each time
5. useEffect sees a "changed dependency" → **runs the effect again**
6. The effect calls the API → **component re-renders**
7. **Back to step 1** → Infinite loop! 🔄

```
Render 1: EMPTY_STUDENT = {} (object A)
  useEffect runs (empty A) → API call → re-render

Render 2: EMPTY_STUDENT = {} (object B) - DIFFERENT OBJECT!
  useEffect sees new dependency → runs again → API call → re-render
  
Render 3: EMPTY_STUDENT = {} (object C) - DIFFERENT OBJECT!
  → Infinite loop! 🔄🔄🔄
```

---

## ✅ THE FIX

Move `EMPTY_STUDENT` **outside the hook** (to module level):

```typescript
// ✅ CORRECT - Created ONCE at module load
const EMPTY_STUDENT = createEmptyStudent();

export const useStudentInfoFetch = () => {
  const [currentStudent, setCurrentStudent] = useState<Student>(EMPTY_STUDENT);
  
  useEffect(() => {
    // API call...
  }, []);  // ✅ Empty array = runs ONCE on mount, never again
}
```

### Why This Works

1. `EMPTY_STUDENT` created **once when module loads**
2. Same object reference for every component render
3. Dependency array stays consistent
4. useEffect runs **only once** ✅
5. No infinite loop! ✅

---

## How to Stop Infinite API Calls

### ✅ Already Fixed!
I've already fixed line 80 in `useStudentDashboard.ts`:

```typescript
// ✅ MOVED OUTSIDE - Now created once
const EMPTY_STUDENT = createEmptyStudent();

export const useStudentInfoFetch = () => {
  const [currentStudent, setCurrentStudent] = useState<Student>(EMPTY_STUDENT);
  
  useEffect(() => {
    // Runs ONCE on mount
  }, []);  // ✅ Fixed!
}
```

---

## Verification

Check that API calls now happen **only once** when page loads:

1. **Open DevTools** (F12)
2. Go to **Network tab**
3. **Reload page** 
4. Look for API calls
5. Should see: **1 call per API** ✅
6. Should NOT see: **continuous calling** ❌

---

## Dependency Array Rules

### 🟢 CORRECT PATTERNS

```typescript
// 1. Run once on mount
useEffect(() => {
  // API call - runs 1 time
}, []);

// 2. Run when specific value changes
useEffect(() => {
  // Runs when userId changes
}, [userId]);

// 3. Run when multiple values change
useEffect(() => {
  // Runs when either changes
}, [semester, studentId]);
```

### 🔴 WRONG PATTERNS

```typescript
// ❌ WRONG: Object created each render
useEffect(() => {
  // API call - runs EVERY render!
}, [{ id: 1 }]);  // New object each time!

// ❌ WRONG: Missing dependency
useEffect(() => {
  console.log(userId);  // userId is used but not listed!
}, []);  // Should include userId

// ❌ WRONG: Variable created in hook
export const useMyHook = () => {
  const config = createConfig();  // New each time!
  
  useEffect(() => {
    // Runs infinitely
  }, [config]);  // config changes every render
}
```

---

## Summary: What Was Wrong & What I Fixed

| Item | Before | After | Status |
|------|--------|-------|--------|
| **EMPTY_STUDENT location** | Inside hook (recreated every render) | Outside hook (created once) | ✅ FIXED |
| **Dependency array** | `[EMPTY_STUDENT]` | `[]` | ✅ FIXED |
| **API calls** | Infinite loop (liên tục) | Once on mount | ✅ FIXED |
| **Performance** | 🔴 Terrible | 🟢 Optimal | ✅ IMPROVED |

---

## Next Steps

1. **Test it**: Reload page, check Network tab
2. **Verify**: API calls should be finite, not continuous
3. **Monitor**: Open DevTools Console to see logs
4. **Report**: Tell me if API calls still happen infinitely

---

## Prevention Tips

Always ask yourself for each useEffect:

```
🤔 Should this dependency be here?
   ↓
   Is it created inside the hook? → Move it outside!
   Is it an object/array? → Check if it changes every render
   Is it used in the effect? → Must be in dependency array
   ↓
✅ If unsure, use a linter - install eslint-plugin-react-hooks
```

**The fix is already applied. The API calls should now stop being continuous!** ✅
