# Decentraland Scaling UI

`dcl-scaling-ui` is a reusable UI framework for Decentraland SDK7. Build interfaces from **layers**, **zones**, and shared components instead of hand-placing every `UiEntity`.

## Building blocks

| Piece | Role |
|---|---|
| **Layer** | Independent UI surface (HUD, popup, menu). Extends the `Layer` class; owns zone + optional show/hide. |
| **Zone** | Predefined layout slot (`Default`, `BarTop`, `BottomRight`, …) for scene UI chrome. Device hardware insets are handled once by `ScreenInsetArea` inside `SetupScalingUI`. |
| **Layout** | `Row`, `Column`, and related helpers for arranging children. |
| **Components** | Shared controls: `UiBox`, `Header`, `ButtonImage`, icons, etc. |
| **Theme** | Central colours / type / sizing via `SetupScalingUI({ theme })`. |

## Quick start

```tsx
import { SetupScalingUI } from 'src/scaling-ui'
import { themeOverrides } from 'src/myTheme'
import { demoLayers } from 'src/examples/layers'

export function main() {
 SetupScalingUI({
  theme : themeOverrides,
  layers: demoLayers,
 })
}
```

Theme overrides stay small — only change what differs from `defaultTheme` in `src/scaling-ui/styles/theme.ts`.

## Adding a layer

Layers are **classes**, not JSX wrappers. Extend `Layer`, implement `body()`, and register an instance in the `layers` array.

```tsx
import ReactEcs from '@dcl/sdk/react-ecs'

import { Header, Layer, Row, UiBox, ZoneType } from 'src/scaling-ui'

export class ScoreboardLayer extends Layer {
 constructor() {
  super({
   id  : 'scoreboard',
   zone: ZoneType.BarTop,
  })
 }

 protected body() {
  return (
   <Row>
    <Header key="score-title" title="Score" />
    <UiBox
     key="score-value"
     uiText={{ value: '12' }}
    />
   </Row>
  )
 }
}

export const scoreboardLayer = new ScoreboardLayer()
```

## Example: popup notification

Use a hideable layer. `canBeHidden` enables `show()` / `hide()` / `toggle()`. Set `showCloseButton` to auto-inject the close control. `startHidden` begins the layer off-screen.

```tsx
import ReactEcs from '@dcl/sdk/react-ecs'

import { Column, Header, Layer, UiBox, ZoneType } from 'src/scaling-ui'

export class NotificationLayer extends Layer {
 constructor() {
  super({
   id             : 'notification',
   zone           : ZoneType.Default,
   canBeHidden    : true,
   startHidden    : true,
   showCloseButton: true,
  })
 }

 protected body() {
  return (
   <Column>
    <Header key="note-title" title="Quest complete" />
    <UiBox
     key="note-body"
     uiText={{ value: 'You earned 50 XP.' }}
    />
   </Column>
  )
 }
}

export const notificationLayer = new NotificationLayer()
```

Mount it, then open it from gameplay code:

```tsx
SetupScalingUI({
 theme : themeOverrides,
 layers: [notificationLayer],
})

// later…
notificationLayer.show()
```

## Zone presets

| `ZoneType` | Typical use |
|---|---|
| `Default` | Centered modal / panel |
| `FullScreen` | Full canvas overlay |
| `BarTop` / `BarBottom` / `BarLeft` / `BarRight` | Edge chrome / toasts |
| `BottomRight` | Compact HUD readout |
| `None` | Raw content (no zone wrapper) |

Named helpers (`ZoneBarTop`, `ZoneBottomRight`, …) wrap the same presets when you need a zone outside a `Layer`.

## Project layout

```
src/scaling-ui/     framework (import from here)
src/examples/       demo layers for the sample scene
src/myTheme.ts      project theme overrides
.cursor/skills/     agent skills for this framework
.cursor/rules/      agent rules when editing UI
```

## Agent guidance

When creating or changing Scaling UI interfaces, follow:

- `.cursor/skills/scaling-ui/SKILL.md`
- `.cursor/rules/scaling-ui.mdc`
- `.cursor/rules/scaling-ui-keys.mdc`
