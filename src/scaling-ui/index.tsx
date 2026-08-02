import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { ReactEcsRenderer, ScreenInsetArea, UiEntity } from '@dcl/sdk/react-ecs'

import type { Layer } from './components/layers'
import { safeZonesDesktopLayer, safeZonesMobileLayer } from './debug'
import { setTheme } from './styles/theme'
import type { Theme, ThemeCustomize } from './styles/theme'

// MARK: Exports
export { Layer }                  from './components/layers'
export type { LayerOptions }      from './components/layers'

export { VisibilityController, Zone, ZoneBottom, ZoneBottomLeft, ZoneBottomRight, ZoneDefault, ZoneFullScreen, ZoneLeft, ZoneRight, ZoneRoot, ZoneTop, ZoneTopLeft, ZoneTopRight, ZoneType } from './components/zones'
export type { ZoneProps }         from './components/zones'

export { AvatarIcon, Background, BackgroundGradient, Bounce, ButtonImage, ButtonImageClose, ButtonText, Code, Column, ColumnReverse, DEFAULT_AVATAR_USER_ID, Divider, FlashColor, H1, H2, H3, H4, H5, H6, Header, Icon, IconNumber, isPlaying, Label, playOnce, ProgressBar, ProgressBarImage, Pulse, Row, RowReverse, SectionHeader, setLooping, setPlaying, Shake, Spinner, SpinnerBeamsEven, SpinnerBeamsVaried, SpinnerCircle, SpinnerDots, SpinnerHourglass, SpinnerThreeQuarterCircle, Text, UiBox, Wiggle } from './components'

export { darken, lighten, alpha } from './utils/colors'
export { resolveAspectDimensions, sizeValueToPixels } from './utils/aspect'
export type { AspectSizeValue, ResolveAspectDimensionsOptions, ResolvedAspectDimensions } from './utils/aspect'
export { flipUVs, getUVCell, getUVColumn, getUVRow, getRotatedUVs, mirrorUVs, rotateUvIndexes } from './utils/uvs'
export type { GetUVCellOptions } from './utils/uvs'
export { PropsController }        from './classes/propsController'
export { buildTheme, defaultTheme, getTheme, setTheme, theme } from './styles/theme'

export { TextureAtlas, atlasBtnIcons, atlasBtnIconsStyled, atlasCharsAlphaNumeric, atlasCharsNumbers, atlasCharsSymbols, atlasGradientColors, atlasIcons, atlasIcons2048, atlasSpinners, findAtlasCell } from './atlases'
export type { AtlasCell, AtlasLayout, TextureAtlasCellOptions, TextureAtlasNamedCell, TextureAtlasOptions } from './atlases'

export type { AnimationPlaybackState, AvatarIconProps, BounceProps, BurstSample, FillFrom, FlashColorProps, GradientDirection, ProgressBarImageProps, ProgressBarImageTextures, ProgressBarOrientation, ProgressBarProps, PulseProps, ShakeProps, SpinnerProps, TextureSlices, WiggleProps } from './components'
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
