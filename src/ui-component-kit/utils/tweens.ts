import { engine } from "@dcl/sdk/ecs"

/** Progress-in / progress-out easing curve. `t` is expected in `[0, 1]`. */
export type EasingFn = (t: number) => number


// MARK: easeOutBounce
const easeOutBounce: EasingFn = (t) => {
	if (t < 1 / 2.75) return 7.5625 * t * t
	if (t < 2 / 2.75) return 7.5625 * (t   -= 1.5 / 2.75) * t + 0.75
	if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
	return 7.5625 * (t                     -= 2.625 / 2.75) * t + 0.984375
}


// MARK: easingFunctions
/** Built-in easing curves. Pass any of these (or a custom `EasingFn`) into tweens / Pulse. */
export const easingFunctions = {
	linear        : (t: number) => t,
	easeBack      : (t: number) => { const c = 1.70158 * 1.525; return t < 0.5 ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2 : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2 },
	easeBounce    : (t: number) => t < 0.5 ? (1 - easeOutBounce(1 - 2 * t)) / 2 : (1 + easeOutBounce(2 * t - 1)) / 2,
	easeCirc      : (t: number) => t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
	easeCubic     : (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
	easeElastic   : (t: number) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2 + 1,
	easeExpo      : (t: number) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
	easeInBack    : (t: number) => 2.70158 * t * t * t - 1.70158 * t * t,
	easeInBounce  : (t: number) => 1 - easeOutBounce(1 - t),
	easeInCirc    : (t: number) => 1 - Math.sqrt(1 - t * t),
	easeInCubic   : (t: number) => t * t * t,
	easeInElastic : (t: number) => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3),
	easeInExpo    : (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
	easeInQuad    : (t: number) => t * t,
	easeInQuart   : (t: number) => t * t * t * t,
	easeInQuint   : (t: number) => t * t * t * t * t,
	easeInSine    : (t: number) => 1 - Math.cos((t * Math.PI) / 2),
	easeOutBack   : (t: number) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) },
	easeOutCirc   : (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
	easeOutCubic  : (t: number) => 1 - Math.pow(1 - t, 3),
	easeOutElastic: (t: number) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
	easeOutExpo   : (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
	easeOutQuad   : (t: number) => t * (2 - t),
	easeOutQuart  : (t: number) => 1 - Math.pow(1 - t, 4),
	easeOutQuint  : (t: number) => 1 - Math.pow(1 - t, 5),
	easeOutSine   : (t: number) => Math.sin((t * Math.PI) / 2),
	easeQuad      : (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
	easeQuart     : (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
	easeQuint     : (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
	easeSine      : (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
	easeOutBounce,
} satisfies Record<string, EasingFn>


// MARK: lerp
export function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t
}


// MARK: tweenValue
export function tweenValue(
	from       : number,
	to         : number,
	duration   : number = 0.35,
	onUpdate   : (v: number) => void,
	onComplete?: () => void,
	easing     : EasingFn = easingFunctions.easeOutBack
) {
	let elapsed = 0

	function system(dt: number) {
		elapsed += dt
		const t      = Math.min(elapsed / duration, 1)
		const easedT = easing(t)
		onUpdate(lerp(from, to, easedT))

		if (t >= 1) {
			onUpdate(to)
			engine.removeSystem(system)
			onComplete?.()
		}
	}

	engine.addSystem(system)
}
