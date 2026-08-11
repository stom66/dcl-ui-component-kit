import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, UiEntity } from '@dcl/sdk/react-ecs'

import { type TextureAtlas } from '../../atlases'
import { getTheme } from '../../styles'
import { formatPositionUnit, parsePositionUnit, scalePositionUnit, sumPositionUnits } from '../../utils/positionUnit'
import { UiBox, type UiBoxProps } from '../base'
import { resolveIconRotatedUvs } from './icon.uvs'

/** Relative width of a space glyph vs digit height (blank spacer, no texture). */
const SPACE_ASPECT = 0.4

export type IconAtlasTextProps = Omit<UiBoxProps, 'uiText'> & {
	value     : number | string
	/**
	 * Tint multiply for each glyph texture (`uiBackground.color` on digits).
	 * Only way to recolour glyphs — `backgroundColor` fills the container row.
	 */
	iconColor?  : Color4
	/**
	 * Degrees to rotate each glyph's UVs around its cell centre.
	 * Same static UV rotate as `Icon.rotate`.
	 */
	rotate?     : number
	/**
	 * Resolves each character to a texture glyph, blank space, or missing marker.
	 * Called once per character with the theme horizontal inset.
	 */
	resolveGlyph: (glyph: string, horizontalInset: number) => ResolvedAtlasGlyph
	/** Prefix for stable ReactEcs `key`s (e.g. `icon-num`). */
	keyPrefix?  : string
	width?      : PositionUnit | 'auto' | undefined
	height?     : PositionUnit | 'auto' | undefined
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}

export type ResolvedAtlasGlyph =
	| {
		kind  : 'char'
		glyph : string
		atlas : TextureAtlas
		insetX: number
		aspect: number
	}
	| {
		kind  : 'space'
		aspect: number
	}
	| {
		kind  : 'missing'
		aspect: number
	}

type ResolvedIconAtlasTextSize = {
	containerWidth : PositionUnit
	containerHeight: PositionUnit
	digitWidths    : PositionUnit[]
	digitHeight    : PositionUnit
}

type UiEntityBackground = NonNullable<Parameters<typeof UiEntity>[0]['uiBackground']>
type UiEntityTransform  = NonNullable<Parameters<typeof UiEntity>[0]['uiTransform']>

/** Stable prop objects — new literals every frame have been leaking ReactEcs entities. */
const digitBackgroundCache = new Map<string, UiEntityBackground>()
const digitTransformCache  = new Map<string, UiEntityTransform>()
const missingBackgroundCache = new Map<string, UiEntityBackground>()


// MARK: charGlyph
/**
 * Builds a resolved texture glyph using the atlas inset for `glyph`.
 *
 * @param atlas           - Sheet that contains `glyph`
 * @param glyph           - Single character to render
 * @param horizontalInset - Theme / call-site base inset
 */
export function charGlyph(
	atlas          : TextureAtlas,
	glyph          : string,
	horizontalInset: number,
): ResolvedAtlasGlyph {
	const insetX = atlas.charInsetX(glyph, horizontalInset)
	return {
		kind  : 'char',
		glyph,
		atlas,
		insetX,
		aspect: 1 - 2 * insetX,
	}
}


// MARK: spaceGlyph
/**
 * Blank spacer for whitespace — no texture, fixed relative width.
 *
 * @param _horizontalInset - Unused; kept for call-site symmetry with other resolvers
 */
export function spaceGlyph(_horizontalInset: number = 0): ResolvedAtlasGlyph {
	return {
		kind  : 'space',
		aspect: SPACE_ASPECT,
	}
}


// MARK: missingGlyph
/**
 * Placeholder for unsupported characters (same aspect as a typical inset glyph).
 *
 * @param horizontalInset - Theme inset used to size the warning box
 */
export function missingGlyph(horizontalInset: number): ResolvedAtlasGlyph {
	return {
		kind  : 'missing',
		aspect: 1 - 2 * horizontalInset,
	}
}


// MARK: colorCacheKey
/** Stable cache segment for an optional Color4 tint. */
function colorCacheKey(color: Color4 | undefined): string {
	if (!color) {
		return ''
	}
	return `${color.r}|${color.g}|${color.b}|${color.a}`
}


// MARK: getDigitBackground
/** Cached stretch background for one atlas glyph (shared across icon-text instances). */
function getDigitBackground(
	atlas  : TextureAtlas,
	uvs    : number[],
	glyph  : string,
	insetX : number,
	color? : Color4,
	rotate?: number,
) {
	const resolvedUvs = resolveIconRotatedUvs(uvs, rotate) ?? uvs
	const key = `${atlas.source}|${atlas.wrapMode}|${atlas.filterMode ?? ''}|${glyph}|${insetX}|${colorCacheKey(color)}|${rotate ?? 0}`
	let bg = digitBackgroundCache.get(key)
	if (!bg) {
		bg = {
			texture    : atlas.texture,
			textureMode: 'stretch',
			uvs        : resolvedUvs,
			...(color ? { color } : {}),
		}
		digitBackgroundCache.set(key, bg)
	}
	return bg
}


// MARK: getMissingBackground
/** Cached solid fill for unsupported glyphs (theme warning colour). */
function getMissingBackground(color: Color4): UiEntityBackground {
	const key = `missing|${color.r}|${color.g}|${color.b}|${color.a}`
	let bg = missingBackgroundCache.get(key)
	if (!bg) {
		bg = { color }
		missingBackgroundCache.set(key, bg)
	}
	return bg
}


// MARK: getDigitTransform
/** Cached per-digit size transform (shared when width/height match). */
function getDigitTransform(
	digitWidth : PositionUnit,
	digitHeight: PositionUnit,
): UiEntityTransform {
	const key = `${digitWidth}|${digitHeight}`
	let transform = digitTransformCache.get(key)
	if (!transform) {
		transform = {
			width     : digitWidth,
			height    : digitHeight,
			flexGrow  : 0,
			flexShrink: 0,
			...(typeof digitWidth === 'number' ? { minWidth: digitWidth } : {}),
			...(typeof digitHeight === 'number' ? { minHeight: digitHeight } : {}),
		}
		digitTransformCache.set(key, transform)
	}
	return transform
}


// MARK: widthsFromHeight
/** Per-glyph widths from a shared height and each glyph's width/height aspect. */
function widthsFromHeight(
	digitHeight : PositionUnit,
	glyphAspects: number[],
): PositionUnit[] {
	return glyphAspects.map((aspect) => scalePositionUnit(digitHeight, aspect))
}


// MARK: resolveIconAtlasTextSize
/**
 * Resolves container and per-digit sizes so each glyph keeps its own aspect.
 * Pass height only, width only, or neither — the missing axis is derived from
 * the sum of glyph aspects. When both are set, sizes fit inside the box without
 * stretching glyphs.
 */
function resolveIconAtlasTextSize(args: {
	width       : PositionUnit | 'auto'
	height      : PositionUnit | 'auto'
	glyphAspects: number[]
	size        : number
}): ResolvedIconAtlasTextSize {
	const { width, height, size } = args
	const glyphAspects = args.glyphAspects.length > 0 ? args.glyphAspects : [1]
	const aspectSum    = glyphAspects.reduce((sum, aspect) => sum + aspect, 0)
	const widthAuto    = width  === 'auto'
	const heightAuto   = height === 'auto'

	// Height-driven: digit height fixed, each width from its aspect
	if (!heightAuto && widthAuto) {
		const digitHeight = height
		const digitWidths = widthsFromHeight(digitHeight, glyphAspects)
		return {
			containerWidth : sumPositionUnits(digitWidths),
			containerHeight: height,
			digitWidths,
			digitHeight,
		}
	}

	// Width-driven: total width fixed, height from sum of aspects
	if (!widthAuto && heightAuto) {
		const digitHeight = scalePositionUnit(width, 1 / aspectSum)
		const digitWidths = widthsFromHeight(digitHeight, glyphAspects)
		return {
			containerWidth : width,
			containerHeight: digitHeight,
			digitWidths,
			digitHeight,
		}
	}

	// Both set: fit inside the box, preserve per-glyph aspect
	if (!widthAuto && !heightAuto) {
		const parsedW = parsePositionUnit(width)
		const parsedH = parsePositionUnit(height)

		if (parsedW && parsedH && parsedW.unit === parsedH.unit) {
			const widthFromHeight  = parsedH.amount * aspectSum
			const heightFromWidth  = parsedW.amount / aspectSum
			const heightDrivenFits = widthFromHeight <= parsedW.amount + 1e-6

			if (heightDrivenFits) {
				const digitHeight = height
				const digitWidths = widthsFromHeight(digitHeight, glyphAspects)
				return {
					containerWidth : width,
					containerHeight: height,
					digitWidths,
					digitHeight,
				}
			}

			const digitHeight = formatPositionUnit(heightFromWidth, parsedH.unit)
			const digitWidths = widthsFromHeight(digitHeight, glyphAspects)
			return {
				containerWidth : width,
				containerHeight: height,
				digitWidths,
				digitHeight,
			}
		}

		// Mixed / unparsable units: prefer height for glyph size
		const digitHeight = height
		const digitWidths = widthsFromHeight(digitHeight, glyphAspects)
		return {
			containerWidth : width,
			containerHeight: height,
			digitWidths,
			digitHeight,
		}
	}

	// Both auto: theme icon size
	const digitHeight = size
	const digitWidths = glyphAspects.map((aspect) => size * aspect)
	return {
		containerWidth : sumPositionUnits(digitWidths),
		containerHeight: size,
		digitWidths,
		digitHeight,
	}
}


// MARK: IconAtlasText
/**
 * Shared row renderer for atlas-backed glyph strings (`IconNumber` / `IconSymbol` /
 * `IconCharacter` / `IconString`). Digits are raw `UiEntity`s with string keys —
 * wrapping through `Icon` / `UiBox` + numeric keys recreates entities every frame.
 * Tint glyphs with `iconColor` (texture × color multiply), same as `Icon`.
 */
export const IconAtlasText = ({
	children,
	value        = '',
	iconColor,
	rotate,
	resolveGlyph,
	keyPrefix    = 'icon-atlas',
	width        = 'auto',
	height       = 'auto',
	uiTransform,
	...props
}: IconAtlasTextProps) => {
	const theme           = getTheme()
	const size            = theme.icons.minSize
	const horizontalInset = theme.icons.numbers.horizontalInset
	const warningColor    = theme.colors.warning

	const glyphs = value.toString()
	const len    = glyphs.length

	const resolved: ResolvedAtlasGlyph[] = []
	const glyphAspects: number[]         = []

	for (let i = 0; i < len; i++) {
		const glyph = glyphs[i]
		const item  = glyph === ' '
			? spaceGlyph(horizontalInset)
			: resolveGlyph(glyph, horizontalInset)
		resolved.push(item)
		glyphAspects.push(item.aspect)
	}

	const {
		containerWidth,
		containerHeight,
		digitWidths,
		digitHeight,
	} = resolveIconAtlasTextSize({
		width,
		height,
		glyphAspects,
		size,
	})

	const icons: ReactEcs.JSX.Element[] = []

	for (let i = 0; i < len; i++) {
		const item      = resolved[i]
		const transform = getDigitTransform(digitWidths[i] ?? digitHeight, digitHeight)

		if (item.kind === 'space') {
			icons.push(
				<UiEntity
					key={`${keyPrefix}-${i}-space`}
					uiTransform={transform}
				/>
			)
			continue
		}

		if (item.kind === 'missing') {
			icons.push(
				<UiEntity
					key={`${keyPrefix}-${i}-missing`}
					uiTransform={transform}
					uiBackground={getMissingBackground(warningColor)}
				/>
			)
			continue
		}

		const uvs = item.atlas.char(item.glyph, { insetX: horizontalInset })
		icons.push(
			<UiEntity
				key={`${keyPrefix}-${i}`}
				uiTransform={transform}
				uiBackground={getDigitBackground(item.atlas, uvs, item.glyph, item.insetX, iconColor, rotate)}
			/>
		)
	}

	return (
		<UiBox
			{...props}
			uiTransform = {{
				width         : containerWidth,
				height        : containerHeight,
				display       : 'flex',
				flexDirection : 'row',
				alignItems    : 'center',
				justifyContent: 'center',
				flexGrow      : 0,
				flexShrink    : 0,
				...uiTransform,
			}}
		>
			{icons}
			{children}
		</UiBox>
	)
}
