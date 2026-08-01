import ReactEcs from '@dcl/sdk/react-ecs'

import { Spinner, type SpinnerProps } from './spinner'

const TEXTURE = 'assets/images/scaling-ui/spinner-beams-even.png'

export type SpinnerBeamsEvenProps = Omit<SpinnerProps, 'textureSrc' | 'uvs'>


// MARK: SpinnerBeamsEven
/**
 * Even-beams spinner preset.
 * Forwards `uiTransform` / `uiBackground` / `uiText` and other UiBox props through to `Spinner`.
 */
export const SpinnerBeamsEven = ({
	width,
	height,
	speed,
	...props
}: SpinnerBeamsEvenProps) => {
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
