import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasSpinners } from '../../atlases'
import { Spinner, type SpinnerProps } from './spinner'

export type SpinnerThreeQuarterCircleProps = Omit<SpinnerProps, 'textureSrc' | 'uvs'>


// MARK: SpinnerThreeQuarterCircle
/**
 * Three-quarter-circle spinner preset from the default Scaling UI spinner atlas.
 * Forwards `uiTransform` / `uiBackground` / `uiText` and other UiBox props through to `Spinner`.
 */
export const SpinnerThreeQuarterCircle = ({
	width,
	height,
	speed,
	...props
}: SpinnerThreeQuarterCircleProps) => {
	return (
		<Spinner
			{...props}
			textureSrc = {atlasSpinners.source}
			uvs        = {atlasSpinners.uv.threeQuarterCircle}
			width      = {width}
			height     = {height}
			speed      = {speed}
		/>
	)
}