---
name: WriteupHub Minimal Dark System
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191c23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e0e2ec'
  on-surface-variant: '#bacac1'
  inverse-surface: '#e0e2ec'
  inverse-on-surface: '#2d3038'
  outline: '#85948c'
  outline-variant: '#3c4a43'
  surface-tint: '#38dfab'
  primary: '#50f0bb'
  on-primary: '#003828'
  primary-container: '#22d3a0'
  on-primary-container: '#00563e'
  inverse-primary: '#006c4f'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#dfcfff'
  on-tertiary: '#3c0091'
  tertiary-container: '#c6aeff'
  on-tertiary-container: '#591ec2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#5ffcc6'
  primary-fixed-dim: '#38dfab'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513b'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#10131a'
  on-background: '#e0e2ec'
  surface-variant: '#32353c'
typography:
  display:
    fontFamily: Inter
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.035em
  headline-lg:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.65'
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.7'
    letterSpacing: '0'
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.04em
  label-mono-xs:
    fontFamily: JetBrains Mono
    fontSize: 0.625rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-performance, developer-centric aesthetic engineered specifically for technical cybersecurity publishing, exploit documentation, and competitive capture-the-flag (CTF) writeups. Merging the utilitarian precision of Linear, the structural rigor of GitHub, and the hyper-refined dark-surface depth of Vercel, the interface communicates technical mastery, extreme focus, and cryptographic precision.

The visual style is characterized by deep tonal dark surfaces, low-contrast razor borders, tactical typographic contrast, and restrained neon energy. High-intensity accents—such as the primary emerald-to-cyan gradient and contextual security telemetry tags—cut through deep carbon backdrops like laser optics on hardware. Every interface node feels purpose-built: dense, responsive, devoid of frivolous ornamentation, and tuned for extreme readability across prolonged technical research sessions.

## Colors

The palette leverages a calibrated dark-spectrum tonal hierarchy designed to reduce glare while providing crisp structural segregation.

### Surface Tiers
- **Canvas Base**: `#0B0D12` (Ultra-deep void background)
- **Surface Layer 1**: `#12151C` (Primary card canvases, sidebars, panel bodies)
- **Surface Layer 2**: `#181C25` (Elevated overlays, active rows, code block chrome)
- **Border / Divider**: `#242936` (Crisp 1px boundary stroke)
- **Border Focus / Hover**: `#363E52` (Interactive border highlighting)

### Core Accents & Gradients
- **Primary Energy**: `#22D3A0` (Electric Emerald) flowing into `#38BDF8` (Cyan Neon) via a `135deg` linear gradient. Used strictly for CTAs, active operational indicators, and glowing boundary focus rings.
- **Secondary Accent**: `#8B5CF6` (Tactical Violet) for authorship, metadata relations, and platform utilities.

### CTF Category Semantics
Each challenge category has an immutable, high-legibility identity token:
- **Web**: `#38BDF8` (Sky Cyan)
- **Pwn**: `#F43F5E` (Exploit Rose)
- **Crypto**: `#A855F7` (Cipher Purple)
- **Reverse**: `#FB923C` (Binary Orange)
- **Forensics**: `#14B8A6` (Telemetry Teal)
- **Misc**: `#94A3B8` (Unclassified Slate)

### Difficulty Semantics
- **Easy**: `#22C55E`
- **Medium**: `#F59E0B`
- **Hard**: `#EF4444`
- **Insane**: `#EC4899`

Backgrounds for chips and badges use a `10%` opacity fill paired with a `25%` opacity border stroke in the category or difficulty color, ensuring high legibility without visual fatigue.

## Typography

Typography is split into dual execution layers: **Inter** handles narrative structure, executive headers, and frictionless long-form markdown consumption; **JetBrains Mono** governs machine data, shell input/output, payloads, operational metadata, category chips, and timestamps.

- **Kerning and Tracking**: Tight tracking is applied systematically to Inter display headings (`-0.025em` to `-0.035em`) to evoke density and precision. JetBrains Mono uses expanded letter spacing on small taglines (`+0.04em` to `+0.06em`) for immediate parsing.
- **Payloads & Code Rendering**: Inline code snippets are styled with background `#181C25`, border `#242936`, and text color `#38BDF8`. Full code blocks feature sticky line numbers, syntax highlighting using cold terminal tones, and explicit file path chrome headers.

## Layout & Spacing

The layout is built on an adaptive 12-column engineering grid with strict horizontal and vertical alignment rules.

### Grid Architecture & Form Factors
- **Desktop (>= 1280px)**: 12-column grid with `1.5rem` gutters and dynamic outer margins constrained to a maximum content width of `1440px` (or `840px` centered for single-column long-form writeup readouts). Collapsible tactical utility sidebars (TOC, payload inspector, metadata) occupy 3 columns.
- **Tablet (768px - 1279px)**: 8-column layout with `1rem` gutters and `1.5rem` outer canvas padding. Secondary tooling panes collapse into slide-over sheets.
- **Mobile (< 768px)**: 4-column layout with `0.75rem` gutters and `1rem` edge margins. Code containers default to edge-to-edge scroll viewports with horizontal scroll snaps.

### Rhythmic Discipline
Vertical pacing follows an 8px rhythmic ladder. Inner-component gaps strictly adhere to `space-xs` (4px), `space-sm` (8px), and `space-md` (16px), preventing loose, detached interfaces and sustaining a tight, dashboard-grade density.

## Elevation & Depth

Depth is established primarily through **tonal surface stacking** combined with **subtle razor borders** and **targeted luminescent glow**, avoiding heavy traditional drop shadows.

1. **Surface 0 (Base `#0B0D12`)**: The unlit canvas. Displays subtle CSS background gridlines (`linear-gradient(to right, #181C25 1px, transparent 1px)` spaced at `32px` intervals with `0.3` opacity).
2. **Surface 1 (Base Panels `#12151C`)**: Outlined by a crisp `1px solid #242936`. Contains writeup cards, markdown editors, and feed containers.
3. **Surface 2 (Elevated Nodes `#181C25`)**: Dropdowns, active command palettes, popovers, and hovered cards. Raised with an ambient shadow: `0 8px 32px -4px rgba(0, 0, 0, 0.6)`.
4. **Neon Bloom / Luminescence**: Interactive focal points receive localized radiant glows rather than directional diffusion:
   - Primary elements and buttons: `box-shadow: 0 0 20px -3px rgba(34, 211, 160, 0.25)`.
   - Focus states on forms and input buffers: `0 0 0 1px #22D3A0, 0 0 16px -2px rgba(34, 211, 160, 0.4)`.
   - Category badges on hover emit a localized `6px` blur matching their accent token.

## Shapes

The design uses a restrained, semi-sharp corner language:

- **Cards, Panels & Code Windows**: Explicitly fixed at `12px` border radius (`rounded-lg`), delivering structural framing without feeling bubble-like or overly rounded.
- **Buttons, Text Inputs, Search Bars**: Fixed at `8px` border radius (`rounded-md`), generating an ergonomic, tactile profile.
- **Chips, Category Tags, Status Indicators**: Fixed at `4px` or `6px` radius (`rounded-sm`), enforcing a technical, patch-like feel reminiscent of terminal badges and hardware equipment.
- **Avatars & CTF Solved Indicators**: Kept slightly rounded (`8px` or full circles only when representing user profiles).

## Components

### Buttons
- **Primary CTA**: Background is a `135deg` linear gradient from `#22D3A0` to `#38BDF8`. Text is `#0B0D12` bold with `Inter` 14px. Border radius is `8px`. Hover state intensifies the inner gradient brightness with a `0 0 16px rgba(34, 211, 160, 0.35)` glow. Active state scales to `0.98`.
- **Secondary (Ghost Outline)**: Background `#12151C`, border `1px solid #242936`, text `#F1F5F9`. Hover state shifts border to `#363E52` and background to `#181C25`.
- **Terminal Action Button**: Background transparent, border `1px dashed #242936`, text `#94A3B8`, font `JetBrains Mono` 12px. On hover: border solid `#22D3A0`, text `#22D3A0`.

### Chips & Badges
- **Category Badge**: Composed with font `JetBrains Mono` at `11px` uppercase tracking. Background is `rgba(color, 0.1)`, text is the pure category hex, border is `1px solid rgba(color, 0.25)`.
- **Difficulty Chip**: Includes a `6px` solid indicator dot displaying the difficulty color, followed by `JetBrains Mono` title text.

### Input Fields & Command Palettes
- **Text Inputs**: Height `40px`, background `#0B0D12`, border `1px solid #242936`, text `#F1F5F9`, placeholder `#475569`. Font is `Inter` 14px. On focus: border shifts immediately to `#22D3A0` with a subtle green-cyan ambient aura.
- **Command Palette (Linear-style)**: Floating modal with Surface `#12151C`, top border highlight using subtle gradient, list items with keyboard shortcut tags mapped in `JetBrains Mono` (`#64748B` border, `#94A3B8` text).

### Cards (Writeup Previews)
- Built on Surface `#12151C` with `1px solid #242936` and `12px` border radius.
- Padding is `1.25rem`.
- Features a two-line header (CTF event & category/difficulty chip bar), prominent post title in `Inter` semi-bold, excerpt in muted text, and a bottom metadata strip (solves, reading time, author handle, proof-of-concept flag indicator).
- Hover transition: border changes to `#363E52`, card raises slightly via `-1px` transform, and an ambient top-border gradient glows softly.

### Code Blocks & Terminal Windows
- Multi-tier structure: Chrome header background `#181C25` featuring the filename in `JetBrains Mono` 12px with a copy-payload button; code container body background `#0E1117` with syntax-highlighted code; left-hand line numbering in `#334155`.

### Checkboxes & Selection Controls
- Checkbox dimensions: `16px x 16px` with a `4px` radius. Border is `1px solid #242936`. Selected state fills with `#22D3A0`, featuring a deep `#0B0D12` checkmark icon.