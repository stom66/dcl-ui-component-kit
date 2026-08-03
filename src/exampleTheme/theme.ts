import { Color4 } from '@dcl/sdk/math'

import type { ThemeCustomize } from '../scaling-ui/styles/theme'


// MARK: themeOverrides
/**
 * Example project-specific theme overrides.
 *
 * This file is intentionally small, like a Bootstrap custom variables file:
 * only define values that should differ from the default theme. Section defaults
 * live in `scaling-ui/styles/components/*` (e.g. `colors.ts`, `animation.ts`).
 *
 * Put project art under `assets/images/example-theme/` and define atlases /
 * texture sets in `./atlases.ts` so layers import them from one place. Start
 * custom art from the Affinity template at `assets/images/scaling-ui-assets.af`
 * (duplicate artboards, keep grids/margins). Cell coords on `TextureAtlas` are
 * 1-based.
 */
export const themeOverrides: ThemeCustomize = {
	colors: {
		primary: Color4.fromHexString('#ff7538'),
	},
}
