import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { ReactEcsRenderer, ScreenInsetArea, UiEntity } from '@dcl/sdk/react-ecs'

import type { Layer } from './components/layers'
import {
	safeZonesDesktopLayer,
	safeZonesMobileLayer,
} from './debug'
import { setTheme } from './styles/theme'
import type { Theme, ThemeCustomize } from './styles/theme'

// MARK: Exports
export { Layer } from './components/layers'
export type { LayerOptions } from './components/layers'

export {
	VisibilityController,
	Zone,
	ZoneBarBottom,
	ZoneBarLeft,
	ZoneBarRight,
	ZoneBarTop,
	ZoneBottomRight,
	ZoneDefault,
	ZoneFullScreen,
	ZoneRoot,
	ZoneType,
} from './components/zones'
export type { ZoneProps } from './components/zones'

export {
	ButtonImage,
	ButtonImageClose,
	ButtonText,
	Column,
	ColumnReverse,
	Divider,
	Header,
	Icon,
	IconNumber,
	Label,
	Row,
	RowReverse,
	SectionHeader,
	UiBox,
} from './components'

export { darken, lighten, alpha } from './utils/colors'
export { PropsController } from './classes/propsController'
export { buildTheme, defaultTheme, getTheme, setTheme, theme } from './styles/theme'


export type { Theme, ThemeCustomize }
export type SetupScalingUIOptions = {
	theme? : ThemeCustomize
	layers : Layer[]
	debug? : {
		showDesktopSafeZones?: boolean
		showMobileSafeZones ?: boolean
	}
}

// MARK: IS_DEV?
declare var process: { env: { NODE_ENV: string } }
export const IS_DEV = process.env.NODE_ENV == 'development'





// MARK: SetupScalingUI
/**
 * Mounts the Scaling UI renderer with the given theme and layer instances.
 * Everything is wrapped in `ScreenInsetArea` so layers stay clear of device
 * hardware insets (notch, status bar, home indicator). Debug safe-zone
 * overlays are appended last and stacked above scene layers.
 */
export function SetupScalingUI({
	theme = {},
	layers,
	debug = {},
}: SetupScalingUIOptions) {
	const activeTheme       = setTheme(theme)
	
	const stack             = [...layers]

	const [vWidth, vHeight] = isMobile() ? [1600, 720]: [1920, 1080]

	if (debug.showDesktopSafeZones) stack.push(safeZonesDesktopLayer)
	if (debug.showMobileSafeZones)  stack.push(safeZonesMobileLayer)

	ReactEcsRenderer.setUiRenderer(
		() => (
			<ScreenInsetArea>
				{stack.map((layer, index) => (
					<UiEntity
						key={layer.id}
						uiTransform={{
							width         : '100%',
							height        : '100%',
							positionType  : 'absolute',
							position      : { left: 0, top: 0 },
							display       : 'flex',
							flexDirection : 'column',
							alignItems    : 'center',
							justifyContent: 'center',
							flexShrink    : 0,
							zIndex        : layer.zIndex ?? index,
						}}
					>
						{layer.render()}
					</UiEntity>
				))}
			</ScreenInsetArea>
		),
		{
			virtualHeight: vHeight,
			virtualWidth : vWidth,
		}
	)

	return activeTheme
}
