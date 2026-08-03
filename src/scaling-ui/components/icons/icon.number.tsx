import ReactEcs, { PositionUnit, UiEntity } from '@dcl/sdk/react-ecs'

import { atlasCharsNumbers, atlasCharsSymbols, type TextureAtlas } from '../../atlases'
import { getTheme } from '../../styles'
import { UiBox, type UiBoxProps } from '../base'

type IconNumberProps = Omit<UiBoxProps, 'uiText'> & {
	value    : number | "/" | "+" | "-" | "×" | "*" | "x" | "=" | ":" | string
	/**
	 * Glyph atlas with a `layout`. Defaults to `atlasCharsNumbers`.
	 * Pass a custom `TextureAtlas` to use your own number sheet.
	 */
	atlas?   : TextureAtlas
	width?   : PositionUnit | "auto" | undefined
	height?  : PositionUnit | "auto" | undefined
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}

type ParsedPositionUnit = {
	amount: number
	unit  : string
}

type ResolvedIconNumberSize = {
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


// MARK: getDigitBackground
/** Cached stretch background for one atlas glyph (shared across IconNumber instances). */
function getDigitBackground(
	atlas : TextureAtlas,
	uvs   : number[],
	glyph : string,
	insetX: number,
) {
	const key = `${atlas.source}|${atlas.wrapMode}|${atlas.filterMode ?? ''}|${glyph}|${insetX}`
	let bg = digitBackgroundCache.get(key)
	if (!bg) {
		bg = {
			texture    : atlas.texture,
			textureMode: 'stretch',
			uvs,
		}
		digitBackgroundCache.set(key, bg)
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


// MARK: parsePositionUnit
/** Splits a PositionUnit into a numeric amount and unit suffix (`""` for bare numbers). */
function parsePositionUnit(value: PositionUnit): ParsedPositionUnit | null {
	if (typeof value === 'number') {
		return { amount: value, unit: '' }
	}

	const match = String(value).match(/^(-?[\d.]+)(.*)$/)
	if (!match) {
		return null
	}

	return {
		amount: parseFloat(match[1]),
		unit  : match[2],
	}
}


// MARK: formatPositionUnit
/** Rebuilds a PositionUnit from an amount and unit suffix. */
function formatPositionUnit(
	amount: number,
	unit  : string,
): PositionUnit {
	if (unit === '') {
		return amount
	}
	return `${amount}${unit}` as PositionUnit
}


// MARK: scalePositionUnit
/** Multiplies a PositionUnit by `factor`, preserving unit suffix when present. */
function scalePositionUnit(
	value : PositionUnit,
	factor: number,
): PositionUnit {
	const parsed = parsePositionUnit(value)
	if (!parsed) {
		console.error('IconNumber: scalePositionUnit: unsupported PositionUnit', value)
		return value
	}
	return formatPositionUnit(parsed.amount * factor, parsed.unit)
}


// MARK: sumPositionUnits
/** Adds PositionUnits that share a unit suffix; errors and returns the first value on mismatch. */
function sumPositionUnits(values: PositionUnit[]): PositionUnit {
	if (values.length === 0) {
		return 0
	}
	let total  = 0
	let unit   = ''
	let hasUnit = false
	for (const value of values) {
		const parsed = parsePositionUnit(value)
		if (!parsed) {
			console.error('IconNumber: sumPositionUnits: unsupported PositionUnit', value)
			return values[0]
		}
		if (!hasUnit) {
			unit    = parsed.unit
			hasUnit = true
		} else if (parsed.unit !== unit) {
			console.error('IconNumber: sumPositionUnits: mixed units', values)
			return values[0]
		}
		total += parsed.amount
	}
	return formatPositionUnit(total, unit)
}


// MARK: widthsFromHeight
/** Per-glyph widths from a shared height and each glyph's width/height aspect. */
function widthsFromHeight(
	digitHeight : PositionUnit,
	glyphAspects: number[],
): PositionUnit[] {
	return glyphAspects.map((aspect) => scalePositionUnit(digitHeight, aspect))
}


// MARK: resolveIconNumberSize
/**
 * Resolves container and per-digit sizes so each glyph keeps its own aspect
 * (`1 - 2 * insetX`). Pass height only, width only, or neither — the missing
 * axis is derived from the sum of glyph aspects. When both are set, sizes fit
 * inside the box without stretching glyphs.
 */
function resolveIconNumberSize(args: {
	width       : PositionUnit | "auto"
	height      : PositionUnit | "auto"
	glyphAspects: number[]
	size        : number
}): ResolvedIconNumberSize {
	const { width, height, size } = args
	const glyphAspects = args.glyphAspects.length > 0 ? args.glyphAspects : [1]
	const aspectSum    = glyphAspects.reduce((sum, aspect) => sum + aspect, 0)
	const widthAuto    = width  === "auto"
	const heightAuto   = height === "auto"

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


// MARK: resolveGlyphAtlas
/**
 * Picks the atlas sheet for one glyph. Default `atlasCharsNumbers` falls back to
 * `atlasCharsSymbols` for punctuation (e.g. `=` `$` `%`) so formulas work.
 */
function resolveGlyphAtlas(
	atlas: TextureAtlas,
	glyph: string,
): TextureAtlas {
	if (atlas.hasChar(glyph)) {
		return atlas
	}
	if (atlas === atlasCharsNumbers && atlasCharsSymbols.hasChar(glyph)) {
		return atlasCharsSymbols
	}
	return atlas
}


// MARK: IconNumber
/**
 * Renders a numeric string from a glyph atlas (`atlasCharsNumbers` by default).
 * Digit aspect follows each glyph's effective `insetX` (theme `horizontalInset`,
 * overridden by atlas `charInsets`) so UV crop does not stretch glyphs.
 * Specify `height` or `width` alone — the other axis is computed from the sum of glyph aspects.
 * Override the sheet with `atlas` (must include a `layout` for `char()`).
 * When using the default numbers atlas, missing glyphs (e.g. `=`) resolve from `atlasCharsSymbols`.
 */
export const IconNumber = ({
	children,
	value   = 0,
	atlas   = atlasCharsNumbers,
	width   = "auto",
	height  = "auto",
	uiTransform,
	...props
}: IconNumberProps) => {
	const theme           = getTheme()
	const size            = theme.icons.minSize
	const horizontalInset = theme.icons.numbers.horizontalInset

	const glyphs = value.toString()
	const len    = glyphs.length

	const glyphAtlases: TextureAtlas[] = []
	const glyphInsets : number[]       = []
	const glyphAspects: number[]       = []

	for (let i = 0; i < len; i++) {
		const glyph      = glyphs[i]
		const glyphAtlas = resolveGlyphAtlas(atlas, glyph)
		const insetX     = glyphAtlas.charInsetX(glyph, horizontalInset)
		glyphAtlases.push(glyphAtlas)
		glyphInsets.push(insetX)
		glyphAspects.push(1 - 2 * insetX)
	}

	const {
		containerWidth,
		containerHeight,
		digitWidths,
		digitHeight,
	} = resolveIconNumberSize({
		width,
		height,
		glyphAspects,
		size,
	})

	// Digits are raw `UiEntity`s with string keys. Wrapping through `Icon` /
	// `UiBox` + `key={i}` was recreating entities every frame in ReactEcs
	// (~1 entry per digit per frame — the top timer alone ≈ 2 × FPS).
	const icons: ReactEcs.JSX.Element[] = []

	for (let i = 0; i < len; i++) {
		const glyph      = glyphs[i]
		const glyphAtlas = glyphAtlases[i]
		const insetX     = glyphInsets[i]
		const uvs        = glyphAtlas.char(glyph, { insetX: horizontalInset })
		icons.push(
			<UiEntity
				key={`icon-num-${i}`}
				uiTransform={getDigitTransform(digitWidths[i] ?? digitHeight, digitHeight)}
				uiBackground={getDigitBackground(glyphAtlas, uvs, glyph, insetX)}
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
