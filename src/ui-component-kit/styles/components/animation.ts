export type ThemeAnimation = {
	showDuration: number
	hideDuration: number

	/** Seconds for one spin of `spinnerDegreesDefault`. Defaults to `1`. */
	spinnerDurationDefault     : number
	/** Degrees rotated during one `spinnerDurationDefault`. Defaults to `180`. Negative = reverse. */
	spinnerDegreesDefault      : number
	/** Number of spins before the pause. Defaults to `1`. */
	spinnerBurstCountDefault   : number
	/** Seconds to rest between bursts. Defaults to `0` (continuous). */
	spinnerBurstIntervalDefault: number

	/** Seconds for one pulse instance (grow + shrink). Defaults to `0.5`. */
	pulseDurationDefault     : number
	/** Number of pulse instances before the pause. Defaults to `2`. */
	pulseBurstCountDefault   : number
	/** Seconds to rest between bursts. Defaults to `1`. */
	pulseBurstIntervalDefault: number
	/** Minimum scale during a pulse. Defaults to `0.8`. */
	pulseScaleMinDefault     : number
	/** Maximum scale during a pulse. Defaults to `1.2`. */
	pulseScaleMaxDefault     : number

	/** Seconds for one bounce instance (up + down). Defaults to `0.5`. */
	bounceDurationDefault     : number
	/** Number of bounce instances before the pause. Defaults to `2`. */
	bounceBurstCountDefault   : number
	/** Seconds to rest between bursts. Defaults to `1`. */
	bounceBurstIntervalDefault: number
	/** Minimum `position.top` during a bounce. Defaults to `0`. */
	bounceOffsetMinDefault    : number
	/** Maximum `position.top` during a bounce. Defaults to `-16`. */
	bounceOffsetMaxDefault    : number

	/** Seconds for one shake-sequence instance. Defaults to `0.4`. */
	shakeDurationDefault     : number
	/** Number of shake-sequence instances before the pause. Defaults to `2`. */
	shakeBurstCountDefault   : number
	/** Seconds to rest between bursts. Defaults to `1`. */
	shakeBurstIntervalDefault: number
	/** Left/right moves per sequence. Defaults to `3` (left, right, left). */
	shakeCountDefault        : number
	/** Leftmost `position.left` during a shake. Defaults to `-8`. */
	shakeOffsetMinDefault    : number
	/** Rightmost `position.left` during a shake. Defaults to `8`. */
	shakeOffsetMaxDefault    : number

	/** Seconds for one color-flash instance (to target + back). Defaults to `0.5`. */
	flashColorDurationDefault     : number
	/** Number of flash instances before the pause. Defaults to `2`. */
	flashColorBurstCountDefault   : number
	/** Seconds to rest between bursts. Defaults to `1`. */
	flashColorBurstIntervalDefault: number

	/** Seconds for one border-flash instance (to target + back). Defaults to `0.5`. */
	flashBorderDurationDefault     : number
	/** Number of border-flash instances before the pause. Defaults to `2`. */
	flashBorderBurstCountDefault   : number
	/** Seconds to rest between border-flash bursts. Defaults to `1`. */
	flashBorderBurstIntervalDefault: number

	/** Seconds for one wiggle-sequence instance. Defaults to `0.5`. */
	wiggleDurationDefault     : number
	/** Number of wiggle-sequence instances before the pause. Defaults to `2`. */
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

	spinnerDurationDefault     : 1,
	spinnerDegreesDefault      : 180,
	spinnerBurstCountDefault   : 1,
	spinnerBurstIntervalDefault: 0,

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

	flashBorderDurationDefault     : 0.5,
	flashBorderBurstCountDefault   : 2,
	flashBorderBurstIntervalDefault: 1,

	wiggleDurationDefault     : 0.75,
	wiggleBurstCountDefault   : 1,
	wiggleBurstIntervalDefault: 1,
	wiggleCountDefault        : 3,
	wiggleMaxRotationDefault  : 30,

	progressBarLerpDurationDefault: 0.35,
}
