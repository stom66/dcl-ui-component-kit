import { engine, type Entity } from '@dcl/sdk/ecs'
import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'

import type { KitScreenInset, Layer } from './components/layers'
import { ZoneType } from './components/zones'
import { safeZonesDesktopLayer, safeZonesMobileLayer } from './debug'
import { setTheme } from './styles/theme'
import type { Theme, ThemeCustomize } from './styles/theme'
import { syncVirtualCanvasToPlatform } from './utils/sizing'

// MARK: Exports
export { Layer }                  from './components/layers'
export type { KitScreenInset, LayerOptions } from './components/layers'

export { VisibilityController, Zone, ZoneRoot, ZoneType, getLeftZoneInset } from './components/zones'
export type { VisibilityPosition, ZoneProps } from './components/zones'

export { AvatarIcon, Background, BackgroundGradient, Bounce, ButtonImage, ButtonImageClose, ButtonText, clearToastGroup, Code, Column, ColumnReverse, DEFAULT_AVATAR_USER_ID, Divider, FlashBorder, FlashColor, getToggleProps, Grid, H1, H2, H3, H4, H5, H6, Header, hideToast, Icon, IconCharacter, IconNumber, IconString, IconSymbol, isPlaying, Label, mergeUiBackground, playOnce, ProgressBar, ProgressBarImage, Pulse, resolveContentInset, resolveSpriteLocalFrame, resolveUiBackground, Row, RowReverse, SectionHeader, setLooping, setPlaying, Shake, showToast, Spinner, spriteCycleFrameCount, spriteFrameToUvCell, SpriteIcon, Text, Toggle, toastHostLayer, ToastHostLayer, UiBox, Wiggle } from './components'
export type { ShowToastOptions, ToastGroupPolicy, ToastItem, ToastPhase, ToastPosition } from './components'

export { darken, lighten, alpha } from './utils/colors'
export { easingFunctions, lerp, tweenValue } from './utils/tweens'
export type { EasingFn } from './utils/tweens'
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

export type SetupUiComponentKitOptions = {
	theme?       : ThemeCustomize
	layers       : Layer[]
	/**
	 * Default inset for layers that omit `inset`. Kit default `'none'`.
	 * Layers that share the same resolved inset share one SDK UI renderer.
	 * Do not also wrap the tree in `ScreenInsetArea` / `InteractableArea`.
	 */
	screenInset? : KitScreenInset
	debug?       : {
		showDesktopSafeZones?: boolean
		showMobileSafeZones ?: boolean
	}
}


const INSET_ORDER: KitScreenInset[] = ['none', 'device', 'interactable']

/** Stable dummy entities for `addUiRenderer` (one per non-main inset bucket). */
const insetRendererEntities = new Map<KitScreenInset, Entity>()


// MARK: getInsetRendererEntity
/** Returns a stable engine entity for an additional inset renderer. */
function getInsetRendererEntity(inset: KitScreenInset): Entity {
	let entity = insetRendererEntities.get(inset)
	if (entity === undefined) {
		entity = engine.addEntity()
		insetRendererEntities.set(inset, entity)
	}
	return entity
}


// MARK: renderLayerShell
/**
 * Mounts one layer into its inset renderer stack.
 *
 * `ZoneType.Default` is a relative, centered box — it needs a full-canvas flex
 * parent (relative to that renderer’s already-inset canvas). Every other zone
 * is already `position: absolute`. Wrapping those in a 100% shell leaves an
 * invisible hit-target over the rest of the screen.
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


// MARK: bucketLayersByInset
/**
 * Groups layers by resolved inset (`layer.inset ?? defaultInset`).
 * Relative order within each bucket matches the input stack.
 */
function bucketLayersByInset(
	layers      : Layer[],
	defaultInset: KitScreenInset,
): Record<KitScreenInset, Layer[]> {
	const buckets: Record<KitScreenInset, Layer[]> = {
		none         : [],
		device       : [],
		interactable : [],
	}

	for (const layer of layers) {
		const inset = layer.inset ?? defaultInset
		buckets[inset].push(layer)
	}

	return buckets
}


// MARK: pickMainInset
/**
 * Prefers the Setup default bucket when non-empty; otherwise first non-empty
 * in none → device → interactable order.
 */
function pickMainInset(
	buckets     : Record<KitScreenInset, Layer[]>,
	defaultInset: KitScreenInset,
): KitScreenInset {
	if (buckets[defaultInset].length > 0) return defaultInset

	for (const inset of INSET_ORDER) {
		if (buckets[inset].length > 0) return inset
	}

	return defaultInset
}


// MARK: SetupUiComponentKit
/**
 * Mounts the UI Component Kit with the given theme and layer instances.
 *
 * Layers are grouped by resolved `inset` (Layer option, else Setup
 * `screenInset`, default `'none'`). At most three SDK UI renderers:
 * `setUiRenderer` for the main bucket (owns virtual canvas size) and
 * `addUiRenderer` for the others. Cross-inset stacking uses Layer `zIndex`.
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

	const buckets   = bucketLayersByInset(stack, screenInset)
	const mainInset = pickMainInset(buckets, screenInset)

	ReactEcsRenderer.setUiRenderer(
		() => buckets[mainInset].flatMap(renderLayerShell),
		{
			virtualHeight: virtual.height,
			virtualWidth : virtual.width,
			screenInset  : mainInset,
		},
	)

	for (const inset of INSET_ORDER) {
		if (inset === mainInset) continue
		if (buckets[inset].length === 0) {
			const existing = insetRendererEntities.get(inset)
			if (existing !== undefined) {
				ReactEcsRenderer.removeUiRenderer(existing)
			}
			continue
		}

		const entity = getInsetRendererEntity(inset)
		ReactEcsRenderer.addUiRenderer(
			entity,
			() => buckets[inset].flatMap(renderLayerShell),
			{ screenInset: inset },
		)
	}

	return activeTheme
}
