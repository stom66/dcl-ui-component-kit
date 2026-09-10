import ReactEcs from '@dcl/sdk/react-ecs'

import { PropsController } from '../../classes/propsController'
import { VisibilityController, type VisibilityPosition } from '../../classes/visibilityController'
import type { UiBoxProps } from '../base'
import { Zone } from '../zones/zone.default'
import { createVisibilityForZone, ZoneType } from '../zones/zone.presets'


/**
 * Screen area for a Layer’s UI renderer (SDK `screenInset`).
 * - `'none'` — full canvas
 * - `'device'` — device safe area (notch / home indicator)
 * - `'interactable'` — explorer HUD-free rect
 *
 * Omit on the Layer to inherit SetupUiComponentKit `screenInset` (default `'none'`).
 */
export type KitScreenInset = 'none' | 'device' | 'interactable'


export type LayerOptions = {
	id              : string
	/**
	 * Zone preset. Defaults to `ZoneType.Default`.
	 * Use `ZoneType.FullScreen` for loading / splash (edge-to-edge of the
	 * Layer’s inset canvas). Prefer `inset: 'interactable'` over the deprecated
	 * `ZoneType.InteractableArea`.
	 */
	zone?           : ZoneType
	/**
	 * Per-layer canvas chrome. When omitted, SetupUiComponentKit `screenInset`
	 * applies. Layers that share the same resolved inset share one SDK renderer.
	 */
	inset?          : KitScreenInset
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
	/** Raw option; may be undefined — Setup resolves against its `screenInset` default. */
	readonly inset?          : KitScreenInset
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

	/**
	 * Once a hideable layer has been shown, keep `body()` mounted under
	 * `display: 'none'` when hidden. Unmounting the tree lets ReactEcs recycle
	 * UiEntities into other layers (Progress bars appearing inside Grids / Layout).
	 */
	private keepContentMounted = false

	constructor(options: LayerOptions) {
		this.id              = options.id
		// Default zone is a centered panel. FullScreen is edge-to-edge —
		// reserve it for loading / splash layers.
		this.zone            = options.zone ?? ZoneType.Default
		this.inset           = options.inset
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

		if (this.zone === ZoneType.InteractableArea) {
			console.error(
				`Layer: id=${this.id} ZoneType.InteractableArea is deprecated — use inset: 'interactable' with ZoneType.FullScreen (or Default)`,
			)
		}

		// startHidden layers stay content-unmounted until first show().
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
	 * The canvas is owned by SetupUiComponentKit (per-layer `inset` / Setup
	 * `screenInset`). Do not wrap `ScreenInsetArea` / `InteractableArea` here.
	 * `showCloseButton` is configured on the Layer and applied by the Zone.
	 * For fill / border, return a sibling empty `Background` from `body()`
	 * (do not nest content inside it — preserves zone flex alignment).
	 *
	 * Hidden layers use a keyed Zone with `display: 'none'`. After the first show,
	 * `body()` stays mounted — tearing it down lets ReactEcs recycle UiEntities
	 * into sibling layers (Progress bars inside Grids / Layout / left nav).
	 * Never-opened `startHidden` layers skip `body()` until first shown.
	 */
	render(): ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | null {
		const fullyHidden = this.canBeHidden && this.visibility.isFullyHidden
		if (!fullyHidden) {
			this.keepContentMounted = true
		}

		const mountContent = !fullyHidden || this.keepContentMounted
		const content      = mountContent ? this.body() : null

		if (this.zone === ZoneType.None) {
			if (!mountContent) return null
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
					...this.uiTransform,
					...(this.zIndex !== undefined ? { zIndex: this.zIndex } : {}),
					...(fullyHidden ? { display: 'none' as const } : {}),
				}}
			>
				{content}
			</Zone>
		)
	}
}
