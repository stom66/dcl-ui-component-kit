import { Color4 } from '@dcl/sdk/math'

import type { ThemeCustomize } from '../../scaling-ui'


// MARK: theme
/**
 * Showcase theme overrides for the Scaling UI component demos.
 *
 * Only define values that should differ from the default theme. Section defaults
 * live in `scaling-ui/styles/components/*` (e.g. `colors.ts`, `animation.ts`).
 *
 * Put project art under `assets/images/example-themes/showcase/` and define
 * atlases / texture sets in `./atlases.ts`. Start custom art from the Affinity
 * template at `assets/images/scaling-ui-assets.af` (duplicate artboards, keep
 * grids/margins). Cell coords on `TextureAtlas` are 1-based.
 */
export const theme: ThemeCustomize = {
	colors: {
		primary: Color4.fromHexString('#ff7538'),
	},
}
