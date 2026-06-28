<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-ui-ux-pro-max-rules -->
# Project Design Skill

Use the project-local `ui-ux-pro-max` skill for every task that changes layout, UI, UX, visual design, responsive behavior, interaction patterns, design systems, typography, color, spacing, components, dashboards, forms, tables, navigation, animation, or frontend polish.

Skill location:

`./.codex/skills/ui-ux-pro-max/SKILL.md`

Required workflow before UI/design implementation:

1. Read `./.codex/skills/ui-ux-pro-max/SKILL.md`.
2. Identify the user goal, main action, required data, layout structure, and success state before editing.
3. Run the skill search script when choosing or revising product style, design system, color, typography, layout pattern, UX behavior, accessibility, charts, or stack guidance.
4. Preserve the existing product flow and component structure unless a change is clearly needed.
5. Keep the interface consistent with the selected design system through the whole task, including follow-up edits until completion.

Windows command examples:

```powershell
python .\.codex\skills\ui-ux-pro-max\scripts\search.py "saas dashboard modern clean" --design-system -p "UX OS"
python .\.codex\skills\ui-ux-pro-max\scripts\search.py "accessibility loading forms responsive" --domain ux
python .\.codex\skills\ui-ux-pro-max\scripts\search.py "nextjs performance responsive ui" --stack nextjs
```

Before delivering UI work, verify:

- Clear hierarchy, spacing, and primary action.
- Mobile responsive layout with no horizontal overflow.
- Accessible contrast, labels, focus states, and non-color-only status.
- Designed loading, empty, error, disabled, hover, and active states where relevant.
- Reusable components and semantic design tokens instead of one-off styling.
<!-- END:project-ui-ux-pro-max-rules -->

<!-- BEGIN:project-skill-routing-rules -->
# Project Skill Routing

Use the project-local skills in:

`./.codex/skills`

The complete routing matrix is:

`./.codex/SKILL_ROUTING.md`

Mandatory workflow for future work:

1. Before any layout, design, UX, frontend polish, prototype, slide, motion, browser verification, or system-design task, read `./.codex/SKILL_ROUTING.md`.
2. Then read the selected skill `SKILL.md` files completely before editing.
3. For normal product UI in this app, default route is:
   `impeccable` -> `ui-ux-pro-max` -> `design-system` when tokens/components are involved -> `ui-styling` for implementation -> `playwright-cli` for browser verification.
4. For landing/portfolio/marketing pages, default route is:
   `brand` -> `design-taste-frontend` -> `impeccable` -> `ui-ux-pro-max` -> `ui-styling`.
5. For prototypes, HTML demos, slide decks, animation, or video/GIF outputs, use:
   `huashu-design` -> `slides` or `banner-design` as needed -> `playwright-cli`.
6. For redesigns, use:
   `redesign-existing-projects` -> `impeccable` -> `ui-ux-pro-max` -> `design-system`/`ui-styling` -> `playwright-cli`.
7. For Playwright traces or test browser automation, use `playwright-cli` or `playwright-trace`. Use `playwright-dev` and `playwright-devops` only when working on Playwright itself or its CI/release workflows.

Strict means selecting and following the right skill route for the task. Do not load every skill blindly when only one route applies.
<!-- END:project-skill-routing-rules -->
