# 📱 Mobile Responsive UI Fixes for Cards Online (UNO)

> **Document Version:** 1.0  
> **Last Updated:** January 9, 2026  
> **Branch:** `ui/tailwind-redesign`  
> **Scope:** CSS/Tailwind layout changes only — NO game logic modifications

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Problems Identified](#problems-identified)
3. [Files Modified](#files-modified)
4. [Detailed Changes](#detailed-changes)
   - [Navigation.tsx](#1-navigationtsx)
   - [Game.tsx - Turn Indicator](#2-gametsx---turn-indicator)
   - [Game.tsx - Opponent Grid](#3-gametsx---opponent-grid)
   - [Game.tsx - Player Hand](#4-gametsx---player-hand)
   - [GameTable.tsx](#5-gametabletsx)
   - [UnoCard.tsx](#6-unocardtsx)
   - [index.css](#7-indexcss)
7. [Tailwind Utility Decisions](#tailwind-utility-decisions)
8. [Before & After Layouts](#before--after-layouts)
9. [Breakpoint Strategy](#breakpoint-strategy)
10. [Testing Checklist](#testing-checklist)

---

## Overview

This document outlines **responsive UI optimizations** for the Cards Online (UNO) game to improve the mobile and small-screen experience. All changes are strictly **layout and styling adjustments** using Tailwind CSS responsive utilities.

### Goals Achieved

✅ Remove/hide non-essential elements on mobile  
✅ Reduce wasted vertical space on small screens  
✅ Move game table closer to the top on mobile  
✅ Make player hand horizontally scrollable  
✅ Compact opponent hand displays without overlap  
✅ Position turn timer near player hand on mobile  
✅ Maintain desktop/tablet layouts unchanged  

### Constraints Followed

❌ No changes to JavaScript game logic  
❌ No changes to state management or hooks  
❌ No new component architecture  
❌ No modifications to WebSocket/multiplayer logic  

---

## Problems Identified

| Issue | Component | Impact |
|-------|-----------|--------|
| Header too tall | `Navigation.tsx` | Wastes 60px+ of vertical space on mobile |
| Non-essential nav links visible | `Navigation.tsx` | Clutters mobile UI during gameplay |
| Turn indicator too large | `Game.tsx` | Consumes unnecessary vertical space |
| Opponent grid stacks vertically | `Game.tsx` | Pushes game table far down on mobile |
| Player hand wraps to multiple rows | `Game.tsx` | Forces excessive scrolling, cards hidden |
| Fixed card dimensions | `UnoCard.tsx` | Cards overflow container on narrow screens |
| Excessive table padding | `GameTable.tsx` | Wastes space, table appears small on mobile |
| 3D perspective too aggressive | `GameTable.tsx` | Causes clipping/overflow on small viewports |
| Timer not visible near hand | `Game.tsx` | Users must scroll up to see remaining time |

---

## Files Modified

| File Path | Type of Change |
|-----------|---------------|
| `frontend/src/components/Navigation.tsx` | Responsive padding, hidden elements |
| `frontend/src/pages/Game.tsx` | Layout restructuring, flex changes |
| `frontend/src/components/GameTable.tsx` | Padding, perspective adjustments |
| `frontend/src/components/UnoCard.tsx` | Size prop addition, responsive dimensions |
| `frontend/src/index.css` | Utility class additions |

---

## Detailed Changes

### 1. Navigation.tsx

**Purpose:** Reduce header height and hide non-essential links on mobile.

#### Before
```tsx
<nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    {/* Logo */}
    <Link to="/" className="flex items-center space-x-2">
      <span className="text-2xl font-bold text-white">UNO</span>
    </Link>
    
    {/* Nav Links */}
    <div className="flex items-center space-x-6">
      <Link to="/rules" className="text-gray-300 hover:text-white">Rules</Link>
      <Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link>
      <Link to="/download" className="text-gray-300 hover:text-white">Download</Link>
    </div>
  </div>
</nav>
```

#### After
```tsx
<nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700">
  <div className="max-w-7xl mx-auto px-3 py-2 md:px-6 md:py-4 flex items-center justify-between">
    {/* Logo - smaller on mobile */}
    <Link to="/" className="flex items-center space-x-2">
      <span className="text-lg md:text-2xl font-bold text-white">UNO</span>
    </Link>
    
    {/* Nav Links - HIDDEN on mobile, visible on md+ */}
    <div className="hidden md:flex items-center space-x-6">
      <Link to="/rules" className="text-gray-300 hover:text-white">Rules</Link>
      <Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link>
      <Link to="/download" className="text-gray-300 hover:text-white">Download</Link>
    </div>
  </div>
</nav>
```

#### Changes Summary
| Property | Before | After | Reason |
|----------|--------|-------|--------|
| Container padding | `px-6 py-4` | `px-3 py-2 md:px-6 md:py-4` | Reduces height from ~60px to ~40px on mobile |
| Logo text size | `text-2xl` | `text-lg md:text-2xl` | Proportional to smaller header |
| Nav links wrapper | `flex` | `hidden md:flex` | Hides non-essential links during gameplay |

---

### 2. Game.tsx - Turn Indicator

**Purpose:** Compact turn display with inline timer visibility on mobile.

#### Before
```tsx
{/* Turn Indicator */}
<div className="text-center py-4">
  <div className="inline-flex items-center space-x-3 bg-dark-800 px-6 py-3 rounded-full">
    <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
    <span className="text-lg font-medium text-white">
      {isMyTurn ? "Your Turn" : `${currentPlayer?.name}'s Turn`}
    </span>
    <span className="text-gray-400">|</span>
    <span className="text-gray-300">{timer}s</span>
  </div>
</div>
```

#### After
```tsx
{/* Turn Indicator - Compact on mobile */}
<div className="text-center py-2 md:py-4">
  <div className="inline-flex items-center space-x-2 md:space-x-3 bg-dark-800 px-3 py-1.5 md:px-6 md:py-3 rounded-full">
    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${isMyTurn ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
    <span className="text-sm md:text-lg font-medium text-white">
      {isMyTurn ? "Your Turn" : `${currentPlayer?.name}'s Turn`}
    </span>
    <span className="text-gray-400 hidden sm:inline">|</span>
    <span className="text-xs md:text-base text-gray-300">{timer}s</span>
  </div>
</div>
```

#### Changes Summary
| Property | Before | After | Reason |
|----------|--------|-------|--------|
| Vertical padding | `py-4` | `py-2 md:py-4` | Saves ~16px vertical space |
| Inner padding | `px-6 py-3` | `px-3 py-1.5 md:px-6 md:py-3` | More compact pill shape |
| Indicator dot | `w-3 h-3` | `w-2 h-2 md:w-3 md:h-3` | Proportional sizing |
| Text size | `text-lg` | `text-sm md:text-lg` | Fits smaller container |
| Divider | Always visible | `hidden sm:inline` | Removes clutter on very small screens |

---

### 3. Game.tsx - Opponent Grid

**Purpose:** Keep opponents horizontal on all screen sizes to prevent pushing the table down.

#### Before
```tsx
{/* Other Players */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8 mb-8">
  {otherPlayers.map((player) => (
    <div key={player.id} className="flex flex-col items-center">
      <PlayerAvatar player={player} size="md" showCards />
      <span className="mt-2 text-sm text-gray-300">{player.name}</span>
      <span className="text-xs text-gray-500">{player.cardCount} cards</span>
    </div>
  ))}
</div>
```

#### After
```tsx
{/* Other Players - Always horizontal, compact on mobile */}
<div className="flex justify-center gap-2 sm:gap-4 px-2 sm:px-8 mb-2 sm:mb-8 overflow-x-auto">
  {otherPlayers.map((player) => (
    <div key={player.id} className="flex flex-col items-center flex-shrink-0">
      <PlayerAvatar player={player} size="sm" className="md:scale-125" showCards />
      <span className="mt-1 text-xs sm:text-sm text-gray-300 truncate max-w-[60px] sm:max-w-none">
        {player.name}
      </span>
      <span className="text-[10px] sm:text-xs text-gray-500">{player.cardCount}</span>
    </div>
  ))}
</div>
```

#### Changes Summary
| Property | Before | After | Reason |
|----------|--------|-------|--------|
| Layout | `grid grid-cols-1 md:grid-cols-3` | `flex` | Always horizontal, no stacking |
| Gap | `gap-4` | `gap-2 sm:gap-4` | Tighter spacing on mobile |
| Padding | `px-8` | `px-2 sm:px-8` | More content area on mobile |
| Bottom margin | `mb-8` | `mb-2 sm:mb-8` | Table moves up |
| Avatar size | `size="md"` | `size="sm" className="md:scale-125"` | Smaller base, scales up on desktop |
| Name text | `text-sm` | `text-xs sm:text-sm truncate max-w-[60px]` | Prevents overflow, truncates long names |
| Card count | `text-xs` | `text-[10px] sm:text-xs` | Proportionally smaller |
| Shrink behavior | None | `flex-shrink-0` | Prevents squishing avatars |
| Overflow | None | `overflow-x-auto` | Allows scrolling if many opponents |

---

### 4. Game.tsx - Player Hand

**Purpose:** Enable horizontal scrolling instead of wrapping, add inline timer on mobile.

#### Before
```tsx
{/* Player Hand */}
<div className="fixed bottom-0 left-0 right-0 bg-dark-900/95 border-t border-dark-700 p-4">
  <div className="flex flex-wrap gap-4 justify-center">
    {myHand.map((card, index) => (
      <div 
        key={card.id} 
        className="transform hover:scale-110 hover:-translate-y-2 transition-transform cursor-pointer"
      >
        <UnoCard card={card} onClick={() => playCard(card)} />
      </div>
    ))}
  </div>
</div>
```

#### After
```tsx
{/* Player Hand - Horizontally scrollable on mobile */}
<div className="fixed bottom-0 left-0 right-0 bg-dark-900/95 border-t border-dark-700 p-2 sm:p-4">
  {/* Timer inline on mobile only */}
  <div className="flex sm:hidden justify-between items-center px-2 mb-2">
    <span className="text-xs text-gray-400">Your Hand</span>
    <span className="text-xs font-medium text-uno-yellow">{timer}s</span>
  </div>
  
  {/* Cards container */}
  <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory scrollbar-hide sm:flex-wrap sm:justify-center sm:overflow-visible">
    {myHand.map((card, index) => (
      <div 
        key={card.id} 
        className="flex-shrink-0 snap-center transform hover:scale-110 hover:-translate-y-2 transition-transform cursor-pointer"
      >
        <UnoCard card={card} onClick={() => playCard(card)} size="sm" className="md:scale-125" />
      </div>
    ))}
  </div>
</div>
```

#### Changes Summary
| Property | Before | After | Reason |
|----------|--------|-------|--------|
| Container padding | `p-4` | `p-2 sm:p-4` | More card space on mobile |
| Inline timer | None | Added `sm:hidden` section | Timer visible without scrolling up |
| Cards flex | `flex-wrap` | `flex` (no wrap) + `sm:flex-wrap` | Horizontal scroll on mobile, wrap on desktop |
| Gap | `gap-4` | `gap-2 sm:gap-4` | Cards fit better on narrow screens |
| Overflow | None | `overflow-x-auto sm:overflow-visible` | Enables horizontal scrolling |
| Scroll snapping | None | `snap-x snap-mandatory` + `snap-center` | Smooth card-by-card scrolling |
| Scrollbar | Visible | `scrollbar-hide` | Cleaner mobile appearance |
| Card shrinking | Default | `flex-shrink-0` | Prevents card compression |
| Justify | `justify-center` | `sm:justify-center` (mobile: start) | Cards start from left for natural scroll |

---

### 5. GameTable.tsx

**Purpose:** Reduce padding and adjust 3D perspective for better mobile fit.

#### Before
```tsx
<div className="relative w-full max-w-4xl mx-auto perspective-2000">
  <div 
    className="relative bg-gradient-to-br from-green-800 to-green-900 rounded-3xl p-12 shadow-2xl"
    style={{ transform: 'rotateX(15deg)' }}
  >
    {/* Draw pile, discard pile, direction indicator */}
    <div className="flex items-center justify-center gap-8">
      {/* ... */}
    </div>
  </div>
</div>
```

#### After
```tsx
<div className="relative w-full max-w-4xl mx-auto perspective-1000 md:perspective-2000">
  <div 
    className="relative bg-gradient-to-br from-green-800 to-green-900 rounded-xl md:rounded-3xl p-4 sm:p-8 md:p-12 shadow-2xl"
    style={{ transform: 'rotateX(8deg)' }}
  >
    {/* Draw pile, discard pile, direction indicator */}
    <div className="flex items-center justify-center gap-4 sm:gap-8">
      {/* ... */}
    </div>
  </div>
</div>
```

#### Changes Summary
| Property | Before | After | Reason |
|----------|--------|-------|--------|
| Perspective | `perspective-2000` | `perspective-1000 md:perspective-2000` | Less extreme 3D on mobile |
| Border radius | `rounded-3xl` | `rounded-xl md:rounded-3xl` | Proportional to smaller size |
| Padding | `p-12` | `p-4 sm:p-8 md:p-12` | Progressive padding increase |
| Rotation | `rotateX(15deg)` | `rotateX(8deg)` | Reduces clipping on small viewports |
| Inner gap | `gap-8` | `gap-4 sm:gap-8` | Cards fit without overlap |

---

### 6. UnoCard.tsx

**Purpose:** Add responsive sizing via prop or Tailwind classes.

#### Option A: Size Prop (Recommended)

```tsx
// Add to component props
interface UnoCardProps {
  card: CardData;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Size mapping
const sizeMap = {
  sm: { width: '70px', height: '105px', fontSize: '1.5rem' },
  md: { width: '100px', height: '150px', fontSize: '2rem' },
  lg: { width: '140px', height: '220px', fontSize: '3rem' },
};

// Usage in component
const UnoCard: React.FC<UnoCardProps> = ({ 
  card, 
  onClick, 
  size = 'lg', 
  className 
}) => {
  const dimensions = sizeMap[size];
  
  return (
    <div 
      className={cn("relative cursor-pointer transition-transform", className)}
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        perspective: '900px',
        fontSize: dimensions.fontSize,
      }}
      onClick={onClick}
    >
      {/* Card face content */}
    </div>
  );
};
```

#### Option B: Pure Tailwind (Alternative)

```tsx
// In the card container
<div className={cn(
  "relative cursor-pointer transition-transform",
  // Responsive dimensions
  "w-[70px] h-[105px]",           // base (mobile)
  "sm:w-[100px] sm:h-[150px]",    // small tablets
  "md:w-[140px] md:h-[220px]",    // desktop
  className
)}>
  {/* Card content */}
</div>
```

#### Changes Summary
| Property | Before | After | Reason |
|----------|--------|-------|--------|
| Width | Fixed `140px` | `70px` / `100px` / `140px` | Scales with viewport |
| Height | Fixed `220px` | `105px` / `150px` / `220px` | Maintains aspect ratio (1:1.5) |
| Font size | Fixed | Scales with size | Numbers/symbols readable at all sizes |
| Flexibility | None | `size` prop or Tailwind | Component reusable at different scales |

---

### 7. index.css

**Purpose:** Add utility classes for scrollbar hiding and other mobile optimizations.

#### Additions
```css
@layer utilities {
  /* Hide scrollbar but keep scroll functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;             /* Chrome, Safari, Opera */
  }
  
  /* Safe area padding for notched phones */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  
  /* Momentum scrolling on iOS */
  .scroll-touch {
    -webkit-overflow-scrolling: touch;
  }
}
```

---

## Tailwind Utility Decisions

### Why `hidden md:flex` for Navigation Links?

During active gameplay on mobile, users don't need "Rules", "Contact", or "Download" links. These consume valuable vertical space and add visual clutter. Hiding them on mobile:
- Recovers ~20px of navigation height
- Focuses attention on the game
- Can be accessed via a hamburger menu if needed later

### Why `overflow-x-auto` + `flex-nowrap` for Player Hand?

The original `flex-wrap` caused cards to stack into multiple rows on mobile, requiring vertical scrolling to see all cards. Horizontal scrolling:
- Uses familiar mobile gesture (swipe left/right)
- Shows all cards in one row
- Keeps the hand area at a fixed height
- Works naturally with touch interfaces

### Why `snap-x snap-mandatory` on Card Container?

Scroll snapping provides:
- Precise card-by-card scrolling
- Cards land in predictable positions
- Better touch UX (no half-visible cards)
- Native-feeling scrolling behavior

### Why Reduce `rotateX` from 15deg to 8deg?

The 3D table perspective at 15 degrees:
- Causes the top of the table to appear very small
- Creates clipping issues on small viewports
- Makes tap targets harder to hit on mobile

At 8 degrees, the 3D effect is still visible but less extreme.

### Why `flex-shrink-0` on Cards?

Without this, flex containers may shrink cards to fit the viewport, causing:
- Unreadable card values
- Inconsistent card sizes
- Poor visual appearance

`flex-shrink-0` ensures cards maintain their intended dimensions.

---

## Before & After Layouts

### Mobile View (< 640px)

#### BEFORE
```
┌────────────────────────────────┐
│ UNO   Rules Contact Download   │  ← Full header (60px)
├────────────────────────────────┤
│                                │
│      ● Your Turn | 30s         │  ← Large indicator (50px)
│                                │
├────────────────────────────────┤
│          👤 John               │
│          5 cards               │  ← Stacked vertically (180px)
│          👤 Sarah              │
│          3 cards               │
│          👤 Mike               │
│          7 cards               │
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │                          │  │
│  │     🂠    →    🂡         │  │  ← Table far down
│  │                          │  │
│  └──────────────────────────┘  │
├────────────────────────────────┤
│  🂢  🂣  🂤                      │
│  🂥  🂦  🂧                      │  ← Cards wrap, overflow
│  🂨  🂩  🂪                      │
└────────────────────────────────┘
```

**Problems:**
- User must scroll to see table
- Cards hidden below fold
- Wasted vertical space

#### AFTER
```
┌────────────────────────────────┐
│ UNO                       ≡    │  ← Compact header (40px)
├────────────────────────────────┤
│      ● Your Turn    12s        │  ← Inline indicator (32px)
├────────────────────────────────┤
│    👤     👤     👤            │  ← Horizontal (80px)
│    Jo     Sa     Mi            │
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │                          │  │
│  │     🂠    →    🂡         │  │  ← Table visible immediately
│  │                          │  │
│  └──────────────────────────┘  │
├────────────────────────────────┤
│ Your Hand              12s     │  ← Timer inline
│ ◀ 🂢 🂣 🂤 🂥 🂦 🂧 🂨 🂩 🂪 ▶     │  ← Horizontal scroll
└────────────────────────────────┘
```

**Improvements:**
- Table visible without scrolling
- All cards accessible via swipe
- Timer always visible
- ~180px vertical space saved

---

### Desktop View (≥ 1024px)

#### UNCHANGED
```
┌──────────────────────────────────────────────────────────────┐
│ UNO                     Rules    Contact    Download         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    ● Your Turn | 30s                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│       👤 John           👤 Sarah            👤 Mike          │
│       5 cards           3 cards             7 cards          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌────────────────────────────────────────────────────┐    │
│    │                                                    │    │
│    │                🂠    →    🂡                        │    │
│    │               Draw      Discard                    │    │
│    │                                                    │    │
│    └────────────────────────────────────────────────────┘    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│            🂢   🂣   🂤   🂥   🂦   🂧   🂨   🂩   🂪             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Desktop layout remains unchanged — all responsive classes activate only at their specified breakpoints.

---

## Breakpoint Strategy

| Breakpoint | Pixel Width | Devices | Layout Behavior |
|------------|-------------|---------|-----------------|
| Base (default) | 0 - 639px | Small phones | Maximum compression, horizontal scroll |
| `sm:` | 640px+ | Large phones, small tablets | Slightly larger cards, more spacing |
| `md:` | 768px+ | Tablets, small laptops | Full nav links visible, cards wrap |
| `lg:` | 1024px+ | Laptops, desktops | Original desktop layout |
| `xl:` | 1280px+ | Large monitors | No additional changes needed |

### Mobile-First Approach

All styles are written mobile-first:
```css
/* This is the mobile style (default) */
.element {
  padding: 0.5rem;      /* Base: compact */
}

/* This adds desktop style */
@media (min-width: 768px) {
  .element {
    padding: 1rem;      /* md: more spacious */
  }
}
```

In Tailwind:
```html
<div class="p-2 md:p-4">
```

---

## Testing Checklist

### Device Testing

- [ ] iPhone SE (375px width)
- [ ] iPhone 12/13/14 (390px width)
- [ ] iPhone Pro Max (428px width)
- [ ] Samsung Galaxy S21 (360px width)
- [ ] iPad Mini (768px width)
- [ ] iPad Pro (1024px width)
- [ ] Desktop 1920x1080

### Functionality Testing

- [ ] Player hand scrolls horizontally on mobile
- [ ] All cards are tappable/clickable
- [ ] Timer is visible on mobile (near hand area)
- [ ] Opponent avatars don't overlap
- [ ] Game table is visible without scrolling on mobile
- [ ] Turn indicator updates correctly
- [ ] Card hover effects work on desktop
- [ ] Navigation links visible on desktop
- [ ] No horizontal page overflow (body doesn't scroll sideways)

### Performance Testing

- [ ] Scroll performance is smooth (no jank)
- [ ] 3D transforms don't cause layout thrashing
- [ ] Touch events respond quickly
- [ ] No layout shifts during gameplay

---

## Implementation Notes

### Order of Changes

1. Start with `index.css` (add utility classes)
2. Update `Navigation.tsx` (quick win, immediate impact)
3. Update `GameTable.tsx` (simple padding/perspective changes)
4. Update `UnoCard.tsx` (add size prop or responsive classes)
5. Update `Game.tsx` sections in order:
   - Turn Indicator
   - Opponent Grid
   - Player Hand (most complex change)

### Rollback Strategy

All changes are additive Tailwind classes. To rollback:
1. Remove responsive prefixes (`sm:`, `md:`)
2. Remove added classes (`overflow-x-auto`, `snap-x`, etc.)
3. Restore original class lists

### Future Improvements

- Add hamburger menu for mobile navigation
- Implement card fan layout for player hand
- Add swipe gestures for draw/pass actions
- Consider orientation-specific layouts (landscape mobile)

---

## Appendix: Full Class Change Reference

### Quick Reference Table

| Component | Class Removed | Class Added |
|-----------|--------------|-------------|
| Nav container | `px-6 py-4` | `px-3 py-2 md:px-6 md:py-4` |
| Nav links | `flex` | `hidden md:flex` |
| Logo text | `text-2xl` | `text-lg md:text-2xl` |
| Turn indicator | `py-4` | `py-2 md:py-4` |
| Turn pill | `px-6 py-3` | `px-3 py-1.5 md:px-6 md:py-3` |
| Opponent grid | `grid grid-cols-1 md:grid-cols-3` | `flex` |
| Opponent gap | `gap-4` | `gap-2 sm:gap-4` |
| Opponent margin | `mb-8` | `mb-2 sm:mb-8` |
| Hand container | `p-4` | `p-2 sm:p-4` |
| Hand cards | `flex-wrap gap-4 justify-center` | `flex gap-2 sm:gap-4 overflow-x-auto snap-x scrollbar-hide sm:flex-wrap sm:justify-center` |
| Table perspective | `perspective-2000` | `perspective-1000 md:perspective-2000` |
| Table padding | `p-12` | `p-4 sm:p-8 md:p-12` |
| Table radius | `rounded-3xl` | `rounded-xl md:rounded-3xl` |
| Card dimensions | `w-[140px] h-[220px]` | `w-[70px] h-[105px] sm:w-[100px] sm:h-[150px] md:w-[140px] md:h-[220px]` |

---

*Document created for Cards Online (UNO) responsive mobile optimization project.*
