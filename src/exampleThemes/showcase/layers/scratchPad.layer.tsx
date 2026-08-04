import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { type PositionUnit, scaleFontSize, UiEntity } from '@dcl/sdk/react-ecs'

import { Layer, ZoneType } from '../../../ui-component-kit'


/** Cap on how many items the grid will render (slice long lists). */
const MAX_CELLS = 20

/** Columns per wrap line; rows are derived from the item count. */
const MAX_COLS  = 5

/**
 * Visual cell size inside each slot (slot stays a pure % box for flexWrap).
 * Remaining space is the gutter — do not put padding/border/text on the slot.
 */
const CELL_FILL = '90%'

const panelBg    = Color4.create(0.08, 0.10, 0.14, 0.72)
const cellBg     = Color4.create(0.35, 0.55, 0.85, 0.35)
const cellBorder = Color4.create(0.75, 0.85, 1.0, 0.55)
const closeBg    = Color4.create(0.90, 0.25, 0.25, 0.85)


type ScratchItem = {
	id   : string | number
	label: string
}


// MARK: getScratchItems
/**
 * Stand-in data source for the grid. Swap this for a real list from props,
 * a store, or another function — the layer only needs `id` + `label`.
 */
function getScratchItems(): ScratchItem[] {
	const items: ScratchItem[] = []
	for (let i = 0; i < MAX_CELLS; i++) {
		items.push({
			id   : i,
			label: `${i + 1}`,
		})
	}
	return items
}


// MARK: ScratchPadLayer
/**
 * Minimal raw-`UiEntity` scratch pad: a centered square panel, a flat
 * flexWrap grid driven by a list + `MAX_COLS`, and an absolute top-right
 * close control. Intentionally kit-light as a baseline layout example.
 */
export class ScratchPadLayer extends Layer {
	constructor() {
		super({
			id         : 'scratch-pad',
			zone       : ZoneType.FullScreen,
			canBeHidden: true,
			startHidden: false,
			uiTransform: {
				width         : '100%',
				height        : '100%',
				display       : 'flex',
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: 'center',
			},
		})
	}


	// MARK: body
	protected body() {
		const items = getScratchItems().slice(0, MAX_CELLS)
		const cols  = MAX_COLS
		const rows  = Math.max(1, Math.ceil(items.length / cols))

		const cellWidth  = `${100 / cols}%` as PositionUnit
		const cellHeight = `${100 / rows}%` as PositionUnit
		const cells: ReactEcs.JSX.Element[] = []

		// Flat list + flexWrap. The SLOT must stay a pure percentage box —
		// no padding, border, or text. Those create an intrinsic min-content
		// width; when the panel is smaller (e.g. 720px vs ~42vw), that min
		// size exceeds one column share and Yoga wraps a column early.
		// Gutters come from a smaller centered fill inside the slot.
		for (const item of items) {
			cells.push(
				<UiEntity
					key={`scratch_slot_${item.id}`}
					uiTransform={{
						width         : cellWidth,
						height        : cellHeight,
						minWidth      : 0,
						display       : 'flex',
						alignItems    : 'center',
						justifyContent: 'center',
					}}
				>
					<UiEntity
						key={`scratch_cell_${item.id}`}
						uiTransform={{
							width       : CELL_FILL,
							height      : CELL_FILL,
							borderWidth : 1,
							borderRadius: 4,
							borderColor : cellBorder,
						}}
						uiBackground={{
							color: cellBg,
						}}
						uiText={{
							value    : item.label,
							fontSize : scaleFontSize(14),
							textAlign: 'middle-center',
							color    : Color4.White(),
						}}
					/>
				</UiEntity>
			)
		}

		return (
			<UiEntity
				key="scratch_panel"
				uiTransform={{
					width       : 720,
					height      : 720,
					padding     : '3%',
					positionType: 'relative',
					borderWidth : 1,
					borderRadius: 8,
					borderColor : Color4.create(1, 1, 1, 0.25),
				}}
				uiBackground={{
					color: panelBg,
				}}
			>
				<UiEntity
					key="scratch_grid"
					uiTransform={{
						width         : '100%',
						height        : '100%',
						display       : 'flex',
						flexDirection : 'row',
						flexWrap      : 'wrap',
						alignContent  : 'flex-start',
					}}
				>
					{cells}
				</UiEntity>

				<UiEntity
					key="scratch_close"
					uiTransform={{
						width       : 64,
						height      : 64,
						positionType: 'absolute',
						position    : { top: -32, right: -32 },
						borderWidth : 2,
						borderRadius: 32,
						borderColor : Color4.create(1, 1, 1, 0.4),
					}}
					uiBackground={{
						color: closeBg,
					}}
					uiText={{
						value    : 'X',
						fontSize : scaleFontSize(14),
						textAlign: 'middle-center',
						color    : Color4.White(),
					}}
					onMouseDown={() => {
						this.hide()
					}}
				/>
			</UiEntity>
		)
	}
}

export const scratchPadLayer = new ScratchPadLayer()
