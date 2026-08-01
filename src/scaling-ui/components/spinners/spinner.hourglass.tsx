import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasSpinners } from '../../atlases'
import { Spinner, type SpinnerProps } from './spinner'

export type SpinnerHourglassProps = Omit<SpinnerProps, 'textureSrc' | 'uvs'>


// MARK: SpinnerHourglass
/**
 * Hourglass spinner preset from the default Scaling UI spinner atlas.
 * Forwards `uiTransform` / `uiBackground` / `uiText` and other UiBox props through to `Spinner`.
 */
export const SpinnerHourglass = ({
	width,
	height,
	speed,
	...props
}: SpinnerHourglassProps) => {
	return (
		<Spinner
			{...props}
			textureSrc = {atlasSpinners.source}
			uvs        = {atlasSpinners.uv.hourglass}
			width      = {width}
			height     = {height}
			speed      = {speed}
		/>
	)
}
