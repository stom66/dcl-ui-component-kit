import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'

import type { Layer } from './components/layers'
import { ZoneType } from './components/zones'
import { safeZonesDesktopLayer, safeZonesMobileLayer } from './debug'
import { setTheme } from './styles/theme'
import type { Theme, ThemeCustomize } from './styles/theme'
import { syncVirtualCanvasToPlatform } from './utils/sizing'

// MARK: Exports
export { Layer }                  from './components/layers'
export type { LayerOptions }      from './components/layers'

export { VisibilityController, Zone, ZoneRoot, ZoneType, getLeftZoneInset } from './components/zones'
export type { VisibilityPosition, ZoneProps } from './components/zones'

export { AvatarIcon, Background, BackgroundGradient, Bounce, ButtonImage, ButtonImageClose, ButtonText, clearToastGroup, Code, Column, ColumnReverse, DEFAULT_AVATAR_USER_ID, Divider, FlashBorder, FlashColor, getToggleProps, Grid, H1, H2, H3, H4, H5, H6, Header, hideToast, Icon, IconCharacter, IconNumber, IconString, IconSymbol, isPlaying, Label, mergeUiBackground, playOnce, ProgressBar, ProgressBarImage, Pulse, resolveContentInset, resolveSpriteLocalFrame, resolveUiBackground, Row, RowReverse, SectionHeader, setLooping, setPlaying, Shake, showToast, Spinner, spriteCycleFrameCount, spriteFrameToUvCell, SpriteIcon, Text, Toggle, toastHostLayer, ToastHostLayer, UiBox, Wiggle } from './components'
export type { ShowToastOptions, ToastGroupPolicy, ToastItem, ToastPhase, ToastPosition } from './components'

export { darken, lighten, alpha } from './utils/colors'
export { resolveLayoutFontSize, resolveTypographySize, scaleThemeFontSize, scaleUiTextFontSize } from './utils/typography'
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

/**
 * Passed straight to `ReactEcsRenderer.setUiRenderer`. SDK 7.26+ defaults to
 * `'device'` (hardware safe area); this kit defaults to `'none'` so layout
 * matches pre-7.26. Do not also wrap the tree in `ScreenInsetArea` /
 * `InteractableArea` — that double-applies the margin.
 */
export type KitScreenInset = 'none' | 'device' | 'interactable'

export type SetupUiComponentKitOptions = {
	theme?       : ThemeCustomize
	layers       : Layer[]
	screenInset? : KitScreenInset
	debug?       : {
		showDesktopSafeZones?: boolean
		showMobileSafeZones ?: boolean
	}
}


// MARK: renderLayerShell
/**
 * Mounts one layer into the renderer stack.
 *
 * `ZoneType.Default` is a relative, centered box — it needs a full-canvas flex
 * parent. Every other zone is already `position: absolute` against the canvas.
 * Wrapping those in a 100% shell leaves an invisible hit-target over the rest
 * of the screen (the left nav at z 1000 covered the Safe Zones panel).
 */
function renderLayerShell(layer: Layer): ReactEcs.JSX.Element[] {
	const content = layer.render()
	const nodes   = content == null
		? []
		: Array.isArray(content)
			? content
			: [content]

	if (layer.zone !== ZoneType.Default) return nodes

	return [
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
				...(layer.zIndex !== undefined ? { zIndex: layer.zIndex } : {}),
			}}
		>
			{nodes}
		</UiEntity>,
	]
}


// MARK: SetupUiComponentKit
/**
 * Mounts the UI Component Kit renderer with the given theme and layer instances.
 *
 * Layers render as a flat list. `screenInset` is the SDK renderer option
 * (default `'none'`). Debug safe-zone overlays are appended last.
 */
export function SetupUiComponentKit({
	theme       = {},
	layers,
	screenInset = 'none',
	debug       = {},
}: SetupUiComponentKitOptions) {
	const activeTheme = setTheme(theme)
	const stack       = [...layers]
	// isMobile() is unreliable at module import — resolve virtual canvas here.
	const virtual     = syncVirtualCanvasToPlatform()

	if (debug.showDesktopSafeZones) stack.push(safeZonesDesktopLayer)
	if (debug.showMobileSafeZones)  stack.push(safeZonesMobileLayer)

	ReactEcsRenderer.setUiRenderer(
		() => stack.flatMap(renderLayerShell),
		{
			virtualHeight: virtual.height,
			virtualWidth : virtual.width,
			screenInset,
		}
	)

	return activeTheme
}
