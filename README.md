# Decentraland Scaling UI

### `dcl-scaling-ui`

## UI Architecture

This library provides a higher-level UI framework for Decentraland SDK7, allowing interfaces to be built from reusable, responsive components instead of low-level `UiEntity` primitives.

The UI is composed of four simple building blocks:

* **Layer** - A top-level container representing an independent piece of UI (for example, a scoreboard, player list, or tutorial popup). Layers can be shown, hidden, and ordered independently.
* **Zone** - A predefined safe area within a layer that positions content while avoiding the native Decentraland UI (for example, `top-center`, `bottom-center`, `right-center`, or `fullscreen`).
* **Layout** - Helper components such as `Row`, `Column`, and `Grid` that arrange their children using sensible defaults and responsive behaviour.
* **Components** - Reusable UI elements such as buttons, text, icons, progress bars, and other controls.

This composition allows complex interfaces to be created with minimal code while automatically handling positioning, layout, and responsive sizing.

Example:

```tsx
<Layer id="scoreboard">
  <Zone position="top-center">
    <Row>
      <Text value="Score" />
      <Button textLabel="Reset" />
    </Row>
  </Zone>
</Layer>
```
