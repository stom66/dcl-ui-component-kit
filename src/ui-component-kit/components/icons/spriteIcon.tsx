import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, TextureMode } from '@dcl/sdk/react-ecs'

import type { TextureAtlas } from '../../atlases'
import { getTheme } from '../../styles'
import { getUVCell } from '../../utils'
import { syncAnimationPlayback } from '../animations/animationPlayback'
import { mergeUiBackground, type UiBoxProps } from '../base'
import { Icon } from './icon'


/** Stable UV quads per sheet cell — new arrays every frame leak ReactEcs entities. */
const spriteUvCache = new Map<string, number[]>()


export type SpriteIconProps = UiBoxProps & {
	/** Unique playback instance key (shared animation clock). */
	id           : string
	children?    : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/**
	 * Optional atlas — supplies `src`, `columns`, and `rows` when those props
	 * are omitted. Prefer this over repeating path / grid size at every call site.
	 */
	atlas?       : TextureAtlas
	/** Texture path. Required when `atlas` is omitted. */
	src?         : string
	/** Column count in the sprite sheet grid. Required when `atlas` is omitted. */
	columns?     : number
	/** Row count in the sprite sheet grid. Required when `atlas` is omitted. */
	rows?        : number
	/**
	 * Frames per second. Defaults to `columns * rows` (one full sheet per second).
	 * Frame advances are driven by the shared animation playback system.
	 */
	fps?         : number
	/**
	 * How many cells to play from the sheet, starting at `offset`.
	 * Defaults to the remaining cells after `offset` (`columns * rows - offset`).
	 * Use with `offset` to play a subsection (e.g. frames 3–7 → `offset={2}` `limit={5}`).
	 */
	limit?       : number
	/**
	 * 0-based linear frame index to skip from the start of the sheet before
	 * playback. Sheet order is left → right, top → bottom in the PNG.
	 * Defaults to `0`.
	 */
	offset?      : number
	/**
	 * When true, after the last frame of the window the animation reverses
	 * back to the first (ping-pong) instead of wrapping / stopping at the end.
	 */
	pingPong?    : boolean
	/**
	 * Seconds to rest between loops while `looping` is true. Holds the last
	 * frame of the window during the pause. Defaults to `0` (seamless loop).
	 * Ignored when `looping` is false.
	 */
	loopInterval?: number
	/**
	 * When true, advances local time. Defaults to `true`.
	 * Pair with `setPlaying(id, true|false)` / `playOnce(id)` for hover / click triggers
	 * (keep the prop stable — e.g. `playing={false}` — so helpers are not overwritten each frame).
	 */
	playing?     : boolean
	/**
	 * When true, repeats (with optional `loopInterval`). When false, one-shot
	 * then holds the end frame. Defaults to `true`. Use `playOnce(id)` to re-trigger.
	 */
	looping?     : boolean
	/**
	 * Tint multiply for the sprite texture (applied as `uiBackground.color`).
	 * Only way to recolour the sprite — `backgroundColor` is a chip fill via `Icon`.
	 */
	iconColor?   : Color4
	textureMode? : TextureMode | undefined
	width?       : PositionUnit | 'auto' | undefined
	height?      : PositionUnit | 'auto' | undefined
}


// MARK: spriteCycleFrameCount
/** Frame steps in one play-through (ping-pong counts the return trip). */
export function spriteCycleFrameCount(
	limit   : number,
	pingPong: boolean,
): number {
	if (limit <= 1) return 1
	return pingPong ? (limit - 1) * 2 : limit
}


// MARK: resolveSpriteLocalFrame
/**
 * Maps elapsed time + fps onto a local frame index within `[0, limit)`.
 * Ping-pong walks forward then back without repeating endpoints.
 * When looping, `loopInterval` (seconds) inserts a rest that holds the last
 * frame of the window (`limit - 1`). Non-looping clamps to the final frame.
 */
export function resolveSpriteLocalFrame(
	elapsed     : number,
	fps         : number,
	limit       : number,
	pingPong    : boolean,
	looping     : boolean,
	loopInterval: number = 0,
): number {
	if (limit <= 1 || fps <= 0 || elapsed < 0) return 0

	const cycleLen      = spriteCycleFrameCount(limit, pingPong)
	const cycleDuration = cycleLen / fps
	const interval      = Math.max(0, loopInterval)
	const lastFrame     = limit - 1

	let activeElapsed = elapsed

	if (looping && interval > 0) {
		const period = cycleDuration + interval
		const t      = elapsed % period
		if (t >= cycleDuration) return lastFrame
		activeElapsed = t
	}

	const frameFloat = activeElapsed * fps

	if (!pingPong) {
		if (looping) {
			return Math.floor(frameFloat) % limit
		}
		return Math.min(limit - 1, Math.floor(frameFloat))
	}

	if (!looping) {
		const clamped = Math.min(frameFloat, cycleLen)
		const t       = Math.floor(clamped)
		return t <= limit - 1 ? t : cycleLen - t
	}

	const t = Math.floor(frameFloat) % cycleLen
	return t <= limit - 1 ? t : cycleLen - t
}


// MARK: spriteFrameToUvCell
/**
 * Converts a 0-based linear frame index (PNG left → right, top → bottom) into
 * 1-based UV cell coordinates (`getUVCell` / atlas convention).
 */
export function spriteFrameToUvCell(
	frameIndex: number,
	columns   : number,
	rows      : number,
): { xStart: number, yStart: number } {
	const total = columns * rows
	const safe  = ((frameIndex % total) + total) % total
	const col0  = safe % columns
	const row0  = Math.floor(safe / columns) // 0 = PNG top
	return {
		xStart: col0 + 1,
		yStart: rows - row0,
	}
}


// MARK: getSpriteFrameUvs
/** Cached UV quad for a linear sprite-sheet frame. */
function getSpriteFrameUvs(
	frameIndex: number,
	columns   : number,
	rows      : number,
): number[] {
	const key = `${columns}x${rows}:${frameIndex}`
	let uvs = spriteUvCache.get(key)
	if (!uvs) {
		const cell = spriteFrameToUvCell(frameIndex, columns, rows)
		uvs = getUVCell({
			xStart: cell.xStart,
			yStart: cell.yStart,
			xTotal: columns,
			yTotal: rows,
		})
		spriteUvCache.set(key, uvs)
	}
	return uvs
}


// MARK: SpriteIcon
/**
 * Animated sprite-sheet icon. Plays cells left → right, top → bottom at `fps`,
 * with optional `offset` / `limit` window, `pingPong` reversal, and
 * `loopInterval` pause between loops.
 *
 * Requires a unique `id` (shared animation playback system). Pass `atlas` or
 * explicit `src` + `columns` + `rows`. Control playback with `playing` /
 * `looping`, or externally via `setPlaying` / `playOnce` (e.g. on hover).
 *
 * @example
 * <SpriteIcon
 *   id           = "coin-spin"
 *   atlas        = {exampleSpriteSheetAtlas}
 *   fps          = {12}
 *   loopInterval = {0.5}
 *   width        = {64}
 *   height       = {64}
 * />
 *
 * // Hover to loop — keep playing={false} stable; toggle with setPlaying
 * <SpriteIcon
 *   id           = "coin-hover"
 *   atlas        = {exampleSpriteSheetAtlas}
 *   playing      = {false}
 *   onMouseEnter = {() => setPlaying('coin-hover', true)}
 *   onMouseLeave = {() => setPlaying('coin-hover', false)}
 *   width        = {64}
 *   height       = {64}
 * />
 */
export function SpriteIcon({
	id,
	children,
	atlas,
	src,
	columns,
	rows,
	fps,
	limit,
	offset       = 0,
	pingPong     = false,
	loopInterval = getTheme().animation.spriteIconLoopIntervalDefault,
	playing      = true,
	looping      = true,
	iconColor,
	textureMode,
	width        = 'auto',
	height       = 'auto',
	uiBackground,
	uiTransform,
	...props
}: SpriteIconProps) {
	const resolvedColumns = columns ?? atlas?.columns
	const resolvedRows    = rows    ?? atlas?.rows
	const resolvedSrc     = src     ?? atlas?.source

	if (
		resolvedColumns === undefined
		|| resolvedRows === undefined
		|| !resolvedSrc
		|| resolvedColumns < 1
		|| resolvedRows < 1
	) {
		console.error(
			'SpriteIcon: columns, rows, and src (or atlas) are required',
			{ id, columns: resolvedColumns, rows: resolvedRows, src: resolvedSrc },
		)
		return null
	}

	const totalCells     = resolvedColumns * resolvedRows
	const resolvedOffset = Math.max(0, Math.min(Math.floor(offset), totalCells - 1))
	const maxLimit       = totalCells - resolvedOffset
	const resolvedLimit  = Math.max(
		1,
		Math.min(Math.floor(limit ?? maxLimit), maxLimit),
	)
	const resolvedFps      = Math.max(0, fps ?? totalCells)
	const resolvedInterval = Math.max(0, loopInterval)

	const state = syncAnimationPlayback(id, { playing, looping })
	const localFrame = resolveSpriteLocalFrame(
		state.elapsed,
		resolvedFps,
		resolvedLimit,
		pingPong,
		state.looping,
		resolvedInterval,
	)

	// One-shot: stop the clock once the cycle completes (hold end frame).
	if (!state.looping && state.playing && resolvedFps > 0) {
		const cycleLen = spriteCycleFrameCount(resolvedLimit, pingPong)
		if (state.elapsed * resolvedFps >= cycleLen) {
			state.playing = false
		}
	}

	const uvs = getSpriteFrameUvs(
		resolvedOffset + localFrame,
		resolvedColumns,
		resolvedRows,
	)

	const texture = atlas && resolvedSrc === atlas.source
		? atlas.texture
		: { src: resolvedSrc, wrapMode: 'clamp' as const }

	return (
		<Icon
			{...props}
			iconColor    = {iconColor}
			src          = {resolvedSrc}
			textureMode  = {textureMode}
			uvs          = {uvs}
			width        = {width}
			height       = {height}
			uiTransform  = {uiTransform}
			uiBackground = {mergeUiBackground({ texture }, uiBackground)}
		>
			{children}
		</Icon>
	)
}
