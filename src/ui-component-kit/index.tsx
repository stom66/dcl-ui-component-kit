import ReactEcs, { ReactEcsRenderer, ScreenInsetArea, UiEntity } from '@dcl/sdk/react-ecs'

import type { Layer } from './components/layers'
import { safeZonesDesktopLayer, safeZonesMobileLayer } from './debug'
import { setTheme } from './styles/theme'
import type { Theme, ThemeCustomize } from './styles/theme'
import { syncVirtualCanvasToPlatform } from './utils/sizing'

// MARK: Exports
export { Layer }                  from './components/layers'
export type { LayerOptions }      from './components/layers'

export { VisibilityController, Zone, ZoneBottom, ZoneBottomCenter, ZoneBottomLeft, ZoneBottomRight, ZoneDefault, ZoneFullScreen, ZoneLeft, ZoneLeftBottom, ZoneLeftTop, ZoneRight, ZoneRightBottom, ZoneRightTop, ZoneRoot, ZoneTop, ZoneTopCenter, ZoneTopLeft, ZoneTopRight, ZoneType } from './components/zones'
export type { VisibilityPosition, ZoneProps } from './components/zones'

export { AvatarIcon, Background, BackgroundGradient, Bounce, ButtonImage, ButtonImageClose, ButtonText, clearToastGroup, Code, Column, ColumnReverse, DEFAULT_AVATAR_USER_ID, Divider, FlashBorder, FlashColor, getToggleProps, Grid, H1, H2, H3, H4, H5, H6, Header, hideToast, Icon, IconCharacter, IconNumber, IconString, IconSymbol, isPlaying, Label, mergeUiBackground, playOnce, ProgressBar, ProgressBarImage, Pulse, resolveContentInset, resolveSpriteLocalFrame, resolveUiBackground, Row, RowReverse, SectionHeader, setLooping, setPlaying, Shake, showToast, Spinner, spriteCycleFrameCount, spriteFrameToUvCell, SpriteIcon, Text, Toggle, toastHostLayer, ToastHostLayer, UiBox, Wiggle } from './components'
export type { ShowToastOptions, ToastGroupPolicy, ToastItem, ToastPhase, ToastPosition } from './components'

export { darken, lighten, alpha } from './utils/colors'
export { resolveAspectDimensions, sizeValueToPixels } from './utils/aspect'
export type { AspectSizeValue, ResolveAspectDimensionsOptions, ResolvedAspectDimensions } from './utils/aspect'
export { flipUVs, getUVCell, getUVColumn, getUVRow, getRotatedUVs, mirrorUVs, rotateUvIndexes } from './utils/uvs'
export type { GetUVCellOptions } from './utils/uvs'
export { PropsController }        from './classes/propsController'
export { buildTheme, defaultTheme, getTheme, setTheme, theme } from './styles/theme'

export { TextureAtlas, atlasBtn1x1, atlasBtn3x1, atlasBtnIcons, atlasBtnIconsStyled, atlasCharsAlphaNumeric, atlasCharsNumbers, atlasCharsSymbols, atlasGradientColors, atlasIconsFontAwesome, findAtlasCell } from './atlases'
export type { AtlasCell, AtlasLayout, AtlasTexture, AtlasTextureFilterMode, AtlasTextureSlices, AtlasTextureWrapMode, TextureAtlasCellOptions, TextureAtlasCharInset, TextureAtlasNamedCell, TextureAtlasOptions } from './atlases'

export type { AnimationPlaybackState, AvatarIconProps, BounceProps, BurstAnimationProps, BurstSample, ContentInset, ContentInsetEdges, FillFrom, FlashBorderProps, FlashColorProps, GradientDirection, GridDirection, GridProps, IconProps, ProgressBarImageProps, ProgressBarImageTextures, ProgressBarOrientation, ProgressBarProps, PulseProps, ResolvedContentInset, ShakeProps, SpinnerProps, SpriteIconProps, TextureSlices, ToggleProps, WiggleProps } from './components'
export type { Theme, ThemeCustomize }
export type SetupUiComponentKitOptions = {
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





// MARK: SetupUiComponentKit
/**
 * Mounts the UI Component Kit renderer with the given theme and layer instances.
 * Everything is wrapped in `ScreenInsetArea` so layers stay clear of device
 * hardware insets (notch, status bar, home indicator). Debug safe-zone
 * overlays are appended last and stacked above scene layers.
 */
export function SetupUiComponentKit({
	theme = {},
	layers,
	debug = {},
}: SetupUiComponentKitOptions) {
	const activeTheme = setTheme(theme)
	const stack       = [...layers]
	// isMobile() is unreliable at module import — resolve virtual canvas here.
	const virtual     = syncVirtualCanvasToPlatform()

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
							position      : { top: 0, left: 0 },
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
			virtualHeight: virtual.height,
			virtualWidth : virtual.width,
		}
	)

	return activeTheme
}
