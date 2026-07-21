// ZoneController.ts
//import { EasingFunction } from "@dcl/sdk/ecs"

import { tweenValue, EasingFunction } from '../../utils/tweens'

export class VisibilityController {
	public position: number
	public isHidden: boolean = false

	private hasInitialized: boolean = false

	constructor(
		public readonly visiblePosition: number,
		public readonly hiddenPosition : number,
		public readonly easingFunction?: EasingFunction
	) {
		this.position = hiddenPosition
		this.easingFunction = easingFunction || EasingFunction.EF_EASEINBACK
	}


	// MARK: initialize
	/** Sets the initial visibility once, without fighting later user toggles. */
	initialize(isHidden: boolean) {
		if (this.hasInitialized) return

		this.isHidden = isHidden
		isHidden ? this.hide(0) : this.show(0)

		this.hasInitialized = true
	}


	// MARK: toggle
	/** Toggles between the hidden and visible positions. */
	toggle(duration = 0.2) {
		this.isHidden = !this.isHidden
		this.isHidden ? this.hide(duration) : this.show(duration)
	}
	
	// MARK: hide
	/** Moves the controlled zone to its hidden position. */
	hide(duration = 0.2) {
		this.isHidden = true

		if (duration > 0) {
			tweenValue(
				this.position,
				this.hiddenPosition,
				duration,
				v => (this.position = v),
				undefined,
				this.easingFunction
			)
		} else {
			this.position = this.hiddenPosition
		}
	}

	// MARK: show
	/** Moves the controlled zone to its visible position. */
	show(duration = 0.2) {
		this.isHidden = false

		if (duration > 0) {
			tweenValue(
				this.position,
				this.visiblePosition,
				duration,
				v => (this.position = v),
				undefined,
				this.easingFunction
			)
		} else {
			this.position = this.visiblePosition
		}
	}
}
