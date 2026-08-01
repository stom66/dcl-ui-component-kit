export type ThemeAnimation = {
	showDuration: number
	hideDuration: number

	/** Rotation speed in degrees per second. Defaults to `720`. */
	spinnerSpeedDefault   : number
	/** Seconds to rest after each full revolution. Defaults to `0` (continuous). */
	spinnerIntervalDefault: number

	/** Seconds for one full pulse (grow + shrink). Defaults to `0.5`. */
	pulseDurationDefault     : number
	/** Number of pulses before the pause. Defaults to `2`. */
	pulseBurstCountDefault   : number
	/** Seconds to rest between bursts. Defaults to `1`. */
	pulseBurstIntervalDefault: number
	/** Minimum scale during a pulse. Defaults to `0.8`. */
	pulseScaleMinDefault     : number
	/** Maximum scale during a pulse. Defaults to `1.2`. */
	pulseScaleMaxDefault     : number

	/** Seconds for one full bounce (up + down). Defaults to `0.5`. */
	bounceDurationDefault     : number
	/** Number of bounces before the pause. Defaults to `2`. */
	bounceBurstCountDefault   : number
	/** Seconds to rest between bursts. Defaults to `1`. */
	bounceBurstIntervalDefault: number
	/** Minimum `position.top` during a bounce. Defaults to `0`. */
	bounceOffsetMinDefault    : number
	/** Maximum `position.top` during a bounce. Defaults to `-16`. */
	bounceOffsetMaxDefault    : number

	/** Seconds for one full shake sequence. Defaults to `0.4`. */
	shakeDurationDefault     : number
	/** Number of shake sequences before the pause. Defaults to `2`. */
	shakeBurstCountDefault   : number
	/** Seconds to rest between bursts. Defaults to `1`. */
	shakeBurstIntervalDefault: number
	/** Left/right moves per sequence. Defaults to `3` (left, right, left). */
	shakeCountDefault        : number
	/** Leftmost `position.left` during a shake. Defaults to `-8`. */
	shakeOffsetMinDefault    : number
	/** Rightmost `position.left` during a shake. Defaults to `8`. */
	shakeOffsetMaxDefault    : number

	/** Seconds for one full color flash (to target + back). Defaults to `0.5`. */
	flashColorDurationDefault     : number
	/** Number of flashes before the pause. Defaults to `2`. */
	flashColorBurstCountDefault   : number
	/** Seconds to rest between bursts. Defaults to `1`. */
	flashColorBurstIntervalDefault: number

	/** Seconds for one full wiggle sequence. Defaults to `0.5`. */
	wiggleDurationDefault     : number
	/** Number of wiggle sequences before the pause. Defaults to `2`. */
	wiggleBurstCountDefault   : number
	/** Seconds to rest between bursts. Defaults to `1`. */
	wiggleBurstIntervalDefault: number
	/** Alternating rotations per sequence. Defaults to `3` (-max, +max, -max). */
	wiggleCountDefault        : number
	/** Maximum rotation in degrees from center. Defaults to `45`. */
	wiggleMaxRotationDefault  : number

	/** Seconds to lerp a progress bar toward a new value. Defaults to `0.35`. */
	progressBarLerpDurationDefault: number
}

export const animation: ThemeAnimation = {
	showDuration: 0.35,
	hideDuration: 0.35,

	spinnerSpeedDefault   : 180,
	spinnerIntervalDefault: 0,

	pulseDurationDefault     : 0.5,
	pulseBurstCountDefault   : 2,
	pulseBurstIntervalDefault: 1,
	pulseScaleMinDefault     : 0.8,
	pulseScaleMaxDefault     : 1.2,

	bounceDurationDefault     : 0.5,
	bounceBurstCountDefault   : 2,
	bounceBurstIntervalDefault: 1,
	bounceOffsetMinDefault    : 0,
	bounceOffsetMaxDefault    : -16,

	shakeDurationDefault     : 0.4,
	shakeBurstCountDefault   : 1,
	shakeBurstIntervalDefault: 1,
	shakeCountDefault        : 3,
	shakeOffsetMinDefault    : -8,
	shakeOffsetMaxDefault    : 8,

	flashColorDurationDefault     : 0.5,
	flashColorBurstCountDefault   : 2,
	flashColorBurstIntervalDefault: 1,

	wiggleDurationDefault     : 0.75,
	wiggleBurstCountDefault   : 1,
	wiggleBurstIntervalDefault: 1,
	wiggleCountDefault        : 3,
	wiggleMaxRotationDefault  : 30,

	progressBarLerpDurationDefault: 0.35,
}
