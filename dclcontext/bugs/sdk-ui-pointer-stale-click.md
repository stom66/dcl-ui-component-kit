# SDK: UI pointer events dropped as stale (root-entity race)

**Status:** kit workaround shipped in `@stom66/dcl-ui-component-kit` 0.2.7  
**Found:** 2026-10-03  
**Should become:** an upstream PR against `@dcl/ecs` `createInputSystem` (`engine/input.ts` / `dist/engine/input.js`)  
**Kit tear-out:** `src/ui-component-kit/utils/pointerInputPatch.ts` (`ENABLE_POINTER_INPUT_WORKAROUND`) + one call in `SetupUiComponentKit`

## Environment

| Piece | Version |
|---|---|
| Scene | Fastlane (`dcl/`) |
| `@dcl/sdk` | `7.29.1-35154657340.commit-e2bbcc9` |
| Client | Decentraland Explorer (Unity Explorer MCP) |
| Parcel | `0,0` |
| Screen | `1920×1057` |
| UI kit | `@stom66/dcl-ui-component-kit` (this repo) |

Reproduced with a real mouse, cursor free, on `ButtonText` (`btn_mute_toggle`, CRDT id `565`).

## Summary

Explorer writes **the same UI click twice**: once on the UI entity, once on `RootEntity` (`0`), **same timestamp**.

`@dcl/ecs` `inputSystem` keeps **one global watermark** (`previousFrameMaxTimestamp` / `currentFrameMaxTimestamp`). An event is “this frame” only if its timestamp is **strictly newer** than the newest timestamp already seen from **any** entity.

If the root copy arrives one frame before the button copy, the button’s `PET_DOWN` / `PET_UP` are treated as stale. `pointerEventsSystem` never calls the React `onMouseDown` / `onMouseUp`. The click does nothing.

This is not overlapping kit buttons and not two `callback`s. Any scene UI that uses `onMouseDown` / `onMouseUp` (or `pointerEventsSystem.onPointerDown` / `onPointerUp`) on this SDK + Explorer pair can miss.

World clicks that only hit one entity often skip the race. Same-frame pairs still work, so it looks like flaky UI (~30–50% miss) rather than a hard break.

## Suspected cause

Two layers stack:

1. **Explorer dual write (expected client behaviour).** A UI click is posted as `PointerEventsResult` on the hit UI entity **and** as a global / unqualified result on `RootEntity`. Both rows share one timestamp. The Explorer MCP describes the same root broadcast for unbound pointer presses.

2. **SDK global watermark (the bug).** `createInputSystem` → `buttonStateUpdateSystem` and `timestampIsCurrentFrame` in `@dcl/ecs` `engine/input.js`. Comments there show a recent change: iteration used to stop on button state, which skipped the rest of another entity’s commands in the same frame. The fix was a **global** cutoff. That works when both copies land in the same frame. It fails when they land a frame apart with the same timestamp.

```js
// engine/input.js — buttonStateUpdateSystem
if (command.timestamp <= globalState.previousFrameMaxTimestamp) {
	break
}

function timestampIsCurrentFrame(timestamp) {
	return timestamp > globalState.previousFrameMaxTimestamp
		&& timestamp <= globalState.currentFrameMaxTimestamp
}
```

`getInputCommand(action, type, entity)` finds the last matching result **on that entity**, then rejects it with `timestampIsCurrentFrame`. The row is still on the component. The handler never runs.

## Evidence (Explorer scene logs)

Raw `PointerEventsResult` vs kit handlers on Mute (`565`) and root (`0`), same click:

```
raw DOWN entity 0   ts 2068  ok
raw DOWN entity 565 ts 2068  STALE   // no ButtonText: down
raw UP   entity 0   ts 2074  ok
raw UP   entity 565 ts 2074  STALE   // no ButtonText: up — click does nothing
```

When both copies land in one frame, both are `ok` and Mute toggles.

Ten slow real-mouse clicks on Mute: Explorer sent all ten pairs; three had **both** DOWN and UP on `565` marked stale. Those three did nothing. Firing the kit `callback` on any `onMouseUp` only helps when UP still arrives. It cannot recover a fully stale pair.

## Steps to reproduce

1. Scene UI with a `UiEntity` / kit `ButtonText` that logs `onMouseDown` and `onMouseUp`.
2. Run Explorer (this commit SDK). Cursor free.
3. Hold still on the control and click 10 times, about a second apart.
4. Also log every new `PointerEventsResult` on **all** entities (including `0`).

**Pass (after an SDK fix):** 10 downs and 10 ups on the **button** entity, 10 callbacks.

**Fail (current):** some clicks appear only on entity `0` as “current”, and the same timestamp on the button is ignored. Those clicks have no `onMouseDown` / `onMouseUp`.

Do not use Explorer MCP `ui_click` without `device` as the only check — that path synthesises events onto the CRDT id and skips this race.

## Suggested SDK fix (for an upstream PR)

Track the watermark **per entity** (and keep a separate global list for queries that omit `entity`).

In `createInputSystem`:

- Replace `previousFrameMaxTimestamp` / `currentFrameMaxTimestamp` with maps keyed by entity, plus a global pair only for `thisFrameCommands` / no-entity queries.
- In `buttonStateUpdateSystem`, skip a command when `command.timestamp <= previousMaxFor(entity)`, not the global max. Still push every entity’s new commands into `thisFrameCommands`.
- `timestampIsCurrentFrame(timestamp, entity)` uses that entity’s window. `findInputCommand` already has `entity`.
- Treat `timestamp === previousMax` as **not** current for that entity (already delivered). Treat equal timestamps on **different** entities as current for each of them.

Do **not** drop the root-entity write in the client as the only fix. Other systems read global pointer results on `RootEntity`. The input system should allow the same timestamp on more than one entity.

`RootEntity` must stay. It is reserved (`0`). Removing it is not a workaround.

## Kit workaround (temporary)

File: `src/ui-component-kit/utils/pointerInputPatch.ts`  
Installed from: `SetupUiComponentKit` in `src/ui-component-kit/index.tsx`

Wraps `inputSystem.getInputCommand` / `isTriggered`. If the SDK returns null for a **non-root** entity but that entity has a newer matching `PointerEventsResult` than last delivered, return it once.

Desktop kit buttons also fire `callback` on any `onMouseUp` (no hover / press gate). That is correct even after the SDK fix: Explorer only sends UP to the element under the pointer.

### Tear out after the next SDK

1. Confirm 10/10 real-mouse clicks on a kit button with the workaround **disabled**.
2. Set `ENABLE_POINTER_INPUT_WORKAROUND = false` or delete `pointerInputPatch.ts` and the `installPointerInputWorkaround()` call in `SetupUiComponentKit`.
3. Remove the Buttons workaround note in `.cursor/skills/ui-component-kit/SKILL.md` and the README 0.2.0 bullet.

Keep the fire-on-`mouseUp` behaviour and `pointerFilter="block"` on the handler owner. Those are not this bug.
