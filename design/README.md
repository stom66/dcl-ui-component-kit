# Design sources

Affinity (`.af`) source files for this project.

The Decentraland preview watcher (`sdk-commands start`) watches the **whole project** and uses `.dclignore` as its ignore list. `.dclignore` alone does **not** only apply to deploy — the hot-reload watcher uses it too.

This folder (and `**/*.af` / lock files) are listed in `.dclignore` so Affinity autosave should not reload the scene. **Restart the preview** after changing `.dclignore`.

| File | Role |
|---|---|
| [`ui-component-kit-assets.af`](./ui-component-kit-assets.af) | Kit template: buttons, icons, numbers, progress bars, … |
| [`ui-component-kit-assets-sprite-sheets.af`](./ui-component-kit-assets-sprite-sheets.af) | Sprite sheets (radial progress, …) |
| `reference-uis.af` / `ui-assets.af` | Older reference boards |

Export PNGs into the scene as usual (`assets/images/ui-component-kit/` for kit defaults, or `assets/images/themes/<name>/` for project art).

Affinity lock files (`*.af~lock~`) are gitignored — do not commit them.

If saves still reload the scene, the nuclear option is to keep these files **outside** the scene project folder entirely (e.g. a sibling `../dcl-ui-component-kit-design/`).
