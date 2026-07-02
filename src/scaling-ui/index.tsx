import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { getPlatform, isMobile, isDesktop, isWeb } from '@dcl/sdk/platform'

import { theme } from './styles/theme'
import { SafeZonesDesktop } from './layers/info.safeZone.desktop'
import { SafeZonesMobile } from './layers/info.safeZone.mobile'

import { InfoUI } from './layers/ui.info'

import { SimpleUI } from './layers/ui.simple'


// Export scaling-ui components, utils
export { darken, lighten, alpha } from './utils/colors'
export { theme } from './vars/theme'

// MARK: IS local dev?
declare var process: {
	env: {
		NODE_ENV: string
	}
}
export const IS_DEV = process.env.NODE_ENV == "development"


// TODO: make this more nuanced
const uiScale = isMobile() ? 0.5 : 1


// MARK: Main
const uiComponent = () => [
	InfoUI(),
	//SafeZonesDesktop(), // Comment out to hide the safe zones
	//SafeZonesMobile(), // Comment out to hide the safe zones
	SimpleUI(),
	//ExampleUI(),
]


// MARK: SetupScreenUI
/** Mounts HUD using design resolution from {@link theme}. */
export function SetupScreenUI() {
	ReactEcsRenderer.setUiRenderer(uiComponent, {
		virtualHeight: theme.baseHeight * uiScale,
		virtualWidth : theme.baseWidth * uiScale,
	})
}
