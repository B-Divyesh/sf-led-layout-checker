# Visual thesis — Routed light as generative geometry

## Direction and purpose

The product uses **generative geometry** drawn from the real planning marks behind LED art: nodes, routed paths, numbered starts, current labels, and power branches. The interface should feel like a dark cutting mat crossed with a light sculpture plan. Geometry explains the job rather than decorating it. It avoids the generic dashboard grid and the usual neon-gradient hero.

## Palette

The primary treatment is deliberately dark because LED paths need visual priority.

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#07110f` | page background |
| `--panel` | `#10201c` | raised work surfaces |
| `--panel-2` | `#172a25` | controls and grouped content |
| `--paper` | `#f5f1df` | primary text and canvas |
| `--muted` | `#b9c9c0` | supporting text |
| `--wire` | `#8af5c6` | paths and primary action |
| `--spark` | `#ffd166` | focus, controller, active data point |
| `--coral` | `#ff806b` | warnings and supply markers |
| `--safe` | `#77dfa2` | passed checks |
| `--danger` | `#ff9a8a` | errors |

All text and controls meet WCAG AA against their surfaces. Status also uses icons and words, never colour alone. The canvas uses a light plotting-paper treatment for long editing sessions.

## Type

- Display: `Arial Narrow`, `Aptos Narrow`, `Roboto Condensed`, then system sans. Tight, tall headings echo printed component labels without loading a font.
- Body: `Inter`, `Aptos`, `Segoe UI`, then system sans. It stays clear at 16px and avoids a runtime font request.
- Measurements and counts use the system monospace stack with tabular figures.

## Spacing and shapes

The scale is 4, 8, 12, 16, 24, 32, 48, 72px. Sections follow an alternating 32/72px rhythm. Controls use clipped corners and offset outlines, like labels attached to wiring plans. Canvas nodes are circles; supplies are diamonds; controllers are hexagons. Cards are only used for independent checks or paid-tier details.

## Interaction grammar

The editor follows a physical sequence: choose what to place, then click the plan. Segment drawing adds numbered points and a dashed preview. Undo removes the newest physical action. Active tools are shown by pressed state and text. Every canvas action has a keyboard equivalent through labelled coordinate inputs and an “Add point” button.

## Motion

A single spark travels along each data path to show direction. It lasts 2.4 seconds and has a visible Pause control. Interface changes use 180ms opacity and transform transitions. With `prefers-reduced-motion: reduce`, sparks stop at each segment start and transitions become instant. Direction arrows and start/end labels remain, so motion is never the only cue.

## Asset plan and provenance

- `hero-routing.webp`: original abstract editorial illustration used on the landing page and as the source for the social preview.
- Product diagrams, icons, favicon, and exported layouts are authored in SVG or CSS because their meaning depends on exact geometry.
- Generation model: factory image deployment via `/opt/fleet/lib/gen-image.sh`.
- Generation date: 2026-08-28.
- Prompt: “Use case: stylized-concept. Asset type: wide landing-page hero for an LED installation planning tool. A top-down abstract light sculpture plan made from luminous mint addressable LED paths, precise numbered-looking nodes without actual text, coral power injection branches, and one amber controller hub, arranged as bold generative geometry on a deep near-black green cutting-mat surface. Screen-print texture, crisp technical routing, handcrafted editorial composition, strong negative space, no people, no real electronics brands. Palette: near-black green, bone, mint, amber, coral. No text, no letters, no logos, no watermark, no gradients, no UI screenshot.”
- License: original generated asset made for this MIT-licensed product. The footer discloses generated imagery.

## Responsive behaviour

At 390px the landing art sits below the action, tools become a two-column rail, and the inspector stacks below the plan. The plan keeps a 16:10 aspect ratio and a minimum usable height. Desktop uses a tool rail, plan, and check panel. Nothing relies on hover.

## 404 treatment

The missing route becomes a broken LED path: two numbered nodes separated by a dashed gap, with one clear link back to the planner.
