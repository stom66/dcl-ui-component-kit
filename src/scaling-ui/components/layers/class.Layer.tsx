import ReactEcs from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { VisibilityController, type VisibilityPosition } from '../../classes/visibilityController'
import type { UiBoxProps } from '../base'
import { Zone } from '../zones/zone.default'
import { createVisibilityForZone, ZoneType } from '../zones/zone.presets'


export type LayerOptions = {
	id              : string
	zone?           : ZoneType
	canBeHidden?    : boolean
	startHidden?    : boolean
	showCloseButton?: boolean
	/** Edge the layer slides in from when shown. Defaults to the zone preset (or `hideTo` if only that is set). */
	showFrom?       : VisibilityPosition
	/** Edge the layer slides out to when hidden. Defaults to `showFrom` / zone preset. */
	hideTo?         : VisibilityPosition
	zIndex?         : number
	uiTransform?    : UiBoxProps['uiTransform']
	uiBackground?   : UiBoxProps['uiBackground']
}


export abstract class Layer {
	readonly id              : string
	readonly zone            : ZoneType
	readonly canBeHidden     : boolean
	readonly startHidden     : boolean
	readonly showCloseButton : boolean
	readonly showFrom?       : VisibilityPosition
	readonly hideTo?         : VisibilityPosition
	readonly zIndex?         : number
	readonly uiTransform?    : UiBoxProps['uiTransform']
	readonly uiBackground?   : UiBoxProps['uiBackground']
	readonly visibility      : VisibilityController

	protected props?: PropsController<Record<string, unknown>>

	constructor(options: LayerOptions) {
		this.id              = options.id
		this.zone            = options.zone ?? ZoneType.FullScreen
		this.canBeHidden     = options.canBeHidden ?? false
		this.startHidden     = options.startHidden ?? false
		this.showCloseButton = options.showCloseButton ?? false
		this.showFrom        = options.showFrom
		this.hideTo          = options.hideTo
		this.zIndex          = options.zIndex
		this.uiTransform     = options.uiTransform
		this.uiBackground    = options.uiBackground
		this.visibility      = createVisibilityForZone(this.zone, {
			showFrom: options.showFrom,
			hideTo  : options.hideTo,
		})

		// Apply startHidden before the first render so off-screen layers can
		// unmount immediately instead of building a full UI tree every frame.
		if (this.canBeHidden) {
			this.visibility.initialize(this.startHidden)
		}
	}


	// MARK: show
	/** Shows this layer when it supports hiding. */
	show(duration = 0.2) {
		if (!this.canBeHidden) {
			console.error(`Layer.show: id=${this.id} canBeHidden is false`)
			return
		}
		this.visibility.show(duration)
	}


	// MARK: hide
	/** Hides this layer when it supports hiding. */
	hide(duration = 0.2) {
		if (!this.canBeHidden) {
			console.error(`Layer.hide: id=${this.id} canBeHidden is false`)
			return
		}
		this.visibility.hide(duration)
	}


	// MARK: toggle
	/** Toggles this layer when it supports hiding. */
	toggle(duration = 0.2) {
		if (!this.canBeHidden) {
			console.error(`Layer.toggle: id=${this.id} canBeHidden is false`)
			return
		}
		this.visibility.toggle(duration)
	}


	// MARK: body
	/** Layer content rendered inside the configured zone (or raw when zone is None). */
	protected abstract body(): ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | null


	// MARK: render
	/**
	 * Mounts this layer as one Zone (preset + uiTransform / uiBackground).
	 * The canvas (`ScreenInsetArea` + full-size stack) is owned by SetupScalingUI.
	 * `showCloseButton` is configured on the Layer and applied by the Zone.
	 * For fill / border, wrap `body()` content in `Background`.
	 *
	 * After the hide animation finishes, returns `null` so the UiEntity tree is
	 * unmounted (driven by `visibility.isFullyHidden`, not viewport math).
	 */
	render(): ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | null {
		if (this.canBeHidden && this.visibility.isFullyHidden) {
			return null
		}

		const content = this.body()

		if (this.zone === ZoneType.None) {
			return content
		}

		return (
			<Zone
				key                  = {`layer_zone_${this.id}`}
				type                 = {this.zone}
				canBeHidden          = {this.canBeHidden}
				startHidden          = {this.startHidden}
				showCloseButton      = {this.showCloseButton}
				closeButtonId        = {`btn_close_${this.id}`}
				visibilityController = {this.visibility}
				showFrom             = {this.showFrom}
				hideTo               = {this.hideTo}
				uiBackground         = {this.uiBackground}
				uiTransform          = {{
					zIndex: this.zIndex,
					...this.uiTransform,
				}}
			>
				{content}
			</Zone>
		)
	}
}
