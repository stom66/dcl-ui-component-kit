import { tweenValue, easingFunctions, type EasingFn } from '../utils/tweens'
import { getTheme } from '../styles'


export type VisibilityPosition = 'bottom' | 'left' | 'right' | 'top'

export type VisibilityControllerOptions = {
	showFrom            : VisibilityPosition
	hideTo              : VisibilityPosition
	getOffscreenPosition: (edge: VisibilityPosition) => number
	visiblePosition?    : number
	easingFunctionShow? : EasingFn
	easingFunctionHide? : EasingFn
}


export class VisibilityController {
	public position   : number
	public isHidden   : boolean = false
	public activeEdge : VisibilityPosition
	public isFullyHidden: boolean = false

	public readonly showFrom : VisibilityPosition
	public readonly hideTo   : VisibilityPosition

	private readonly getOffscreenPosition : (edge: VisibilityPosition) => number
	public  readonly visiblePosition      : number
	public  readonly easingFunctionShow   : EasingFn
	public  readonly easingFunctionHide   : EasingFn

	private hasInitialized: boolean = false

	constructor(options: VisibilityControllerOptions) {
		this.showFrom             = options.showFrom
		this.hideTo               = options.hideTo
		this.getOffscreenPosition = options.getOffscreenPosition
		this.visiblePosition      = options.visiblePosition ?? 0
		this.easingFunctionShow   = options.easingFunctionShow ?? easingFunctions.easeOutBack
		this.easingFunctionHide   = options.easingFunctionHide ?? easingFunctions.easeInBack
		this.activeEdge           = this.hideTo
		this.position             = this.getOffscreenPosition(this.hideTo)
	}


	// MARK: hiddenPosition
	/** Live off-screen target for the active hide edge. */
	get hiddenPosition(): number {
		return this.getOffscreenPosition(this.activeEdge)
	}


	// MARK: initialize
	/** Sets the initial visibility once, without fighting later user toggles. */
	initialize(startHidden: boolean) {
		if (this.hasInitialized) return

		this.isHidden = startHidden
		startHidden ? this.hide(0) : this.show(0)

		this.hasInitialized = true
	}


	// MARK: toggle
	/** Toggles between the hidden and visible positions. */
	toggle(duration = this.isHidden ? getTheme().animation.showDuration : getTheme().animation.hideDuration) {
		this.isHidden = !this.isHidden
		this.isHidden ? this.hide(duration) : this.show(duration)
	}


	// MARK: hide
	/** Slides out along `hideTo`, tweening from the visible position to off-screen. */
	hide(duration = getTheme().animation.hideDuration) {
		this.isHidden      = true
		this.isFullyHidden = false
		this.activeEdge    = this.hideTo
		const target       = this.getOffscreenPosition(this.hideTo)

		if (duration > 0) {
			tweenValue(
				this.position,
				target,
				duration,
				v => (this.position = v),
				() => {
					// Ignore stale hide tweens interrupted by a later show().
					if (this.isHidden) this.isFullyHidden = true
				},
				this.easingFunctionHide
			)
		} else {
			this.position      = target
			this.isFullyHidden = true
		}
	}


	// MARK: show
	/**
	 * Slides in along `showFrom`: snaps to that edge off-screen, then tweens to visible.
	 * Re-snap ensures a prior hide-to a different edge does not leave the zone stranded.
	 */
	show(duration = getTheme().animation.showDuration) {
		this.isHidden      = false
		this.isFullyHidden = false
		this.activeEdge    = this.showFrom
		this.position      = this.getOffscreenPosition(this.showFrom)

		if (duration > 0) {
			tweenValue(
				this.position,
				this.visiblePosition,
				duration,
				v => (this.position = v),
				undefined,
				this.easingFunctionShow
			)
		} else {
			this.position = this.visiblePosition
		}
	}
}
