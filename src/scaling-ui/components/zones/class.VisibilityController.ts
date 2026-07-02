// ZoneController.ts
//import { EasingFunction } from "@dcl/sdk/ecs"

import { tweenValue, EasingFunction } from '../../utils/tweens'

export class VisibilityController {
	public position: number

	constructor(
		public readonly visiblePosition: number,
		public readonly hiddenPosition : number,
		public readonly easingFunction?: EasingFunction
	) {
		this.position = hiddenPosition
		this.easingFunction = easingFunction || EasingFunction.EF_EASEINBACK
	}
	
	hide(duration = 0.2) {
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

	show(duration = 0.2) {
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
