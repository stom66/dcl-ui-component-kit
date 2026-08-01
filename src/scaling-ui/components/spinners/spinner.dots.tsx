import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasSpinners } from '../../atlases'
import { Spinner, type SpinnerProps } from './spinner'

export type SpinnerDotsProps = Omit<SpinnerProps, 'textureSrc' | 'uvs'>


// MARK: SpinnerDots
/**
 * Dot-ring spinner preset from the default Scaling UI spinner atlas.
 * Forwards `uiTransform` / `uiBackground` / `uiText` and other UiBox props through to `Spinner`.
 */
export const SpinnerDots = ({
	width,
	height,
	speed,
	...props
}: SpinnerDotsProps) => {
	return (
		<Spinner
			{...props}
			textureSrc = {atlasSpinners.source}
			uvs        = {atlasSpinners.uv.dots}
			width      = {width}
			height     = {height}
			speed      = {speed}
		/>
	)
}
