import { tweenValue, EasingFunction } from '../utils/tweens'

import { getTheme } from '../styles'


export class VisibilityController {
	public position: number
	public isHidden: boolean = false

	private hasInitialized: boolean = false

	constructor(
		public readonly visiblePosition    : number,
		private readonly getHiddenPosition : () => number,
		public readonly easingFunctionShow?: EasingFunction,
		public readonly easingFunctionHide?: EasingFunction
	) {
		this.position           = getHiddenPosition()
		this.easingFunctionShow = easingFunctionShow || EasingFunction.EF_EASEOUTBACK
		this.easingFunctionHide = easingFunctionHide || EasingFunction.EF_EASEINBACK
	}


	// MARK: hiddenPosition
	/** Live off-screen target; recomputed so viewport/aspect changes stay correct. */
	get hiddenPosition(): number {
		return this.getHiddenPosition()
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
	/** Moves the controlled zone to its hidden position. */
	hide(duration = getTheme().animation.hideDuration) {
		this.isHidden = true

		if (duration > 0) {
			tweenValue(
				this.position,
				this.hiddenPosition,
				duration,
				v => (this.position = v),
				undefined,
				this.easingFunctionHide
			)
		} else {
			this.position = this.hiddenPosition
		}
	}


	// MARK: show
	/** Moves the controlled zone to its visible position. */
	show(duration = getTheme().animation.showDuration) {
		this.isHidden = false

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
