import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, UiTransformProps } from '@dcl/sdk/react-ecs'

import { type TextureAtlas, type TextureAtlasCellOptions, type TextureAtlasNamedCell } from '../../atlases'
import { getTheme } from '../../styles'
import { flipUVs, mirrorUVs, rotateUvIndexes } from '../../utils/uvs'

import { UiBox, type UiBoxProps } from '../base'

import { type FillFrom, resolveDefaultBorderRadius, resolveFillFrom, resolveProceduralFillInset, syncDisplayValue, valueToPercent, Z_INDEX_BACKGROUND, Z_INDEX_BORDER, Z_INDEX_CONTENT, Z_INDEX_FILL } from './progressBar.shared'


export type TextureSlices = {
	top   : number
	bottom: number
	left  : number
	right : number
}

/**
 * Per-layer texture paths. Every layer is optional — omit a key (or pass
 * `undefined`) to use the matching procedural colour props instead.
 */
export type ProgressBarImageTextures = {
	background?: string
	fill?      : string
	border?    : string
}

export type ProgressBarOrientation = 'horizontal' | 'vertical'

/** Horizontal nine-slice defaults: larger caps on the short (vertical) axis. */
const DEFAULT_TEXTURE_SLICES_HORIZONTAL: TextureSlices = {
	top   : 0.25,
	bottom: 0.25,
	left  : 0.0625,
	right : 0.0625,
}

/** Vertical nine-slice defaults: horizontal caps swapped with vertical. */
const DEFAULT_TEXTURE_SLICES_VERTICAL: TextureSlices = {
	top   : DEFAULT_TEXTURE_SLICES_HORIZONTAL.left,
	bottom: DEFAULT_TEXTURE_SLICES_HORIZONTAL.right,
	left  : DEFAULT_TEXTURE_SLICES_HORIZONTAL.top,
	right : DEFAULT_TEXTURE_SLICES_HORIZONTAL.bottom,
}

/** Default UV for `atlasGradientColors` fill: cols 4–5, UV row 11, insetY 0.4. */
const DEFAULT_UV_CELL: TextureAtlasCellOptions = {
	xStart: 4,
	xEnd  : 5,
	yStart: 11,
	insetY: 0.4,
}

const TEXTURES_HORIZONTAL: Required<ProgressBarImageTextures> = {
	background: 'assets/images/scaling-ui/progressBar-horizontal-background.png',
	fill      : 'assets/images/scaling-ui/progressBar-horizontal-fill.png',
	border    : 'assets/images/scaling-ui/progressBar-horizontal-border.png',
}

const TEXTURES_VERTICAL: Required<ProgressBarImageTextures> = {
	background: 'assets/images/scaling-ui/progressBar-vertical-background.png',
	fill      : 'assets/images/scaling-ui/progressBar-vertical-fill.png',
	border    : 'assets/images/scaling-ui/progressBar-vertical-border.png',
}

export type ProgressBarImageProps = Omit<
	UiBoxProps,
	'uiTransform' | 'backgroundColor' | 'borderColor' | 'borderWidth' | 'borderRadius'
> & {
	/** Unique id for the per-instance PropsController / lerp state. */
	id              : string
	/** Current progress value (lerped toward on change). */
	value           : number
	/** Lower bound of the value range. Defaults to `0`. */
	minValue?       : number
	/** Upper bound of the value range. Defaults to `100`. */
	maxValue?       : number
	/** Edge the fill grows from. Defaults to `'left'`. */
	fillFrom?       : FillFrom
	width?          : PositionUnit | 'auto'
	height?         : PositionUnit | 'auto'
	/** Procedural fill colour when neither `textures.fill` nor `atlas` is set. Defaults to theme primary. */
	fillColor?      : Color4
	/** Procedural track colour when `textures.background` is omitted. Defaults to theme dark. */
	backgroundColor?: Color4
	/**
	 * Border colour. Defaults to theme secondary for procedural borders.
	 * When `textures.border` is set, the default is not applied (texture stays
	 * untinted); pass `borderColor` explicitly to tint an image border.
	 */
	borderColor?    : Color4
	/** Procedural border width when `textures.border` is omitted. Defaults to theme border width. */
	borderWidth?    : number
	/**
	 * Corner radius for procedural layers. Defaults to half the shortest
	 * measurable axis (pill shape).
	 */
	borderRadius?   : number
	/**
	 * Texture set orientation. Defaults from `fillFrom`
	 * (`top` / `bottom` → vertical, otherwise horizontal).
	 * Only used when `textures` and `atlas` are both omitted (built-in full set).
	 */
	orientation?    : ProgressBarOrientation
	/**
	 * Optional per-layer nine-slice texture paths. Omit `textures` (and `atlas`)
	 * for the built-in full image set. Pass a partial object to mix image layers
	 * with procedural colours — e.g. `{ fill }` + procedural border.
	 */
	textures?       : ProgressBarImageTextures
	/**
	 * Optional atlas for the fill (stretch + UV cell, no colour tint).
	 * When set, defaults `textures` to `{}` (procedural track/border) unless
	 * `textures` is also passed. Defaults cell via `uvCell`.
	 */
	atlas?          : TextureAtlas<Record<string, TextureAtlasNamedCell>>
	/**
	 * UV cell within `atlas` (1-based inclusive).
	 * Prefer a named region: `uvCell={atlas.named.yellowOrange}`.
	 * Defaults to columns 4–5, UV row 11, `insetY: 0.4`.
	 * Per-edge crops (`insetLeft` / `insetRight` / …) are fractions of the
	 * selected region (0–1) — e.g. `insetRight: 1 - fillRatio`.
	 */
	uvCell?         : TextureAtlasCellOptions
	/**
	 * When using `atlas`, crop the UV cell to the current fill ratio so the
	 * gradient is revealed rather than stretched. Crops along the atlas
	 * gradient axis (left/right) opposite `fillFrom` (`1 - percent/100`);
	 * vertical `fillFrom` uses the same axis before the 90° UV rotate.
	 * Respects `uvMirror` / `uvFlip` so the inset stays aligned with the
	 * fill origin. Defaults to `false`.
	 */
	uvCropWithFill? : boolean
	/**
	 * Mirror atlas UVs horizontally (left ↔ right). Useful with
	 * `fillFrom="right"` so the gradient leads from the origin edge.
	 * When set with `uvCropWithFill`, the crop edge is swapped to match.
	 * Defaults to `false`.
	 */
	uvMirror?       : boolean
	/**
	 * Flip atlas UVs vertically (UV bottom ↔ top). When set with
	 * `uvCropWithFill`, the crop edge is swapped to match. Defaults to `false`.
	 */
	uvFlip?         : boolean
	/**
	 * Nine-slice margins as fractions of each full-texture layer (0–1).
	 * Defaults by orientation: horizontal → `0.25` top/bottom, `0.0625` left/right;
	 * vertical swaps those pairs. Ignored for atlas fill.
	 */
	textureSlices?  : TextureSlices
	/**
	 * Pixel inset for fill (+ image background) inside the border.
	 * Defaults to `0` when the border is a texture, or the procedural border
	 * width when the border is procedural (keeps fill inside the stroke).
	 */
	contentInset?   : number
	/** Seconds to lerp when `value` changes. Defaults to theme animation value. */
	lerpDuration?   : number
	uiTransform?    : UiTransformProps
}


// MARK: resolveOrientation
/** Picks horizontal vs vertical textures from fill direction. */
function resolveOrientation(
	orientation: ProgressBarOrientation | undefined,
	fillFrom   : FillFrom,
): ProgressBarOrientation {
	if (orientation !== undefined) return orientation
	return fillFrom === 'top' || fillFrom === 'bottom' ? 'vertical' : 'horizontal'
}


// MARK: resolveTextures
/**
 * Resolves texture paths.
 * - `textures` provided → used as-is (missing keys → procedural)
 * - `atlas` only → empty set (procedural track/border + atlas fill)
 * - neither → built-in full nine-slice set for `orientation`
 */
function resolveTextures(
	textures   : ProgressBarImageTextures | undefined,
	orientation: ProgressBarOrientation,
	hasAtlas   : boolean,
): ProgressBarImageTextures {
	if (textures !== undefined) return textures
	if (hasAtlas) return {}
	return orientation === 'vertical' ? TEXTURES_VERTICAL : TEXTURES_HORIZONTAL
}


// MARK: hasTexture
/** True when a non-empty texture path was provided for a layer. */
function hasTexture(src: string | undefined): src is string {
	return typeof src === 'string' && src.length > 0
}


// MARK: resolveTextureSlices
/** Nine-slice defaults for orientation, or the caller's explicit slices. */
function resolveTextureSlices(
	textureSlices: TextureSlices | undefined,
	orientation  : ProgressBarOrientation,
): TextureSlices {
	if (textureSlices !== undefined) return textureSlices
	return orientation === 'vertical'
		? DEFAULT_TEXTURE_SLICES_VERTICAL
		: DEFAULT_TEXTURE_SLICES_HORIZONTAL
}


// MARK: layerNineSlice
/** Full-texture nine-slice layer (no UV sub-rect). Omit `tint` for no colour multiply. */
function layerNineSlice(
	src   : string,
	slices: TextureSlices,
	tint? : Color4,
) {
	return {
		texture      : { src },
		textureMode  : 'nine-slices' as const,
		textureSlices: slices,
		...(tint !== undefined ? { color: tint } : {}),
	}
}


/**
 * `rotateUvIndexes` steps so a horizontal atlas gradient follows the bar axis.
 * Horizontal fills stay as authored (crop left/right reveals). Vertical fills
 * share one 90° turn (atlas left → top); crop left/right selects top vs bottom.
 */
const FILL_FROM_UV_ROTATION: Record<FillFrom, number> = {
	left  : 0,
	right : 0,
	top   : 1,
	bottom: 1,
}


// MARK: layerAtlas
/** Atlas UV fill — stretch mode, no colour tint (atlas colours as-authored). */
function layerAtlas(
	atlas    : TextureAtlas<Record<string, TextureAtlasNamedCell>>,
	uvCell   : TextureAtlasCellOptions,
	fillFrom : FillFrom,
	uvMirror : boolean,
	uvFlip   : boolean,
) {
	let uvs = atlas.cell(uvCell)
	const steps = FILL_FROM_UV_ROTATION[fillFrom]
	if (steps !== 0) uvs = rotateUvIndexes(uvs, steps)
	if (uvMirror)    uvs = mirrorUVs(uvs)
	if (uvFlip)      uvs = flipUVs(uvs)

	return {
		textureMode: 'stretch' as const,
		texture    : atlas.texture,
		uvs,
	}
}


// MARK: resolveUvCropEdge
/**
 * Trailing (empty-side) crop edge for `fillFrom` in atlas-native space
 * (horizontal gradient axis). Vertical fills crop left/right too — the UV
 * rotate then maps that axis onto the bar. Swapped when `uvMirror` /
 * `uvFlip` will run after rotate so the reveal still matches the origin.
 */
function resolveUvCropEdge(
	fillFrom : FillFrom,
	uvMirror : boolean,
	uvFlip   : boolean,
): 'left' | 'right' | 'top' | 'bottom' {
	let edge: 'left' | 'right' | 'top' | 'bottom'
	switch (fillFrom) {
		case 'right' :
		case 'bottom': edge = 'left'; break
		case 'top'   :
		case 'left'  :
		default      : edge = 'right'; break
	}

	// Mirror / vertical flip run after rotate — invert the crop axis to match.
	if (uvMirror && (edge === 'left' || edge === 'right')) {
		edge = edge === 'left' ? 'right' : 'left'
	}
	if (uvFlip && (fillFrom === 'top' || fillFrom === 'bottom')) {
		edge = edge === 'left' ? 'right' : 'left'
	}

	return edge
}


// MARK: resolveUvCellForFill
/**
 * Optionally crops `uvCell` to the fill ratio (`1 - percent/100` on the
 * trailing edge for `fillFrom`) so atlas gradients reveal instead of stretch.
 * Crop edge respects `uvMirror` / `uvFlip` so inset direction stays aligned
 * with the fill origin after those transforms.
 */
function resolveUvCellForFill(
	uvCell         : TextureAtlasCellOptions,
	fillFrom       : FillFrom,
	percent        : number,
	uvCropWithFill : boolean,
	uvMirror       : boolean,
	uvFlip         : boolean,
): TextureAtlasCellOptions {
	if (!uvCropWithFill) return uvCell

	const crop = 1 - Math.min(1, Math.max(0, percent / 100))
	const edge = resolveUvCropEdge(fillFrom, uvMirror, uvFlip)

	switch (edge) {
		case 'left'  : return { ...uvCell, insetLeft  : crop }
		case 'right' : return { ...uvCell, insetRight : crop }
		case 'top'   : return { ...uvCell, insetTop   : crop }
		case 'bottom': return { ...uvCell, insetBottom: crop }
	}
}


// MARK: ProgressBarImage
/**
 * Image / hybrid progress bar. Each of background, fill, and border can be an
 * image (`textures.*`), an atlas UV fill (`atlas` + `uvCell`), or procedural
 * (`backgroundColor` / `fillColor` / `borderColor` + `borderWidth`).
 *
 * - Omit `textures` and `atlas` → built-in full nine-slice set
 * - Partial `textures` → mix image + procedural layers
 * - `atlas` alone → gradient-atlas fill + procedural track/border
 *
 * Same value API as `ProgressBar`.
 */
export function ProgressBarImage({
	id,
	value,
	minValue         = 0,
	maxValue         = 100,
	fillFrom         = 'left',
	width            = '100%',
	height           = 24,
	fillColor,
	backgroundColor,
	borderColor,
	borderWidth,
	borderRadius,
	orientation,
	textures,
	atlas,
	uvCell           = DEFAULT_UV_CELL,
	uvCropWithFill   = false,
	uvMirror         = false,
	uvFlip           = false,
	textureSlices,
	contentInset,
	lerpDuration,
	uiTransform,
	uiBackground,
	children,
	...props
}: ProgressBarImageProps) {
	const theme          = getTheme()
	const duration       = lerpDuration ?? theme.animation.progressBarLerpDurationDefault
	const useAtlasFill   = atlas !== undefined
	const resolvedOrient = resolveOrientation(orientation, fillFrom)
	const resolved       = resolveTextures(textures, resolvedOrient, useAtlasFill)
	const slices         = resolveTextureSlices(textureSlices, resolvedOrient)
	const useBgTex       = hasTexture(resolved.background)
	const useFillTex     = !useAtlasFill && hasTexture(resolved.fill)
	const useBorderTex   = hasTexture(resolved.border)

	const fill           = fillColor       ?? theme.colors.primary
	const track          = backgroundColor ?? theme.colors.dark
	const border         = borderColor     ?? theme.colors.secondary
	const bWidth         = borderWidth     ?? theme.border.width
	const bRadius        = borderRadius    ?? resolveDefaultBorderRadius(width, height)
	const inset          = contentInset   !== undefined
		? Math.max(0, contentInset)
		: (useBorderTex ? 0: resolveProceduralFillInset(bWidth))
	const fillRadius     = Math.max(0, bRadius - inset)

	const display        = syncDisplayValue(id, value, minValue, maxValue, duration)
	const percent        = valueToPercent(display, minValue, maxValue)
	const layout         = resolveFillFrom(fillFrom, percent)
	const atlasUv        = resolveUvCellForFill(
		uvCell,
		fillFrom,
		percent,
		uvCropWithFill,
		uvMirror,
		uvFlip,
	)

	const fillBackground = useAtlasFill
		? layerAtlas(atlas, atlasUv, fillFrom, uvMirror, uvFlip)
		: useFillTex
			? layerNineSlice(resolved.fill!, slices)
			: undefined

	return (
		<UiBox
			{...props}
			uiTransform={{
				width         : width,
				height        : height,
				...(height !== 'auto' ? { minHeight: height } : {}),
				display       : 'flex',
				flexDirection : layout.flexDirection,
				alignItems    : layout.alignItems,
				justifyContent: 'flex-start',
				flexGrow      : 0,
				flexShrink    : 0,
				overflow      : 'hidden',
				borderRadius  : bRadius,
				...uiTransform,
			}}
			uiBackground={uiBackground}
		>
			{/* Background (back) */}
			<UiBox
				key             = {`${id}_bg`}
				backgroundColor = {useBgTex ? undefined : track}
				uiTransform={{
					positionType: 'absolute',
					position    : {
						top   : useBgTex ? inset : 0,
						right : useBgTex ? inset : 0,
						bottom: useBgTex ? inset : 0,
						left  : useBgTex ? inset : 0,
					},
					borderRadius: bRadius,
					zIndex      : Z_INDEX_BACKGROUND,
				}}
				uiBackground={useBgTex ? layerNineSlice(resolved.background!, slices) : undefined}
			/>

			{/* Fill (middle) — inset + clipped so textures stay inside the border */}
			<UiBox
				key = {`${id}_fill_host`}
				uiTransform={{
					positionType  : 'absolute',
					position      : { top: inset, right: inset, bottom: inset, left: inset },
					display       : 'flex',
					flexDirection : layout.flexDirection,
					alignItems    : layout.alignItems,
					justifyContent: 'flex-start',
					overflow      : 'hidden',
					borderRadius  : fillRadius,
					zIndex        : Z_INDEX_FILL,
				}}
			>
				<UiBox
					key             = {`${id}_fill`}
					backgroundColor = {fillBackground ? undefined : fill}
					uiTransform={{
						width       : layout.fillWidth,
						height      : layout.fillHeight,
						borderRadius: fillRadius,
						flexGrow    : 0,
						flexShrink  : 0,
					}}
					uiBackground={fillBackground}
				/>
			</UiBox>

			{/* Border (front) — image (tintable) or procedural */}
			{useBorderTex ? (
				<UiBox
					key = {`${id}_border`}
					uiTransform={{
						positionType: 'absolute',
						position    : { top: 0, right: 0, bottom: 0, left: 0 },
						zIndex      : Z_INDEX_BORDER,
					}}
					uiBackground={layerNineSlice(resolved.border!, slices, borderColor)}
				/>
			) : (
				<UiBox
					key          = {`${id}_border`}
					borderColor  = {border}
					borderWidth  = {bWidth}
					borderRadius = {bRadius}
					uiTransform={{
						positionType: 'absolute',
						position    : { top: 0, right: 0, bottom: 0, left: 0 },
						zIndex      : Z_INDEX_BORDER,
					}}
				/>
			)}

			{children != null && (
				<UiBox
					key = {`${id}_content`}
					uiTransform={{
						positionType  : 'absolute',
						position      : { top: 0, right: 0, bottom: 0, left: 0 },
						display       : 'flex',
						alignItems    : 'center',
						justifyContent: 'center',
						zIndex        : Z_INDEX_CONTENT,
					}}
				>
					{children}
				</UiBox>
			)}
		</UiBox>
	)
}
