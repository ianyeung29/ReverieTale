---
name: ReverieTale
description: A character-first interactive fiction platform for readers who want a scene to become a conversation.
colors:
  ink: "#150F1A"
  ink-raised: "#211827"
  plum: "#2A2033"
  plum-border: "#4A3A50"
  plum-rule: "#3A2E44"
  paper: "#F4EAF0"
  muted: "#B9A9BF"
  muted-bright: "#CBBBD0"
  muted-deep: "#9A8AA0"
  muted-dim: "#8A7A90"
  plum-hover: "#6A5570"
  coral: "#D87974"
  amber: "#E9A06B"
typography:
  display:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "0"
  scale:
    micro: "10px"
    xxs: "11px"
    xs: "12px"
    compact: "13px"
    small: "14px"
    body: "15px"
    base: "16px"
    body-large: "17px"
    subtitle: "18px"
    section: "20px"
    title-small: "23px"
    title: "25px"
    title-medium: "30px"
    title-large: "34px"
    display: "44px"
  body:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  compact: "8px"
  image: "12px"
  panel: "16px"
  pill: "999px"
spacing:
  tight: "8px"
  regular: "16px"
  section: "44px"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
    rounded: "{rounded.compact}"
    padding: "11px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.compact}"
    padding: "10px 14px"
---

# Design System: ReverieTale

## Overview

**Creative North Star: "The After-Hours Character Index"**

ReverieTale should feel like a warmly lit index of people, scenes, and possible next moves. The homepage introduces one character and one opening moment with enough specificity to invite a decision, then becomes a compact catalogue for more discovery. It is cinematic, but never a poster with no product beneath it.

Key characteristics: character-first, image-led, intimate, editorial, compact, and clearly 13+.

## Colors

Ink and plum form the quiet stage. Coral is reserved for a meaningful next step, while amber marks story metadata and small moments of discovery.

**The One Warm Action Rule.** Use coral for the primary action in a local decision group; all competing actions stay quiet.

## Typography

**Display Font:** Gloock with Georgia fallback
**Body Font:** Onest with system sans-serif fallback

Display type gives character names and story titles a literary presence. Interface copy stays direct and compact.

## Layout

Desktop content is constrained to 1120px and uses a two-column editorial lead. The opening entry receives a clear invitation, then discovery becomes dense image tiles and compact companion cards. On narrow screens the image leads, then the story invitation and actions follow in a simple vertical rhythm.

## Elevation & Depth

Depth comes mainly from tonal layering, hairline borders, portrait crops, and restrained image scrims. Shadows appear only on interactive repeated tiles.

## Shapes

Use 8px corners for controls and 16px corners for image or content panels. Pills are reserved for tags, filters, and tiny state labels.

## Components

### Buttons
- Primary actions are coral with dark ink text.
- Secondary actions are transparent with a visible plum border.
- Keep labels short and action-led.

### Cards / Containers
- Repeated story and companion items can be framed panels.
- Page sections should remain unframed bands with a rule or spacing, never card-inside-card compositions.

### Navigation
- Navigation stays quiet and compact. The active destination uses the warm accent, not a large pill.

## Do's and Don'ts

### Do:
- **Do** make a real companion portrait the first visual signal on discovery screens.
- **Do** use one clear invitation per featured character: enter their scene or begin a chat.
- **Do** keep titles compact enough to leave the catalogue visible nearby.

### Don't:
- **Don't** stack a generic marketing hero after a featured character moment.
- **Don't** make every discovery section a floating card.
- **Don't** use coral everywhere; it should guide the next choice.
