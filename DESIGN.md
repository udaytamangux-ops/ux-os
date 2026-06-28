# Design System

## Visual Direction

UX OS uses a light paper-blue product system inspired by the Konan reference image. The goal is not an anime theme. The image only informs the atmosphere: pale paper, mist blue, rain navy, midnight ink, blue-gray shadow, and a restrained burgundy accent.

The interface should feel like a tactile UX workspace: calm enough for daily work, playful in interaction, personal enough to feel like the owner's room, and structured enough for real project management.

## Palette Strategy

Use a restrained product palette. White and pale blue carry most surfaces. Rain navy is the main action and selection color. Burgundy is reserved for priority, risk, destructive actions, and error emphasis.

| Role | Tailwind token | Value | Use |
| --- | --- | --- | --- |
| App background | `bg` | `#F3F6FB` | Page canvas, full app shell, quiet empty space |
| Primary surface | `surface` | `#FFFFFF` | Main panels, sidebars, modal surfaces |
| Raised card | `card` | `#F9FBFF` | Cards, form fields, secondary panels |
| Hover surface | `card-h` | `#EAF1FA` | Card hover, soft selected-hover feedback |
| Primary action | `accent` | `#244D7A` | Primary buttons, active nav, progress, focused structure |
| Primary tint | `accent-d` | `#E4EDF8` | Selected states, soft CTAs, active tabs |
| Completion / success | `mint` | `#3C609C` | Completed work, positive status, secondary progress |
| Completion tint | `mint-d` | `#E8F0FF` | Success panels and low-emphasis complete states |
| Warning / in progress | `gold` | `#74644F` | In-progress, attention, neutral warning |
| Warning tint | `gold-d` | `#EFE8DC` | Low-emphasis warning backgrounds |
| Priority / danger | `pink` | `#8D3D50` | High priority, errors, destructive actions |
| Priority tint | `pink-d` | `#F3E3EA` | Error panels, destructive hover states |
| Primary text | `t1` | `#111827` | Headings, body, key data |
| Secondary text | `t2` | `#43516A` | Descriptions, metadata, labels |
| Muted text | `t3` | `#7D8BA4` | Placeholders, low-priority helper text |
| Border | `border` | `rgba(24, 48, 84, 0.13)` | Default dividers and card outlines |
| Strong border | `border-s` | `rgba(24, 48, 84, 0.24)` | Focused panels, hover borders, input emphasis |

## Usage Rules

- Do not add raw hex colors in components. Add or adjust a token in `tailwind.config.ts` first.
- Keep the app light. Dark navy can appear in text, buttons, shadows, and progress, but not as the dominant page background.
- Use `accent` for the one primary action on a screen, current navigation state, active tabs, progress, and strong focus.
- Use `accent-d`, `card-h`, and `border-s` for hover and selected states before adding new colors.
- Use `pink` only when the user should slow down: destructive actions, validation errors, high priority, or risk.
- Use `mint` as the semantic completion color even though the visual value is blue. The name stays for code compatibility.
- Use `gold` sparingly for in-progress or attention states. It should read muted and paper-like, not bright yellow.
- Status must never rely on color alone. Pair color with text, icons, labels, or progress structure.

## Component Rules

Buttons:
- Primary buttons use `bg-accent text-white hover:bg-accent/90`.
- Secondary buttons use `border border-border bg-card text-t2 hover:border-border-s hover:text-t1`.
- Destructive buttons use `bg-pink text-white hover:bg-pink/90`.
- Important touch targets stay at least `min-h-11`.

Navigation:
- Active nav uses `bg-accent-d text-accent` plus a visible border or shadow.
- Inactive nav stays quiet with `text-t2` and only lifts on hover.
- Do not add extra nav colors per page.

Cards and panels:
- Use `surface` for major layout regions and `card` for nested work items.
- Avoid cards inside cards unless the inner element is a repeated record, modal content, or form field group.
- Shadows should be blue-gray and crisp, not generic black blur. Prefer `rgba(60,96,156,...)` or `rgba(24,48,84,...)` when an arbitrary shadow is unavoidable.

Forms:
- Inputs use `bg-card`, `border-border-s`, `text-t1`, and `focus:border-accent`.
- Placeholder text uses `text-t3`; helper/error text must remain readable.
- Validation uses `pink` plus a clear message near the field.

Empty and loading states:
- Empty states should use `graph-paper`, soft borders, and a direct action.
- Loading states use skeleton blocks in the same surface system, not centered spinners as the default.

## Motion and Interaction

The workspace should feel playful through small, useful feedback and a light anime-paper atmosphere:

- Use `interactive-lift` for clickable cards and buttons.
- Use `AnimeAtmosphere` in the app shell for floating paper shards, rain-line motion, and a desktop cursor slash.
- Use `anime-card`, `anime-column`, `anime-hero`, `anime-nav-link`, and `anime-cta` for surfaces that should feel more personal and kinetic.
- Keep feedback micro-interactions around 150-250ms; ambient motion can be slower when it does not block work.
- Animate transform, shadow, color, and border changes. Avoid animating layout dimensions.
- Preserve the reduced-motion fallback in `app/globals.css`.
- Hover should clarify what is clickable; it should not become decorative motion.
- Do not add random bouncy icons, emoji decoration, or generic purple-blue AI gradients. The vibe is paper, rain, slash, fold, and quick response.

## Premium Polish Rules

The current direction should read as a professional product first and an anime-inspired personal workspace second.

- Default surfaces should be quiet. Use one crisp border or one soft blue-gray shadow, not both as a heavy effect.
- Paper effects are accents, not the base treatment for every card. Reserve stronger `anime-*` treatments for page headers, empty states, and key workflow panels.
- Hover motion should feel precise: small upward lift, no default rotation on standard controls, and no layout shift.
- Ambient atmosphere stays behind the work. Keep opacity low enough that forms, lists, and kanban cards remain the visual priority.
- Avoid stacking `studio-panel`, `anime-card`, `interactive-lift`, and custom arbitrary shadows on the same component unless it is a primary hero or modal.
- Active navigation should feel stable, not constantly animated. Use position, contrast, and a static accent line before looped motion.
- Use animation to confirm state changes, reveal panels, or show affordance. Avoid decorative sweeps on dense work surfaces.

## Accessibility Checks

- Normal text must meet at least 4.5:1 contrast against its surface.
- Focus states must remain visible on every interactive element.
- Do not remove labels from forms.
- Touch targets for important actions should be at least 44px tall.
- Never communicate status by color alone.

## Change Workflow

When changing the visual system:

1. Update this file first with the intended role and usage.
2. Update `tailwind.config.ts` tokens.
3. Replace component-level raw values with tokens when practical.
4. Run `npm.cmd run lint` and `npm.cmd run build`.
5. Verify at least one desktop and one mobile route visually.
