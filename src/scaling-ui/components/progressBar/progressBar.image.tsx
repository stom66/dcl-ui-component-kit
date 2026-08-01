import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, UiTransformProps } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'

import { UiBox, type UiBoxProps } from '../base'

import { type FillFrom, resolveFillFrom, syncDisplayValue, valueToPercent, Z_INDEX_BACKGROUND, Z_INDEX_BORDER, Z_INDEX_FILL } from './progressBar.shared'


export type TextureSlices = {
	top   : number
	bottom: number
	left  : number
	right : number
}

/** Per-layer texture paths for a progress bar orientation. */
export type ProgressBarImageTextures = {
	background: string
	fill      : string
	border    : string
}

export type ProgressBarOrientation = 'horizontal' | 'vertical'

const DEFAULT_TEXTURE_SLICES: TextureSlices = {
	top   : 0.25,
	bottom: 0.25,
	left  : 0.0625,
	right : 0.0625,
}

const TEXTURES_HORIZONTAL: ProgressBarImageTextures = {
	background: 'assets/images/scaling-ui/progressBar-horizontal-background.png',
	fill      : 'assets/images/scaling-ui/progressBar-horizontal-fill.png',
	border    : 'assets/images/scaling-ui/progressBar-horizontal-border.png',
}

const TEXTURES_VERTICAL: ProgressBarImageTextures = {
	background: 'assets/images/scaling-ui/progressBar-vertical-background.png',
	fill      : 'assets/images/scaling-ui/progressBar-vertical-fill.png',
	border    : 'assets/images/scaling-ui/progressBar-vertical-border.png',
}

export type ProgressBarImageProps = Omit<UiBoxProps, 'uiTransform'> & {
	/** Unique id for the per-instance PropsController / lerp state. */
	id             : string
	/** Current progress value (lerped toward on change). */
	value          : number
	/** Lower bound of the value range. Defaults to `0`. */
	minValue?      : number
	/** Upper bound of the value range. Defaults to `100`. */
	maxValue?      : number
	/** Edge the fill grows from. Defaults to `'left'`. */
	fillFrom?      : FillFrom
	width?         : PositionUnit | 'auto'
	height?        : PositionUnit | 'auto'
	/**
	 * Texture set orientation. Defaults from `fillFrom`
	 * (`top` / `bottom` → vertical, otherwise horizontal).
	 */
	orientation?   : ProgressBarOrientation
	/**
	 * Background / fill / border texture paths. Defaults to the built-in
	 * horizontal or vertical set for `orientation`.
	 */
	textures?      : ProgressBarImageTextures
	/**
	 * Nine-slice margins as fractions of each texture (0–1).
	 * Defaults to `0.3` top/bottom and `0.1` left/right.
	 */
	textureSlices? : TextureSlices
	/**
	 * Optional pixel inset for fill + background inside the border.
	 * Defaults to `0` — textures are expected to align edge-to-edge.
	 */
	contentInset?  : number
	/** Seconds to lerp when `value` changes. Defaults to theme animation value. */
	lerpDuration?  : number
	uiTransform?   : UiTransformProps
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
/** Resolves the texture set for the given orientation. */
function resolveTextures(
	textures   : ProgressBarImageTextures | undefined,
	orientation: ProgressBarOrientation,
): ProgressBarImageTextures {
	if (textures !== undefined) return textures
	return orientation === 'vertical' ? TEXTURES_VERTICAL : TEXTURES_HORIZONTAL
}


// MARK: layerBackground
/** Full-texture nine-slice layer with a white tint (no UV sub-rect). */
function layerBackground(
	src   : string,
	slices: TextureSlices,
) {
	return {
		texture      : { src },
		textureMode  : 'nine-slices' as const,
		textureSlices: slices,
		color        : Color4.White(),
	}
}


// MARK: ProgressBarImage
/**
 * Image progress bar from separate background / fill / border textures.
 * Uses `nine-slices` (no UV subsections) so ends/corners do not distort when
 * the bar is resized. Horizontal and vertical bars use different texture sets.
 * Layers share the same bounds by default; pass `contentInset` only if needed.
 */
export function ProgressBarImage({
	id,
	value,
	minValue      = 0,
	maxValue      = 100,
	fillFrom      = 'left',
	width         = '100%',
	height        = 24,
	orientation,
	textures,
	textureSlices = DEFAULT_TEXTURE_SLICES,
	contentInset  = 0,
	lerpDuration,
	uiTransform,
	uiBackground,
	...props
}: ProgressBarImageProps) {
	const theme    = getTheme()
	const duration = lerpDuration ?? theme.animation.progressBarLerpDurationDefault
	const inset    = Math.max(0, contentInset)
	const resolved = resolveTextures(textures, resolveOrientation(orientation, fillFrom))

	const display = syncDisplayValue(id, value, minValue, maxValue, duration)
	const percent = valueToPercent(display, minValue, maxValue)
	const layout  = resolveFillFrom(fillFrom, percent)

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
				...uiTransform,
			}}
			uiBackground={uiBackground}
		>
			<UiBox
				key = {`${id}_bg`}
				uiTransform={{
					positionType: 'absolute',
					position    : { top: inset, right: inset, bottom: inset, left: inset },
					zIndex      : Z_INDEX_BACKGROUND,
				}}
				uiBackground={layerBackground(resolved.background, textureSlices)}
			/>
			<UiBox
				key = {`${id}_fill_host`}
				uiTransform={{
					positionType  : 'absolute',
					position      : { top: inset, right: inset, bottom: inset, left: inset },
					display       : 'flex',
					flexDirection : layout.flexDirection,
					alignItems    : layout.alignItems,
					justifyContent: 'flex-start',
					zIndex        : Z_INDEX_FILL,
				}}
			>
				<UiBox
					key = {`${id}_fill`}
					uiTransform={{
						width     : layout.fillWidth,
						height    : layout.fillHeight,
						flexGrow  : 0,
						flexShrink: 0,
					}}
					uiBackground={layerBackground(resolved.fill, textureSlices)}
				/>
			</UiBox>
			<UiBox
				key = {`${id}_border`}
				uiTransform={{
					positionType: 'absolute',
					position    : { top: 0, right: 0, bottom: 0, left: 0 },
					zIndex      : Z_INDEX_BORDER,
				}}
				uiBackground={layerBackground(resolved.border, textureSlices)}
			/>
		</UiBox>
	)
}
