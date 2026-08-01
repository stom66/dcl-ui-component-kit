import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasSpinners } from '../../atlases'
import { Spinner, type SpinnerProps } from './spinner'

export type SpinnerCircleProps = Omit<SpinnerProps, 'textureSrc' | 'uvs'>


// MARK: SpinnerCircle
/**
 * Circle spinner preset from the default Scaling UI spinner atlas.
 * Forwards `uiTransform` / `uiBackground` / `uiText` and other UiBox props through to `Spinner`.
 */
export const SpinnerCircle = ({
	width,
	height,
	speed,
	...props
}: SpinnerCircleProps) => {
	return (
		<Spinner
			{...props}
			textureSrc = {atlasSpinners.source}
			uvs        = {atlasSpinners.uv.circle}
			width      = {width}
			height     = {height}
			speed      = {speed}
		/>
	)
}
