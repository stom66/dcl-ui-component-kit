import { Color4 } from '@dcl/sdk/math'

import type { ThemeCustomize } from '../../ui-component-kit'


// MARK: theme
/**
 * Showcase theme overrides for the UI Component Kit component demos.
 *
 * Only define values that should differ from the default theme. Section defaults
 * live in `ui-component-kit/styles/components/*` (e.g. `colors.ts`, `animation.ts`).
 *
 * Put project art under `assets/images/example-themes/showcase/` and define
 * atlases / texture sets in `./atlases.ts`. Kit chrome starts from
 * `assets/images/ui-component-kit/src/duck-assets.af`. Showcase sheets (icons,
 * smoke) start from `duck-showcase-assets.af` in this theme's image folder.
 * Duplicate artboards and keep grids/margins. Cell coords on `TextureAtlas` are 1-based.
 */
export const theme: ThemeCustomize = {
	colors: {
		primary: Color4.fromHexString('#ff7538'),
	},
}
