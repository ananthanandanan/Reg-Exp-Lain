# Reg-Exp-Lain — UI/UX Redesign Specification

**Version:** 2.0  
**Scope:** Visual design, colour system, typography, layout, and component reference for engineers and designers implementing the redesign.

---

## Table of Contents

1. [Design Direction](#1-design-direction)
2. [Colour System](#2-colour-system)
3. [Typography](#3-typography)
4. [Layout](#4-layout)
5. [Component Specifications](#5-component-specifications)
6. [Flow Graph — Node & Edge Specs](#6-flow-graph--node--edge-specs)
7. [Explanation Panel](#7-explanation-panel)
8. [Canvas Toolbar](#8-canvas-toolbar)
9. [Minimap](#9-minimap)
10. [CSS Custom Properties — Full Reference](#10-css-custom-properties--full-reference)
11. [Google Fonts Import](#11-google-fonts-import)
12. [Interaction & Motion](#12-interaction--motion)
13. [Scrollbar Styling](#13-scrollbar-styling)

---

## 1. Design Direction

The redesign targets a refined developer-tool aesthetic — precision, density, and information hierarchy over decoration. The governing principles are:

- **Dark-first.** The entire interface runs on a near-black deep navy canvas. No light variants are provided.
- **Monospace as personality.** JetBrains Mono carries all code, labels, and structural text — it is the dominant typeface.
- **One accent colour.** Violet-purple (`#7C5CFC`) is used exclusively for selection, active state, step cursor, and interactive feedback. It never appears decoratively.
- **Semantic colour only.** Green = match/pass. Red = fail/stop. Amber = character class. Blue = literal. Colours carry meaning and never appear out of that context.
- **Thin, precise borders.** 1px lines at low opacity. No drop shadows, no blurs — except a single subtle purple glow (`0 0 16px #7C5CFC22`) on the selected node.

---

## 2. Colour System

All colours are defined as CSS custom properties on `:root`. Every component must consume colours through variables — never hardcoded hex values in component CSS.

### 2.1 Background Scale

| Name | Hex       | CSS Variable | Usage                           |
| ---- | --------- | ------------ | ------------------------------- |
| bg0  | `#07090F` | `--bg0`      | Page / canvas background        |
| bg1  | `#0B0E1A` | `--bg1`      | Left panel, explanation panel   |
| bg2  | `#0F1220` | `--bg2`      | Flow node default fill          |
| bg3  | `#141828` | `--bg3`      | Hover backgrounds, toolbar fill |
| bg4  | `#1A1F33` | `--bg4`      | Active state overlay            |

### 2.2 Border Scale

| Name    | Hex       | CSS Variable | Usage                           |
| ------- | --------- | ------------ | ------------------------------- |
| border  | `#1E2438` | `--border`   | Default dividers, section lines |
| border2 | `#262D45` | `--border2`  | Node borders, input borders     |
| border3 | `#323A56` | `--border3`  | Hover border emphasis           |

### 2.3 Text Scale

| Name  | Hex       | CSS Variable | Usage                               |
| ----- | --------- | ------------ | ----------------------------------- |
| text0 | `#E8ECF8` | `--text0`    | Headlines, selected node text       |
| text1 | `#B0B8D8` | `--text1`    | Body text, default input text       |
| text2 | `#6E7898` | `--text2`    | Secondary labels, node default      |
| text3 | `#3E4560` | `--text3`    | Tertiary — section labels, disabled |

### 2.4 Accent — Purple

| Name          | Hex       | CSS Variable      | Usage                                             |
| ------------- | --------- | ----------------- | ------------------------------------------------- |
| purple        | `#7C5CFC` | `--purple`        | Focus rings, step cursor dot, active debug fill   |
| purple-dim    | `#4A38A8` | `--purple-dim`    | Loop-arc stroke, selected node border             |
| purple-bg     | `#12103A` | `--purple-bg`     | Selected node fill, explanation badge bg          |
| purple-border | `#2E2468` | `--purple-border` | Selected node ring, badge border                  |
| purple-text   | `#C4B5FD` | `--purple-text`   | Selected node label, badge text, active flag chip |

### 2.5 Semantic Colours

| Name         | Hex       | CSS Variable     | Usage                                      |
| ------------ | --------- | ---------------- | ------------------------------------------ |
| green        | `#34D399` | `--green`        | Match label, start node text               |
| green-bg     | `#082018` | `--green-bg`     | Safe input bg, start node bg               |
| green-border | `#134028` | `--green-border` | Safe input border, start node ring         |
| green-text   | `#6EE7B7` | `--green-text`   | Result badge foreground (ok)               |
| red          | `#F87171` | `--red`          | Deny label, end node text, stop button     |
| red-bg       | `#200810` | `--red-bg`       | Denied input bg, end node bg               |
| red-border   | `#401020` | `--red-border`   | Denied input border, end node ring         |
| red-text     | `#FCA5A5` | `--red-text`     | Result badge foreground (fail)             |
| amber        | `#FBBF24` | `--amber`        | Character class node text                  |
| amber-bg     | `#1A1200` | `--amber-bg`     | Character class node bg (subtle)           |
| blue-text    | `#93C5FD` | `--blue-text`    | Regex textarea text, literals, code blocks |

---

## 3. Typography

### 3.1 Font Families

| Role       | Family             | Weights         | Usage                                                                                     |
| ---------- | ------------------ | --------------- | ----------------------------------------------------------------------------------------- |
| Display/UI | **Syne**           | 400 500 600     | App title, section headings, body copy, button labels, descriptions                       |
| Monospace  | **JetBrains Mono** | 300 400 500 600 | Regex input, node labels, test inputs, debug string, code blocks, flag chips, prop values |
| Fallback   | system monospace   | —               | `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`                               |

### 3.2 Type Scale

| Element          | Size   | Family         | Weight | Colour                      | Notes                               |
| ---------------- | ------ | -------------- | ------ | --------------------------- | ----------------------------------- |
| App title        | 14px   | Syne           | 600    | `--text0`                   |                                     |
| Section label    | 9px    | JetBrains Mono | 400    | `--text3`                   | Uppercase, letter-spacing: 0.12em   |
| Body copy        | 12px   | Syne           | 400    | `--text1`                   | line-height: 1.6                    |
| Explanation text | 11.5px | Syne           | 400    | `--text2`                   | line-height: 1.75                   |
| Node label       | 11px   | JetBrains Mono | 400    | Contextual                  | Varies by node variant              |
| Test input       | 11.5px | JetBrains Mono | 400    | `--text1`                   |                                     |
| Debug string     | 11px   | JetBrains Mono | 400    | `--text3` / white           | Cursor char uses white on purple bg |
| Result badge     | 9.5px  | JetBrains Mono | 500    | Semantic                    |                                     |
| Flag chip        | 10px   | JetBrains Mono | 400    | `--text3` / `--purple-text` |                                     |
| Tab              | 10.5px | JetBrains Mono | 400    | `--text3` / `--purple-text` | letter-spacing: 0.03em              |
| Canvas toolbar   | 9px    | JetBrains Mono | 400    | `--text3`                   | Uppercase, letter-spacing: 0.10em   |
| Prop table key   | 10.5px | JetBrains Mono | 400    | `--text3`                   |                                     |
| Prop table value | 10.5px | JetBrains Mono | 400    | `--purple-text`             |                                     |
| Code block       | 12px   | JetBrains Mono | 400    | `--blue-text`               |                                     |
| Version badge    | 9px    | JetBrains Mono | 400    | `--text3`                   | letter-spacing: 0.05em              |

---

## 4. Layout

### 4.1 Top-Level Grid

The app fills `100vw × 100vh` with no scrolling at the top level.

```css
.app {
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: 100vh;
  height: 100vh;
  overflow: hidden;
}
```

### 4.2 Left Panel — 300px fixed

Vertically stacked flex column. Internal sections use `flex-shrink: 0` except the test section which takes `flex: 1` with `overflow-y: auto`.

| Property      | Value                                                    |
| ------------- | -------------------------------------------------------- |
| Width         | `300px` — fixed, does not resize                         |
| Background    | `var(--bg1)`                                             |
| Right border  | `1px solid var(--border)`                                |
| Overflow      | `hidden` on the column; `auto` on the test section only  |
| Section order | Header → Editor → Tabs → Test/Batch/Flags → Debug Footer |

### 4.3 Right Panel — fluid

Flex column. Canvas takes `flex: 1`. The explanation panel overlays the canvas as `position: absolute`.

| Property          | Value                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| Background        | `var(--bg0)`                                                                 |
| Canvas background | `var(--bg0)` with 24px radial dot grid                                       |
| Dot grid          | `radial-gradient(circle at 1px 1px, #1E2438 1px, transparent 0) / 24px 24px` |
| Explanation panel | 268px wide, `position: absolute; right: 0; top: 0; bottom: 0; z-index: 10`   |
| Panel background  | `var(--bg1)`, `border-left: 1px solid var(--border)`                         |
| Panel open/close  | `transform: translateX(0)` / `translateX(100%)`, `transition: 0.2s ease`     |

### 4.4 Spacing System

| Property          | Value                                                 |
| ----------------- | ----------------------------------------------------- |
| Component padding | 12px–16px horizontal, 8px–14px vertical               |
| Section dividers  | `1px solid var(--border)`                             |
| Node internal pad | 6px top/bottom, 12px left/right                       |
| Connector width   | 24px                                                  |
| Gap between nodes | 2px (connector included)                              |
| Minimap position  | `bottom: 14px; right: 282px` (268px panel + 14px gap) |

---

## 5. Component Specifications

### 5.1 Header

| Property      | Value                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Height        | ~52px                                                                                                                     |
| Logo          | 26×26px, `border-radius: 7px`, `background: linear-gradient(135deg, #7C5CFC, #4A38A8)`, `box-shadow: 0 0 12px #7C5CFC30`  |
| Logo letter   | Syne 600 12px `#E8E0FF`                                                                                                   |
| App title     | Syne 600 14px `var(--text0)`                                                                                              |
| Version badge | `bg: var(--bg3)`, `border: 1px solid var(--border2)`, 9px JetBrains Mono, `letter-spacing: 0.05em`, `border-radius: 20px` |

### 5.2 Regex Textarea

| Property     | Value                                                  |
| ------------ | ------------------------------------------------------ |
| Background   | `var(--bg0)`                                           |
| Border       | `1px solid var(--border2)`, `border-radius: 6px`       |
| Focus border | `var(--purple-dim)`                                    |
| Focus shadow | `0 0 0 1px var(--purple-bg), inset 0 0 20px #7C5CFC08` |
| Font         | JetBrains Mono 400 13px `var(--blue-text)`             |
| Height       | 72px, `resize: none`                                   |
| Padding      | `10px 12px`                                            |
| Caret color  | `var(--purple)`                                        |

**Syntax legend** sits below the textarea as a flex row of four items:

| Token      | Dot colour |
| ---------- | ---------- |
| literal    | `#93C5FD`  |
| quantifier | `#C4B5FD`  |
| char class | `#FBBF24`  |
| group      | `#6EE7B7`  |

Each item: 5px dot + 9.5px JetBrains Mono label in `var(--text3)`.

### 5.3 Tabs

| Property       | Value                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------- |
| Background     | `var(--bg0)`                                                                                   |
| Border bottom  | `1px solid var(--border)`                                                                      |
| Tab default    | 10.5px JetBrains Mono, `color: var(--text3)`, `padding: 8px 14px`                              |
| Tab active     | `color: var(--purple-text)`, `border-bottom: 1.5px solid var(--purple)`, `margin-bottom: -1px` |
| Tab hover      | `color: var(--text2)`                                                                          |
| Tab transition | `color 0.12s`                                                                                  |

### 5.4 Test Inputs

| Property       | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Default border | `1px solid var(--border)`                                                          |
| Match state    | `border: 1px solid var(--green-border)`, `background: var(--green-bg)`             |
| No-match state | `border: 1px solid var(--red-border)`, `background: var(--red-bg)`                 |
| Focus          | `border-color: var(--border3)`                                                     |
| Font           | JetBrains Mono 400 11.5px `var(--text1)`                                           |
| Padding        | `5px 9px`                                                                          |
| Type label     | 9px uppercase JetBrains Mono — green (`--green`) for match, red (`--red`) for deny |
| Result badge   | 9.5px JetBrains Mono 500, `border-radius: 10px`, semantic bg/border/text           |

**Highlight box** (match preview):

| Property      | Value                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------ |
| Background    | `var(--bg0)`                                                                               |
| Border        | `1px solid var(--border)`                                                                  |
| Border radius | `5px`                                                                                      |
| Padding       | `8px 10px`                                                                                 |
| Matched span  | `background: #2D1F5A`, `color: var(--purple-text)`, `border-radius: 2px`, `padding: 0 2px` |
| Meta text     | 9.5px JetBrains Mono `var(--text3)`                                                        |

### 5.5 Flag Chips

| State      | Styles                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| Default    | `bg: var(--bg2)`, `border: 1px solid var(--border2)`, `color: var(--text3)`, `border-radius: 10px`, `padding: 2px 8px` |
| Active     | `bg: var(--purple-bg)`, `border: 1px solid var(--purple-border)`, `color: var(--purple-text)`                          |
| Hover      | `border-color: var(--border3)`, `color: var(--text2)`                                                                  |
| Font       | JetBrains Mono 400 10px                                                                                                |
| Transition | `all 0.12s`                                                                                                            |

Clicking toggles on/off. Active flags appear in both the left panel and the canvas toolbar (compact variant: `font-size: 9px`, `padding: 1px 6px`).

### 5.6 Debug Footer

| Property          | Value                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Background        | `var(--bg0)`                                                                                                     |
| Border top        | `1px solid var(--border)`                                                                                        |
| Scrubber track    | `height: 3px`, `background: var(--bg3)`, `border-radius: 2px`                                                    |
| Scrubber fill     | `background: linear-gradient(90deg, var(--purple-dim), var(--purple))`                                           |
| Scrubber handle   | 8×8px circle, `background: var(--purple)`, `box-shadow: 0 0 6px var(--purple)`, positioned at right edge of fill |
| Step counter      | JetBrains Mono 10px `var(--purple-text)`                                                                         |
| Buttons           | `bg: var(--bg2)`, `border: 1px solid var(--border2)`, hover: `bg var(--bg3)` `color var(--text1)`                |
| Stop button       | `border-color: var(--red-border)`, `color: var(--red-text)`, hover `bg: var(--red-bg)`                           |
| Debug string font | JetBrains Mono 11px — traversed chars at `var(--text3)`, cursor char uses `.cursor-char`                         |

**Cursor character:**

```css
.cursor-char {
  background: var(--purple);
  color: white;
  border-radius: 2px;
  padding: 0 1px;
  animation: blink 1.2s ease-in-out infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
```

---

## 6. Flow Graph — Node & Edge Specs

### 6.1 Default Node

| Property   | Value                                                                              |
| ---------- | ---------------------------------------------------------------------------------- |
| Background | `var(--bg2)`                                                                       |
| Border     | `1px solid var(--border2)`, `border-radius: 7px`                                   |
| Padding    | `6px 12px`                                                                         |
| Font       | JetBrains Mono 400 11px `var(--text2)`                                             |
| Hover      | `border-color: var(--purple-dim)`, `background: var(--bg3)`, `color: var(--text1)` |
| Transition | `border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s`              |
| Cursor     | `pointer`                                                                          |

### 6.2 Selected Node

| Property   | Value                                                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Border     | `1px solid var(--purple)`                                                                                                                                  |
| Background | `var(--purple-bg)`                                                                                                                                         |
| Color      | `var(--purple-text)`                                                                                                                                       |
| Box shadow | `0 0 0 1px var(--purple-bg), 0 0 16px #7C5CFC22`                                                                                                           |
| Step dot   | 5×5px circle, `background: var(--purple)`, `box-shadow: 0 0 6px var(--purple)`, `position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%)` |

**Step dot pulse:**

```css
.step-dot {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translateX(-50%) scale(0.7);
  }
}
```

### 6.3 Node Variants

| Variant    | Border colour    | Text colour     | Background   | Shape            |
| ---------- | ---------------- | --------------- | ------------ | ---------------- |
| Default    | `--border2`      | `--text2`       | `--bg2`      | 7px rounded rect |
| Loop node  | `#3A2868`        | `--purple-text` | `--bg2`      | 7px rounded rect |
| Char class | `#3A2A10`        | `--amber`       | `--bg2`      | 7px rounded rect |
| Start node | `--green-border` | `--green-text`  | `--green-bg` | 28×28px circle   |
| End node   | `--red-border`   | `--red-text`    | `--red-bg`   | 28×28px circle   |

### 6.4 Loop Arc

An inline SVG placed above the node with `position: absolute; top: -30px; left: 50%; transform: translateX(-50%)`.

```html
<svg class="loop-arc-svg" width="60" height="26" viewBox="0 0 60 26">
  <path
    d="M4 26 Q4 4 30 4 Q56 4 56 26"
    fill="none"
    stroke="#4A38A8"
    stroke-width="1"
    stroke-dasharray="4 3"
    opacity="0.6"
  >
    <animate
      attributeName="stroke-dashoffset"
      values="0;-14"
      dur="1.8s"
      repeatCount="indefinite"
    />
  </path>
</svg>
```

Each loop arc uses a slightly different `dur` value (1.8s, 2.2s, 2.6s, etc.) to prevent synchronised animation across multiple loops.

### 6.5 Connectors

| Property  | Value                                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Width     | `24px`                                                                                                                                                                         |
| Line      | `height: 1px`, `background: var(--border2)`                                                                                                                                    |
| Arrowhead | CSS `::after` — `border-top: 3.5px solid transparent`, `border-bottom: 3.5px solid transparent`, `border-left: 5px solid var(--border2)`. Position: `right: -4px; top: -3.5px` |

### 6.6 Canvas Dot Grid

```css
.canvas {
  background-color: var(--bg0);
  background-image: radial-gradient(
    circle at 1px 1px,
    #1e2438 1px,
    transparent 0
  );
  background-size: 24px 24px;
}
```

---

## 7. Explanation Panel

### 7.1 Structure

The panel is always in the DOM. It opens when a node is clicked and closes via the × button.

| Property     | Value                                                 |
| ------------ | ----------------------------------------------------- |
| Width        | `268px`                                               |
| Position     | `absolute; right: 0; top: 0; bottom: 0; z-index: 10`  |
| Background   | `var(--bg1)`                                          |
| Border left  | `1px solid var(--border)`                             |
| Transition   | `transform 0.2s ease`                                 |
| Open state   | `transform: translateX(0)`                            |
| Closed state | `transform: translateX(100%)`                         |
| Overflow     | `hidden` on panel, `overflow-y: auto` on body section |

### 7.2 Header

| Property     | Value                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Height label | 9px uppercase JetBrains Mono `var(--text3)`, `letter-spacing: 0.12em`                                                                      |
| Type badge   | `bg: var(--purple-bg)`, `border: 1px solid var(--purple-border)`, `color: var(--purple-text)`, 9.5px JetBrains Mono, `border-radius: 10px` |
| Close button | Transparent, no border, `color: var(--text3)` → `var(--text1)` on hover, `font-size: 14px`                                                 |

### 7.3 Body Sections

| Element           | Spec                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Description text  | 11.5px Syne `var(--text2)`, `line-height: 1.75`                                                                                                                                          |
| Inline `<code>`   | `bg: var(--bg3)`, `border: 1px solid var(--border2)`, `padding: 1px 5px`, `border-radius: 3px`, `color: var(--blue-text)`, 11px JetBrains Mono                                           |
| Code block        | `bg: var(--bg0)`, `border: 1px solid var(--border)`, `border-radius: 5px`, `padding: 10px 12px`, 12px JetBrains Mono `var(--blue-text)`                                                  |
| Property table    | Two columns. Key: 10.5px JetBrains Mono `var(--text3)`. Value: 10.5px JetBrains Mono `var(--purple-text)`. Row separator: `border-bottom: 1px solid var(--border)`. Last row: no border. |
| Step cursor block | `bg: var(--bg0)`, `border: 1px solid var(--border)`, `border-radius: 5px`, 11.5px JetBrains Mono. Pre/post text at `var(--text3)`. Cursor char uses `.cursor-char` styles.               |
| Section gap       | `14px` between body sections                                                                                                                                                             |

---

## 8. Canvas Toolbar

| Property      | Value                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Background    | `var(--bg1)`                                                                                                           |
| Border bottom | `1px solid var(--border)`                                                                                              |
| Height        | ~36px                                                                                                                  |
| Layout        | `display: flex; align-items: center; gap: 10px; padding: 8px 14px`                                                     |
| Label         | "Flow Graph" — 9px uppercase JetBrains Mono `var(--text3)`, `letter-spacing: 0.10em`                                   |
| Dividers      | `1px × 14px` solid `var(--border)`                                                                                     |
| Flag chips    | Compact variant — `font-size: 9px`, `padding: 1px 6px`. Same toggle behaviour.                                         |
| Stat text     | `"11 nodes · 13 edges"` — 9.5px JetBrains Mono `var(--text3)`. Numbers use `var(--text2)`.                             |
| Zoom buttons  | `bg: var(--bg2)`, `border: 1px solid var(--border)`, `border-radius: 4px`, hover `bg: var(--bg3)`, 10px JetBrains Mono |
| Zoom group    | `margin-left: auto` — pushed to far right                                                                              |

---

## 9. Minimap

| Property      | Value                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| Dimensions    | `110 × 64px`                                                           |
| Position      | `absolute; bottom: 14px; right: 282px` (14px gap from the 268px panel) |
| Background    | `var(--bg1)`                                                           |
| Border        | `1px solid var(--border)`                                              |
| Border radius | `6px`                                                                  |
| Opacity       | `0.9`                                                                  |
| z-index       | `5` (below explanation panel)                                          |

**Node representation inside minimap:**

| Type    | Size  | Style                                                                            |
| ------- | ----- | -------------------------------------------------------------------------------- |
| Default | 7×5px | `background: var(--border2)`, `border-radius: 1.5px`                             |
| Active  | 7×5px | `background: #3A2868`, `border: 0.5px solid var(--purple-dim)`                   |
| Current | 7×5px | `background: var(--purple)`, `box-shadow: 0 0 4px var(--purple)`                 |
| Start   | 5×5px | Circle, `background: var(--green-bg)`, `border: 0.5px solid var(--green-border)` |
| End     | 5×5px | Circle, `background: var(--red-bg)`, `border: 0.5px solid var(--red-border)`     |

---

## 10. CSS Custom Properties — Full Reference

```css
:root {
  /* ── Background ─────────────────────── */
  --bg0: #07090f;
  --bg1: #0b0e1a;
  --bg2: #0f1220;
  --bg3: #141828;
  --bg4: #1a1f33;

  /* ── Borders ────────────────────────── */
  --border: #1e2438;
  --border2: #262d45;
  --border3: #323a56;

  /* ── Text ───────────────────────────── */
  --text0: #e8ecf8;
  --text1: #b0b8d8;
  --text2: #6e7898;
  --text3: #3e4560;

  /* ── Accent — Purple ────────────────── */
  --purple: #7c5cfc;
  --purple-dim: #4a38a8;
  --purple-bg: #12103a;
  --purple-border: #2e2468;
  --purple-text: #c4b5fd;

  /* ── Semantic — Green ───────────────── */
  --green: #34d399;
  --green-bg: #082018;
  --green-border: #134028;
  --green-text: #6ee7b7;

  /* ── Semantic — Red ─────────────────── */
  --red: #f87171;
  --red-bg: #200810;
  --red-border: #401020;
  --red-text: #fca5a5;

  /* ── Semantic — Amber ───────────────── */
  --amber: #fbbf24;
  --amber-bg: #1a1200;

  /* ── Semantic — Blue ────────────────── */
  --blue-text: #93c5fd;

  /* ── Fonts ──────────────────────────── */
  --mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
  --sans: "Syne", sans-serif;
}
```

---

## 11. Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Syne:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

---

## 12. Interaction & Motion

| Element                 | Spec                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Node hover              | `transition: border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s`                                  |
| Tab active underline    | `transition: color 0.12s`; `border-bottom: 1.5px solid var(--purple)`                                              |
| Flag chip toggle        | `transition: all 0.12s`                                                                                            |
| Explanation panel slide | `transition: transform 0.2s ease`                                                                                  |
| Loop arc animation      | SVG `stroke-dashoffset` from `0` to `-14`, linear infinite. Each arc uses a distinct duration (1.8s, 2.2s, 2.6s…). |
| Step cursor blink       | `blink` keyframe, 1.2s ease-in-out infinite — `opacity: 0.4` at 50%                                                |
| Debug step dot pulse    | `pulse` keyframe, 1.5s ease-in-out infinite — `scale(0.7)` + `opacity: 0.6` at 50%                                 |
| Button press            | No transform. Background `transition` only.                                                                        |
| Input focus             | `border-color` + `box-shadow` transition `0.15s`                                                                   |
| Logo glow               | Static — `box-shadow: 0 0 12px #7C5CFC30` applied always, not on hover                                             |

---

## 13. Scrollbar Styling

```css
/* Global */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border2);
  border-radius: 2px;
}

/* Compact panels (test section, explanation panel body) */
.test-sec::-webkit-scrollbar,
.explain-body::-webkit-scrollbar {
  width: 3px;
}
```

The narrower `3px` scrollbar is used inside compact panels for visual delicacy. All scrollbars use a transparent track to avoid cluttering the dark background.
