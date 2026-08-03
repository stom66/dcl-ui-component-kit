import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getUVCell, rotateUvIndexes } from '../../utils/uvs'

import type { UiBoxProps } from '../base'
import { Background } from './background'


export type GradientDirection = 'top' | 'bottom' | 'left' | 'right'

const DEFAULT_TEXTURE = 'assets/images/ui-component-kit/gradient-horizontal.png'

/** `rotateUvIndexes` steps for each gradient direction. */
const DIRECTION_ROTATION: Record<GradientDirection, number> = {
	right : 0,
	bottom: 1,
	left  : 2,
	top   : 3,
}

type BackgroundGradientProps = Omit<UiBoxProps, 'backgroundColor'> & {
	children?      : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Tint applied to the gradient texture. Defaults to `theme.colors.body`. */
	color?         : Color4
	/** Gradient flow direction. Defaults to `'top'`. */
	direction?     : GradientDirection
	/**
	 * UV start along the gradient texture (0–1). Defaults to `0.5`.
	 * With `gradientEnd`, selects the strip of the atlas to sample.
	 */
	gradientStart? : number
	/** UV end along the gradient texture (0–1). Defaults to `1`. */
	gradientEnd?   : number
	/** Gradient texture path. Defaults to the bundled horizontal gradient. */
	textureSrc?    : string
}


// MARK: gradientUvCells
/**
 * Maps 0–1 gradient ratios onto 1-based inclusive `getUVCell` columns.
 * Column count is the product of each edge's reciprocal (`1/0.1 × 1/0.25 → 40`),
 * so both ends land on whole cells without a fixed grid size.
 */
function gradientUvCells(
	start: number,
	end  : number,
): { xStart: number; xEnd: number; xTotal: number } {
	const invStart = start > 0 ? 1 / start : 1
	const invEnd   = end > 0 && end < 1 ? 1 / end : 1
	const xTotal   = Math.max(1, Math.round(invStart * invEnd))
	const zeroStart = Math.round(start * xTotal)
	const zeroEnd   = Math.max(zeroStart + 1, Math.round(end * xTotal))

	return {
		xStart: zeroStart + 1,
		xEnd  : zeroEnd,
		xTotal,
	}
}


// MARK: BackgroundGradient
/**
 * Full-size chrome like `Background`, filled with a directional gradient texture.
 *
 * Samples a horizontal strip of `textureSrc` from `gradientStart`–`gradientEnd`
 * (UV ratios), then rotates that quad via `rotateUvIndexes` for `direction`.
 */
export function BackgroundGradient({
	children,
	color,
	direction     = 'top',
	gradientStart = 0.5,
	gradientEnd   = 1,
	textureSrc    = DEFAULT_TEXTURE,
	uiBackground,
	...props
}: BackgroundGradientProps) {
	const theme = getTheme()
	const tint  = color ?? theme.colors.body

	if (gradientEnd <= gradientStart) {
		console.error(
			'BackgroundGradient: gradientEnd must be greater than gradientStart',
			{ gradientStart, gradientEnd },
		)
	}

	const { xStart, xEnd, xTotal } = gradientUvCells(gradientStart, gradientEnd)
	const uvs = rotateUvIndexes(
		getUVCell({ xStart, xEnd, xTotal, yTotal: 1 }),
		DIRECTION_ROTATION[direction],
	)

	return (
		<Background
			{...props}
			backgroundColor = {tint}
			textureSrc      = {textureSrc}
			uiBackground    = {{
				uvs,
				...uiBackground,
			}}
		>
			{children}
		</Background>
	)
}
