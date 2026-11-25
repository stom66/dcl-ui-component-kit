# To-do: agent

Tasks for the agent. The human's list is [TODO-human.md](TODO-human.md).

## Once the Explorer MCP is connected

- [ ] List the Explorer's tools and check whether `screenshot` can write to a file path.
  - Can save: route A, capture every shot below directly.
  - Can't: route B, write `scripts/capture-readme-shots.mjs` (open each panel via `ui_list` / `ui_click`, save full frames plus each panel's screen rect), then ask the human to run it.
- [ ] Open each showcase panel through the Explorer (sidebar buttons via `ui_click`), using the panel's `screenRect` for the crop.

## Screenshots

Crop to the component or panel, matching the existing captures in `docs/media/`. GIFs: keep an `.mp4` beside each, like the existing ones (ffmpeg is in `C:\projects\ffmpeg-7.1-full_build`).

| File | Capture |
|---|---|
| `docs/media/components/button-hold.gif` | Buttons panel: both hold buttons, one filled to completion (pulse), one released early (drain) |

- [ ] Capture and crop every shot above (or crop / convert the human's captures).
- [ ] Check every README image link resolves to a file.

## Docs

- [ ] `docs/components.md`, Toggle table: `backgroundColor` still says theme dark; it's now theme success when on, theme dark when off.
- [ ] Update `RangeSlider` docs if in-world testing shows touch-drag works (or doesn't) on mobile.

## Commits (after the human says go)

- [ ] `refactor: rename MultiSelect to SegmentedControl`
- [ ] `feat: add round, inset and capsule RangeSlider shapes`
- [ ] `feat: add Checkbox and NumberInput inputs`
- [ ] `feat: add ButtonHold press-and-hold button`
- [ ] `docs: add ColorPicker, layout and new component screenshots to the README` (only once the images exist)
