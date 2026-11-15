# Affinity sources (kit)

Affinity (`.af`) sources for the stock UI kit textures. They live under `assets/images/ui-component-kit/src/`, next to the exported PNGs.

The Decentraland preview watcher (`sdk-commands start`) watches the **whole project** and uses `.dclignore` as its ignore list. `.dclignore` alone does **not** only apply to deploy — the hot-reload watcher uses it too.

This folder (`assets/images/ui-component-kit/src/**`) and `**/*.af` / lock files are listed in `.dclignore` so Affinity autosave should not reload the scene. **Restart the preview** after changing `.dclignore`.

| File | Role |
|---|---|
| [`duck-assets.af`](./duck-assets.af) | Kit template: buttons, progress bars, spinners, gradients, backgrounds, … |
| [`reference-uis.af`](./reference-uis.af) | Older reference boards |

Showcase demo sheets (smoke sprites, `atlas-icons-showcase-4x4`) are a separate file: [`assets/images/example-themes/showcase/duck-showcase-assets.af`](../../example-themes/showcase/duck-showcase-assets.af).

Export kit PNGs into `assets/images/ui-component-kit/` (the parent of this folder). Export project art into `assets/images/themes/<name>/`.

`copy-assets` copies the exported PNGs and skips this `src/` folder. These `.af` files stay in the git repo and are left out of the npm package.

Affinity lock files (`*.af~lock~`) are gitignored — do not commit them.

If saves still reload the scene, the nuclear option is to keep these files **outside** the scene project folder entirely (e.g. a sibling `../dcl-ui-component-kit-design/`).
