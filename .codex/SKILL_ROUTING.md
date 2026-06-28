# UX OS Project Skill Routing

Canonical project-local skills path:

`./.codex/skills`

Before using any project skill, read that skill's `SKILL.md` completely. If it points to a relevant `reference/`, `references/`, `scripts/`, `assets/`, or `templates/` file, load only the files needed for the current task.

## Strict Default Workflow

Use skills by task fit, not by loading every skill on every request.

1. Inspect the project files related to the task.
2. Identify whether the task is product UI, marketing/landing, brand, prototype, motion/deck, visual generation, redesign, or browser verification.
3. Read the required skill entrypoints from `./.codex/skills`.
4. Follow the selected skills strictly through implementation and verification.
5. Run the available validation command for the project when code changes are made.

## Core UI/Product Work

Use this route for dashboards, SaaS screens, forms, tables, settings, app shells, project workflow screens, product UX, accessibility, responsive behavior, and frontend polish:

1. `impeccable` - production frontend craft, UX critique, polishing, hardening, typography, layout, motion, accessibility, and anti-pattern detection.
2. `ui-ux-pro-max` - product/UI decision engine, UX laws, accessibility, responsive, forms, tables, charts, color, typography, and searchable design guidance.
3. `design-system` - use when tokens, component rules, primitives, semantic colors, spacing, typography scales, or reusable UI specs are needed.
4. `ui-styling` - use when implementing the approved direction in Tailwind, shadcn-style components, responsive utility classes, and accessible states.
5. `playwright-cli` - use after implementation when browser verification, screenshots, interaction checks, or local route inspection are needed.

For this Next.js app, also follow the Next.js warning in `AGENTS.md`: read relevant local Next docs in `node_modules/next/dist/docs/` before using unfamiliar Next.js 16 APIs.

## Brand, Marketing, Portfolio, and Landing Pages

Use this route when the task is a landing page, marketing surface, portfolio, homepage, hero section, conversion page, or a page that must not look generic:

1. `brand` - define or preserve brand voice, assets, visual identity, messaging, and palette rules.
2. `design-taste-frontend` - anti-slop direction for landing pages, portfolios, redesigns, and non-templated frontend composition.
3. `impeccable` - craft, audit, polish, type, layout, color, and motion quality.
4. `ui-ux-pro-max` - validate accessibility, responsive behavior, hierarchy, and interaction quality.
5. `ui-styling` - implement the approved visual direction.

Supporting skills:

- `brandkit` - create premium brand-kit boards, logo systems, identity decks, and visual-world presentations.
- `high-end-visual-design` - push a page toward high-end agency quality and avoid cheap/generic visual defaults.
- `minimalist-ui` - use when the chosen direction is clean, editorial, muted, flat, and restrained.
- `industrial-brutalist-ui` - use when the chosen direction is raw, mechanical, Swiss, terminal-like, or blueprint-like.
- `gpt-taste` - use only for ambitious kinetic landing/portfolio pages with GSAP-style scroll/pinning/large editorial layout needs.
- `banner-design` - use for social headers, ads, website hero banners, print banners, and campaign composition.

## Redesign Work

Use this route when improving an existing screen without breaking existing flows:

1. `redesign-existing-projects` - audit the current design, identify generic patterns, preserve working behavior, and upgrade quality.
2. `impeccable` - run the relevant critique/polish/layout/color/typography flow.
3. `ui-ux-pro-max` - validate against UX, accessibility, responsive, forms, tables, navigation, and interaction rules.
4. `design-system` and `ui-styling` - systematize and implement changes.
5. `playwright-cli` - verify the changed route visually and interactively.

Do not change routes, nav labels, form field names, analytics-relevant IDs, or major information architecture during redesign unless the user explicitly asks.

## Prototypes, HTML Demos, Slides, and Motion

Use this route when the user asks for a prototype, HTML mockup, interaction demo, slide deck, animation, video/GIF export, narrated explainer, visual direction options, or design variants:

1. `huashu-design` - HTML-first high-fidelity prototypes, interaction demos, slide decks, animation demos, design variants, motion/video export workflows, and expert design review.
2. `slides` - deck structure, narrative, slide flow, and HTML presentation guidance after visual direction is known.
3. `banner-design` - banner/hero/campaign composition when the output is fixed-format or advertising-like.
4. `playwright-cli` - verify generated HTML/prototypes/decks in the browser and capture screenshots.

For modern products, brands, releases, specs, APIs, versions, or time-sensitive facts, verify current facts before designing around them.

## Image-Driven Design and Image-to-Code

Use these when visual generation or screenshot-to-code is part of the task:

- `imagegen-frontend-web` - generate separate website section references for landing pages and marketing pages.
- `imagegen-frontend-mobile` - generate premium mobile app screen concepts and flows.
- `image-to-code` - generate/analyze visual references first, then implement the website to match them closely.
- `stitch-design-taste` - create agent-friendly `DESIGN.md` files for Google Stitch-style design systems.

If a requested implementation must use generated images, keep the output inspectable and avoid fake screenshots, decorative hand-rolled SVGs, or text-only design surfaces.

## Playwright and Verification

Use these for browser automation, tests, traces, and Playwright-specific work:

- `playwright-cli` - automate browser interactions, inspect local routes, take screenshots, test forms, verify responsive behavior, and work with Playwright tests.
- `playwright-trace` - inspect Playwright trace `.zip` files from the command line.
- `playwright-dev` - only when modifying Playwright itself, adding Playwright APIs, CLI commands, MCP tools, or vendored dependencies.
- `playwright-devops` - only for Playwright CI failure analysis, workflow debugging, and release operations.

For normal UX OS app browser checks, prefer `playwright-cli`, not `playwright-dev`.

## Completion and Output Discipline

Use `full-output-enforcement` when the user asks for complete, exhaustive, unabridged output or when a deliverable must not contain placeholders.

Every UI/code task must finish with:

- What changed.
- Files updated.
- Commands/checks run.
- Manual test notes or remaining risks.

## Imported Skills

The following skills are available in `./.codex/skills`:

- `banner-design`
- `brand`
- `brandkit`
- `design`
- `design-system`
- `design-taste-frontend`
- `design-taste-frontend-v1`
- `full-output-enforcement`
- `gpt-taste`
- `high-end-visual-design`
- `huashu-design`
- `imagegen-frontend-mobile`
- `imagegen-frontend-web`
- `image-to-code`
- `impeccable`
- `industrial-brutalist-ui`
- `minimalist-ui`
- `playwright-cli`
- `playwright-dev`
- `playwright-devops`
- `playwright-trace`
- `redesign-existing-projects`
- `slides`
- `stitch-design-taste`
- `ui-styling`
- `ui-ux-pro-max`
