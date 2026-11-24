#!/usr/bin/env node
/**
 * Paints the ColorPicker textures from the SAME math the component uses to read
 * clicks back (`colorPicker.math.ts`), so the wheel image and the picked color
 * can never drift apart.
 *
 *   npm run generate-color-picker-textures
 *
 * Needs Node 22.18+ (TypeScript type stripping on by default) — or run with
 * `node --experimental-strip-types` on 22.6–22.17.
 *
 * Writes:
 *   assets/images/ui-component-kit/colorPicker-wheel.png  (512×512, transparent outside the circle)
 *   assets/images/ui-component-kit/colorPicker-value.png  (256×16 grey ramp, dark → white)
 */

import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

import { sampleValueRamp, sampleWheel, wheelUvToHueSat } from '../src/ui-component-kit/components/colorPicker/colorPicker.math.ts'

const ROOT       = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR    = join(ROOT, 'assets', 'images', 'ui-component-kit')
const WHEEL_SIZE = 512
const RAMP_W     = 256
const RAMP_H     = 16


// MARK: encodePng
/** Minimal RGBA8 PNG encoder (no dependencies). */
function encodePng(width, height, rgba) {
	const chunk = (type, data) => {
		const len  = Buffer.alloc(4)
		len.writeUInt32BE(data.length)
		const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
		const crc  = Buffer.alloc(4)
		crc.writeUInt32BE(zlib.crc32(body) >>> 0)
		return Buffer.concat([len, body, crc])
	}

	const ihdr = Buffer.alloc(13)
	ihdr.writeUInt32BE(width, 0)
	ihdr.writeUInt32BE(height, 4)
	ihdr[8]  = 8 // bit depth
	ihdr[9]  = 6 // RGBA
	ihdr[10] = 0
	ihdr[11] = 0
	ihdr[12] = 0

	const stride = width * 4
	const raw    = Buffer.alloc((stride + 1) * height)
	for (let y = 0; y < height; y++) {
		raw[y * (stride + 1)] = 0 // filter: none
		rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
	}

	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk('IHDR', ihdr),
		chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
		chunk('IEND', Buffer.alloc(0)),
	])
}

const to8 = (n) => Math.round(Math.min(1, Math.max(0, n)) * 255)


// MARK: wheel
const wheel  = Buffer.alloc(WHEEL_SIZE * WHEEL_SIZE * 4)
const radius = WHEEL_SIZE / 2
for (let py = 0; py < WHEEL_SIZE; py++) {
	for (let px = 0; px < WHEEL_SIZE; px++) {
		// Sample at the pixel center, in the same 0–1 wheel space the component uses.
		const u   = (px + 0.5) / WHEEL_SIZE
		const v   = (py + 0.5) / WHEEL_SIZE
		const rgb = sampleWheel(u, v, 1)

		// Anti-aliased rim: ~1px soft edge.
		const { distance } = wheelUvToHueSat(u, v)
		const alpha        = Math.min(1, Math.max(0, (1 - distance) * radius + 0.5))

		const i = (py * WHEEL_SIZE + px) * 4
		wheel[i]     = to8(rgb.r)
		wheel[i + 1] = to8(rgb.g)
		wheel[i + 2] = to8(rgb.b)
		wheel[i + 3] = to8(alpha)
	}
}
writeFileSync(join(OUT_DIR, 'colorPicker-wheel.png'), encodePng(WHEEL_SIZE, WHEEL_SIZE, wheel))


// MARK: value ramp
const ramp = Buffer.alloc(RAMP_W * RAMP_H * 4)
for (let py = 0; py < RAMP_H; py++) {
	for (let px = 0; px < RAMP_W; px++) {
		const rgb = sampleValueRamp(px / (RAMP_W - 1))
		const i   = (py * RAMP_W + px) * 4
		ramp[i]     = to8(rgb.r)
		ramp[i + 1] = to8(rgb.g)
		ramp[i + 2] = to8(rgb.b)
		ramp[i + 3] = 255
	}
}
writeFileSync(join(OUT_DIR, 'colorPicker-value.png'), encodePng(RAMP_W, RAMP_H, ramp))

console.log(`generate-color-picker-textures: wrote colorPicker-wheel.png (${WHEEL_SIZE}²) and colorPicker-value.png (${RAMP_W}×${RAMP_H}) to ${OUT_DIR}`)
