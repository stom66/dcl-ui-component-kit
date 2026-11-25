# To-do: human

Tasks only you can do. The agent's own list is [TODO-agent.md](TODO-agent.md).

## Connect the Explorer MCP

- [ ] Add the Explorer MCP to the Claude desktop app. Open `claude_desktop_config.json` and add this under `mcpServers`:

  ```json
  "unity-explorer": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "http://127.0.0.1:8123/unity-explorer-mcp"]
  }
  ```

- [ ] Restart the Claude desktop app.
- [ ] Start the scene preview with the MCP server on: Creator Hub → **Play** with **Play Options > Desktop Client > Enable MCP Server** ticked.
- [ ] Tell the agent it's connected. It checks whether the Explorer's screenshot tool can save files and picks one of the two screenshot routes below.

## Screenshots

Do **one** of these, depending on what the agent finds:

- [ ] **Route A (agent captures):** nothing to do. The agent opens each demo panel, captures and crops it.
- [ ] **Route B (script):** run the capture script the agent writes (`node scripts/capture-readme-shots.mjs`) once with the preview open, then tell the agent the frames are saved.
- [ ] **Route C (by hand):** capture the shots listed in [TODO-agent.md](TODO-agent.md#screenshots), drop them into the project at those paths (raw recordings are fine, e.g. `.mp4`), then tell the agent to integrate them into the README.

## Test in-world

- [ ] Check `SegmentedControl` on desktop: clicking an option selects it; the outline example cycles and wraps; the icon example works.
- [ ] Check the four `RangeSlider` shapes on desktop: tap jumps, hold-and-drag follows the cursor, release anywhere ends the drag.
- [ ] Check `Checkbox`: click / tap toggles, the label toggles too, the star and empty-box variants look right.
- [ ] Check `NumberInput`: − / + respect min and max; typing a value and pressing Enter clamps and snaps it; nonsense text reverts. On a phone, check the keyboard opens and submitting works.
- [ ] Check `ButtonHold` (Buttons panel): holding fills, releasing early drains at twice the speed, filling pulses once and bumps the counter; releasing off the button still drains.
- [ ] Check both on a phone: taps work; tell the agent whether dragging a finger along a slider also moves it.

## Review and ship

- [ ] Review the uncommitted work (SegmentedControl rename, slider shapes, Checkbox, NumberInput, ButtonHold, README updates) and tell the agent to commit it.
- [ ] Push `main` when happy.
- [ ] Check `.claude/skills/` in `git status` on Windows before committing: they're tracked files but links on disk, and must not be committed as deletions.
