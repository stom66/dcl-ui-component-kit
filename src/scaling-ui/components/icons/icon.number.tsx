import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { atlasCharsNumbers, atlasCharsSymbols, type TextureAtlas } from '../../atlases'
import { getTheme } from '../../styles'
import { UiBox } from '../base'
import { Icon } from './icon'

type IconNumberProps = Omit<Parameters<typeof Icon>[0], 'iconSrc' | 'textureMode' | 'uvs'> & {
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
	digitWidth     : PositionUnit
	digitHeight    : PositionUnit
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


// MARK: resolveIconNumberSize
/**
 * Resolves container and per-digit sizes so glyphs keep `digitAspect` (width / height).
 * Pass height only, width only, or neither — the missing axis is derived from glyph count.
 * When both are set, sizes fit inside the box without stretching glyphs.
 */
function resolveIconNumberSize(args: {
	width      : PositionUnit | "auto"
	height     : PositionUnit | "auto"
	len        : number
	size       : number
	digitAspect: number
}): ResolvedIconNumberSize {
	const { width, height, len, size, digitAspect } = args
	const count      = Math.max(len, 1)
	const widthAuto  = width  === "auto"
	const heightAuto = height === "auto"

	// Height-driven: digit height fixed, width from aspect × count
	if (!heightAuto && widthAuto) {
		const digitHeight = height
		const digitWidth  = scalePositionUnit(height, digitAspect)
		return {
			containerWidth : scalePositionUnit(digitWidth, count),
			containerHeight: height,
			digitWidth,
			digitHeight,
		}
	}

	// Width-driven: total width fixed, height from aspect
	if (!widthAuto && heightAuto) {
		const digitWidth  = scalePositionUnit(width, 1 / count)
		const digitHeight = scalePositionUnit(digitWidth, 1 / digitAspect)
		return {
			containerWidth : width,
			containerHeight: digitHeight,
			digitWidth,
			digitHeight,
		}
	}

	// Both set: fit inside the box, preserve aspect (no stretch when digit count changes)
	if (!widthAuto && !heightAuto) {
		const parsedW = parsePositionUnit(width)
		const parsedH = parsePositionUnit(height)

		if (parsedW && parsedH && parsedW.unit === parsedH.unit) {
			const widthFromHeight  = parsedH.amount * digitAspect * count
			const heightFromWidth  = parsedW.amount / (digitAspect * count)
			const heightDrivenFits = widthFromHeight <= parsedW.amount + 1e-6

			if (heightDrivenFits) {
				const digitHeight = height
				const digitWidth  = scalePositionUnit(height, digitAspect)
				return {
					containerWidth : width,
					containerHeight: height,
					digitWidth,
					digitHeight,
				}
			}

			const digitWidth  = formatPositionUnit(parsedW.amount / count, parsedW.unit)
			const digitHeight = formatPositionUnit(heightFromWidth, parsedH.unit)
			return {
				containerWidth : width,
				containerHeight: height,
				digitWidth,
				digitHeight,
			}
		}

		// Mixed / unparsable units: prefer height for glyph size
		const digitHeight = height
		const digitWidth  = scalePositionUnit(height, digitAspect)
		return {
			containerWidth : width,
			containerHeight: height,
			digitWidth,
			digitHeight,
		}
	}

	// Both auto: theme icon size
	const digitHeight = size
	const digitWidth  = size * digitAspect
	return {
		containerWidth : digitWidth * count,
		containerHeight: size,
		digitWidth,
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
 * Digit aspect follows `theme.icons.numbers.horizontalInset` so UV crop does not stretch glyphs.
 * Specify `height` or `width` alone — the other axis is computed from aspect × digit count.
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
	const digitAspect     = 1 - 2 * horizontalInset

	const glyphs = value.toString()
	const len    = glyphs.length

	const {
		containerWidth,
		containerHeight,
		digitWidth,
		digitHeight,
	} = resolveIconNumberSize({
		width,
		height,
		len,
		size,
		digitAspect,
	})

	const icons: ReactEcs.JSX.Element[] = []

	for (let i = 0; i < len; i++) {
		const glyph      = glyphs[i]
		const glyphAtlas = resolveGlyphAtlas(atlas, glyph)
		icons.push(
			<Icon
				{...props}
				key         = {i}
				width       = {digitWidth}
				height      = {digitHeight}
				uiTransform = {{
					...(typeof digitWidth === 'number' ? { minWidth: digitWidth } : {}),
					...(typeof digitHeight === 'number' ? { minHeight: digitHeight } : {}),
					...uiTransform,
				}}
				iconSrc     = {glyphAtlas.source}
				textureMode = {'stretch'}
				uvs         = {glyphAtlas.char(glyph, { insetX: horizontalInset })}
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
