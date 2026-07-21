import { EasingFunction, tweenValue } from "./tweens";


// MARK: Pulse
/**
 * Pulse the width and height of an element.
 * @param width - The width of the element.
 * @param height - The height of the element.
 * @param scale - The scale of the element.
 * @param duration - The duration of the animation.
 * @param easing - The easing function to use.
 */
export function pulse(
	width   : number, 
	height  : number,
	scale   : number         = 1.25,
	duration: number         = 0.5, // seconds
	easing  : EasingFunction = EasingFunction.EF_EASECIRC
) {
	tweenValue(
		width,
		width * scale,
		duration / 2,
		(v: number) => {
			width = v
		},
		() => {
			tweenValue(
				width * scale,
				width,
				duration / 2,
				(v: number) => {
					width = v
				},
				() => {
					// complete
				},
				easing
			)
		},
		easing
	)
	tweenValue(
		height,
		height * scale,
		duration / 2,
		(v: number) => {
			height = v
		},
		() => {
			tweenValue(
				height * scale,
				height,
				duration / 2,
				(v: number) => {
					height = v
				},
				() => {
					// complete
				},
				easing
			)
		},
		easing
	)
}