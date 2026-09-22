import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, UiTransformProps } from '@dcl/sdk/react-ecs'

import { atlasSpritesProgressRadial, type TextureAtlas } from '../../atlases'
import { getTheme } from '../../styles'
import { clampNumber, mirrorUVs } from '../../utils'
import { mergeUiBackground, UiBox, type UiBoxProps } from '../base'
import { spriteFrameToUvCell } from '../icons'

import { resolveDefaultBorderRadius, Z_INDEX_BACKGROUND, Z_INDEX_BORDER, Z_INDEX_CONTENT, Z_INDEX_FILL } from './progressBar.shared'


/** Stable UV quads per sheet cell — new arrays every frame leak ReactEcs entities. */
const radialUvCache = new Map<string, number[]>()

const DEFAULT_SIZE = 64


export type ProgressBarRadialProps = Omit<
	UiBoxProps,
	'uiTransform' | 'backgroundColor' | 'borderColor' | 'borderWidth' | 'borderRadius'
> & {
	/** Progress in `[0, 1]`. `0` is the first sheet frame, `1` is the last. */
	progress         : number
	width?           : PositionUnit | 'auto'
	/** Defaults to `width` (square). */
	height?          : PositionUnit | 'auto'
	/** Tint multiply on the sprite texture. Defaults to theme primary. */
	fillColor?       : Color4
	/** Circular chip behind the sprite. Defaults to theme dark. */
	backgroundColor? : Color4
	/** Outer stroke on the circular chip. */
	borderColor?     : Color4
	borderWidth?     : number
	/**
	 * Corner radius. Defaults to half the shortest axis (circle when square).
	 * Pass explicitly to override.
	 */
	borderRadius?    : number
	/**
	 * Uniform pixel inset of the sprite relative to the chip / border.
	 * Positive shrinks the ring inside the stroke; **negative grows it past
	 * the border** so it can sit on top of the track (`zIndex` is above the
	 * stroke). Defaults to `0` (sprite matches `width` / `height`).
	 */
	inset?           : number
	/**
	 * Sprite sheet to sample. Defaults to the bundled 16×16 radial progress
	 * atlas (`atlasSpritesProgressRadial`, 256 frames).
	 */
	atlas?           : TextureAtlas
	/**
	 * When true, mirrors the sprite horizontally (left ↔ right) so the ring
	 * fills anti-clockwise. Defaults to `false` (clockwise, as authored).
	 */
	mirror?          : boolean
	uiTransform?     : UiTransformProps
}


// MARK: progressToRadialFrame
/**
 * Maps `progress` in `[0, 1]` to a 0-based frame index in `[0, frameCount)`.
 * `0` → first cell, `1` → last cell.
 */
export function progressToRadialFrame(
	progress  : number,
	frameCount: number,
): number {
	if (!Number.isFinite(progress)) {
		console.error('ProgressBarRadial: progressToRadialFrame: non-finite progress', progress)
		return 0
	}
	if (!Number.isFinite(frameCount) || frameCount < 1) {
		console.error('ProgressBarRadial: progressToRadialFrame: invalid frameCount', frameCount)
		return 0
	}

	const clamped = clampNumber(progress, 0, 1)
	const last    = Math.floor(frameCount) - 1
	if (last <= 0) return 0
	return Math.round(clamped * last)
}


// MARK: resolveRadialInset
/**
 * Uniform sprite inset in virtual px. Negative values are kept (sprite grows
 * past the chip). Non-finite input logs and falls back to `0`.
 */
export function resolveRadialInset(inset: number | undefined): number {
	if (inset === undefined) return 0
	if (!Number.isFinite(inset)) {
		console.error('ProgressBarRadial: resolveRadialInset: non-finite inset', inset)
		return 0
	}
	return inset
}


// MARK: getRadialFrameUvs
/** Cached UV quad for a linear sprite-sheet frame on `atlas`. */
function getRadialFrameUvs(
	atlas     : TextureAtlas,
	frameIndex: number,
	mirror    : boolean,
): number[] {
	const key = `${atlas.source}:${atlas.columns}x${atlas.rows}:${frameIndex}:${mirror ? 'm' : 'n'}`
	let uvs = radialUvCache.get(key)
	if (!uvs) {
		const cell = spriteFrameToUvCell(frameIndex, atlas.columns, atlas.rows)
		uvs = atlas.cell({
			xStart: cell.xStart,
			yStart: cell.yStart,
		})
		if (mirror) uvs = mirrorUVs(uvs)
		radialUvCache.set(key, uvs)
	}
	return uvs
}


// MARK: ProgressBarRadial
/**
 * Sprite-sheet radial progress. Samples one cell from a grid (default 16×16 /
 * 256 frames) from `progress` in `[0, 1]`. `fillColor` tints the ring;
 * `backgroundColor` fills a circular chip (`borderRadius` = half the shortest
 * axis). `height` defaults to `width`. Pass `mirror` to fill anti-clockwise.
 * `inset` (px, may be negative) sizes the sprite relative to the chip so a
 * negative value can overlap the border like a track.
 */
export function ProgressBarRadial({
	progress,
	width,
	height,
	fillColor,
	backgroundColor,
	borderColor,
	borderWidth,
	borderRadius,
	inset        = 0,
	atlas        = atlasSpritesProgressRadial,
	mirror       = false,
	uiTransform,
	uiBackground,
	children,
	...props
}: ProgressBarRadialProps) {
	const theme          = getTheme()
	const resolvedWidth  = width  ?? height ?? DEFAULT_SIZE
	const resolvedHeight = height ?? width  ?? DEFAULT_SIZE
	const fill           = fillColor       ?? theme.colors.primary
	const track          = backgroundColor ?? theme.colors.dark
	const bWidth         = borderWidth     ?? (borderColor !== undefined ? theme.border.width : 0)
	const bRadius        = borderRadius    ?? resolveDefaultBorderRadius(resolvedWidth, resolvedHeight)
	const spriteInset    = resolveRadialInset(inset)
	const spritePosition = {
		top   : spriteInset,
		right : spriteInset,
		bottom: spriteInset,
		left  : spriteInset,
	}

	const columns = atlas.columns
	const rows    = atlas.rows
	if (columns < 1 || rows < 1) {
		console.error('ProgressBarRadial: atlas columns and rows must be >= 1', {
			columns,
			rows,
			source: atlas.source,
		})
		return null
	}

	const frame = progressToRadialFrame(progress, columns * rows)
	const uvs   = getRadialFrameUvs(atlas, frame, mirror)
	const showBorder = borderColor !== undefined && bWidth > 0

	return (
		<UiBox
			{...props}
			overflow      = "visible"
			width         = {resolvedWidth}
			height        = {resolvedHeight}
			uiTransform   = {{
				display       : 'flex',
				alignItems    : 'center',
				justifyContent: 'center',
				flexGrow      : 0,
				flexShrink    : 0,
				...(resolvedHeight !== 'auto' ? { minHeight: resolvedHeight } : {}),
				...uiTransform,
			}}
		>
			<UiBox
				backgroundColor = {track}
				borderRadius    = {bRadius}
				uiTransform     = {{
					positionType: 'absolute',
					position    : { top: 0, right: 0, bottom: 0, left: 0 },
					zIndex      : Z_INDEX_BACKGROUND,
				}}
			/>
			{showBorder && (
				<UiBox
					borderColor  = {borderColor}
					borderWidth  = {bWidth}
					borderRadius = {bRadius}
					uiTransform  = {{
						positionType: 'absolute',
						position    : { top: 0, right: 0, bottom: 0, left: 0 },
						zIndex      : Z_INDEX_FILL,
					}}
				/>
			)}
			<UiBox
				uiTransform={{
					positionType: 'absolute',
					position    : spritePosition,
					zIndex      : Z_INDEX_BORDER,
				}}
				uiBackground={mergeUiBackground({
					texture    : atlas.texture,
					textureMode: 'stretch',
					uvs,
					color      : fill,
				}, uiBackground)}
			/>
			{children != null && (
				<UiBox
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
