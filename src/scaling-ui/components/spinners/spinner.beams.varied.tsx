import ReactEcs from '@dcl/sdk/react-ecs'

import { Spinner, type SpinnerProps } from './spinner'

const TEXTURE = 'assets/images/scaling-ui/spinner-beams-varied.png'

export type SpinnerBeamsVariedProps = Omit<SpinnerProps, 'textureSrc' | 'uvs'>


// MARK: SpinnerBeamsVaried
/**
 * Even-beams spinner preset.
 * Forwards `uiTransform` / `uiBackground` / `uiText` and other UiBox props through to `Spinner`.
 */
export const SpinnerBeamsVaried = ({
	width,
	height,
	speed,
	...props
}: SpinnerBeamsVariedProps) => {
	return (
		<Spinner
			{...props}
			textureSrc = {TEXTURE}
			width      = {width}
			height     = {height}
			speed      = {speed}
		/>
	)
}
