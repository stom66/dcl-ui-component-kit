import { isMobile } from '@dcl/sdk/platform'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'

import { activeLayers } from 'src/scaling-ui/layers'
import { setTheme } from 'src/scaling-ui/styles/theme'
import type { ThemeCustomize } from 'src/scaling-ui/styles/theme'


// Export scaling-ui components, utils
export { darken, lighten, alpha } from 'src/scaling-ui/utils/colors'
export { buildTheme, defaultTheme, getTheme, setTheme, theme } from 'src/scaling-ui/styles/theme'
export type { Theme, ThemeCustomize } from 'src/scaling-ui/styles/theme'

// MARK: IS local dev?
declare var process: {
	env: {
		NODE_ENV: string
	}
}
export const IS_DEV = process.env.NODE_ENV == "development"


// TODO: make this more nuanced
const uiScale = isMobile() ? 0.5 : 1


// MARK: uiComponent
const uiComponent = () => activeLayers.map((Layer) => Layer())


// MARK: SetupScalingUI
/** Mounts HUD using design resolution from the active Scaling UI theme. */
export function SetupScalingUI(
	themeOverrides: ThemeCustomize = {}
) {
	const activeTheme = setTheme(themeOverrides)

	ReactEcsRenderer.setUiRenderer(uiComponent, {
		virtualHeight: activeTheme.baseHeight * uiScale,
		virtualWidth : activeTheme.baseWidth * uiScale,
	})

	return activeTheme
}
