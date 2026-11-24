/**
 * Color picker math — the single source of truth for the wheel.
 *
 * Pure functions with NO imports, on purpose: the same file is loaded by
 * `scripts/generate-color-picker-textures.mjs` (Node, type stripping) to paint
 * `colorPicker-wheel.png` / `colorPicker-value.png`, and by `ColorPicker` to turn a
 * click position back into a color. Because both directions go through
 * `sampleWheel`, the texture and the picked color always line up.
 *
 * Wheel space: `u`, `v` are 0–1 across the square wheel element / texture,
 * origin top-left (`v` grows downward, like UI layout). The circle fills the square.
 * Hue 0 (red) sits at the top and increases counter-clockwise; saturation is the
 * distance from the center (0 = white, 1 = rim). Matches the in-world wheel in
 * dcl-slay-the-steps (`hue = atan2(-x, y) / 2π`).
 */

export type Rgb = { r: number, g: number, b: number }
export type Hsv = { h: number, s: number, v: number }


// MARK: hsvToRgb
/** HSV (each 0–1) → RGB (each 0–1). */
export function hsvToRgb(
	h: number,
	s: number,
	v: number
): Rgb {
	const i = Math.floor(h * 6)
	const f = h * 6 - i
	const p = v * (1 - s)
	const q = v * (1 - f * s)
	const t = v * (1 - (1 - f) * s)

	switch (((i % 6) + 6) % 6) {
		case 0 : return { r: v, g: t, b: p }
		case 1 : return { r: q, g: v, b: p }
		case 2 : return { r: p, g: v, b: t }
		case 3 : return { r: p, g: q, b: v }
		case 4 : return { r: t, g: p, b: v }
		case 5 : return { r: v, g: p, b: q }
		default: return { r: 0, g: 0, b: 0 }
	}
}


// MARK: rgbToHsv
/** RGB (each 0–1) → HSV (each 0–1). Hue is 0 for greys. */
export function rgbToHsv(
	r: number,
	g: number,
	b: number
): Hsv {
	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	const d   = max - min

	let h = 0
	if (d > 0) {
		if (max === r)      h = ((g - b) / d) % 6
		else if (max === g) h = (b - r) / d + 2
		else                h = (r - g) / d + 4
		h /= 6
		if (h < 0) h += 1
	}

	return {
		h,
		s: max === 0 ? 0 : d / max,
		v: max,
	}
}


// MARK: clamp01
export function clamp01(n: number): number {
	return Math.min(1, Math.max(0, n))
}


// MARK: rgbToHex
/** RGB (each 0–1) → `#RRGGBB` (uppercase). */
export function rgbToHex(rgb: Rgb): string {
	const part = (n: number) => Math.round(clamp01(n) * 255).toString(16).padStart(2, '0')
	return `#${part(rgb.r)}${part(rgb.g)}${part(rgb.b)}`.toUpperCase()
}


// MARK: hexToRgb
/** `#RGB`, `#RRGGBB` or `#RRGGBBAA` (hash optional) → RGB (each 0–1). Null when invalid. */
export function hexToRgb(hex: string): Rgb | null {
	let clean = hex.trim().replace(/^#/, '')
	if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('')
	if (clean.length === 8) clean = clean.slice(0, 6)
	if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null

	return {
		r: parseInt(clean.slice(0, 2), 16) / 255,
		g: parseInt(clean.slice(2, 4), 16) / 255,
		b: parseInt(clean.slice(4, 6), 16) / 255,
	}
}


// MARK: wheelUvToHueSat
/**
 * Wheel position → hue / saturation. Points outside the circle clamp to the rim
 * (`s = 1`) and report `inside: false`; `distance` is the unclamped radius (0–√2).
 */
export function wheelUvToHueSat(
	u: number,
	v: number
): { h: number, s: number, distance: number, inside: boolean } {
	const x = u * 2 - 1
	const y = 1 - v * 2

	let h = Math.atan2(-x, y) / (2 * Math.PI)
	if (h < 0) h += 1

	const distance = Math.sqrt(x * x + y * y)

	return {
		h,
		s     : Math.min(distance, 1),
		distance,
		inside: distance <= 1,
	}
}


// MARK: hueSatToWheelUv
/** Inverse of `wheelUvToHueSat`: where a hue / saturation sits on the wheel. */
export function hueSatToWheelUv(
	h: number,
	s: number
): { u: number, v: number } {
	const angle = h * 2 * Math.PI
	const x     = -Math.sin(angle) * s
	const y     =  Math.cos(angle) * s

	return {
		u: (x + 1) / 2,
		v: (1 - y) / 2,
	}
}


// MARK: clampToWheel
/** Pulls a wheel position back onto the circle if it lies outside it. */
export function clampToWheel(
	u: number,
	v: number
): { u: number, v: number } {
	const x = u * 2 - 1
	const y = v * 2 - 1
	const d = Math.sqrt(x * x + y * y)
	if (d <= 1) return { u, v }

	return {
		u: (x / d + 1) / 2,
		v: (y / d + 1) / 2,
	}
}


// MARK: sampleWheel
/**
 * THE wheel function: color at a wheel position for a given brightness (`value`).
 * The texture generator calls it with `value = 1`; the component tints the
 * texture by `value` at runtime, which is the same thing (HSV value scales RGB).
 */
export function sampleWheel(
	u    : number,
	v    : number,
	value: number = 1
): Rgb {
	const { h, s } = wheelUvToHueSat(u, v)
	return hsvToRgb(h, s, value)
}


// MARK: sampleValueRamp
/**
 * Brightness strip: grey ramp, dark (0) on the left to white (1) on the right.
 * The component tints it with the full-brightness color, giving black → color.
 */
export function sampleValueRamp(t: number): Rgb {
	return hsvToRgb(0, 0, clamp01(t))
}
