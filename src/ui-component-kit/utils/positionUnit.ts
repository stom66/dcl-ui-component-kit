import type { PositionUnit } from '@dcl/sdk/react-ecs'


export type ParsedPositionUnit = {
	amount: number
	unit  : string
}

export type SizeValue = PositionUnit | 'auto'


// MARK: parsePositionUnit
/** Splits a PositionUnit into a numeric amount and unit suffix (`""` for bare numbers). */
export function parsePositionUnit(value: PositionUnit): ParsedPositionUnit | null {
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
export function formatPositionUnit(
	amount: number,
	unit  : string,
): PositionUnit {
	if (unit === '') {
		return amount
	}
	return `${amount}${unit}` as PositionUnit
}


// MARK: scalePositionUnit
/**
 * Multiplies a size by `factor`, preserving unit suffix when present.
 * `auto` cannot scale — returns `auto` and logs.
 */
export function scalePositionUnit(value: PositionUnit, factor: number): PositionUnit
export function scalePositionUnit(value: 'auto', factor: number): 'auto'
export function scalePositionUnit(value: SizeValue, factor: number): SizeValue
export function scalePositionUnit(
	value : SizeValue,
	factor: number,
): SizeValue {
	if (value === 'auto') {
		console.error('positionUnit: scalePositionUnit: cannot scale auto')
		return 'auto'
	}

	const parsed = parsePositionUnit(value)
	if (!parsed) {
		console.error('positionUnit: scalePositionUnit: unsupported PositionUnit', value)
		return value
	}
	return formatPositionUnit(parsed.amount * factor, parsed.unit)
}


// MARK: sumPositionUnits
/** Adds PositionUnits that share a unit suffix; errors and returns the first value on mismatch. */
export function sumPositionUnits(values: PositionUnit[]): PositionUnit {
	if (values.length === 0) {
		return 0
	}
	let total   = 0
	let unit    = ''
	let hasUnit = false
	for (const value of values) {
		const parsed = parsePositionUnit(value)
		if (!parsed) {
			console.error('positionUnit: sumPositionUnits: unsupported PositionUnit', value)
			return values[0]
		}
		if (!hasUnit) {
			unit    = parsed.unit
			hasUnit = true
		} else if (parsed.unit !== unit) {
			console.error('positionUnit: sumPositionUnits: mixed units', values)
			return values[0]
		}
		total += parsed.amount
	}
	return formatPositionUnit(total, unit)
}
