import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiBackgroundProps, UiTransformProps } from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, Background, Column, Divider, getTheme, Grid, H2, H3, Icon, IconNumber, Layer, Row, Text, ZoneType } from '../../../ui-component-kit'


/** Extra icons after the numbered first line (12-col demo has 12 + these). */
const TAIL_ICONS_12 = [
	'skull', 'bomb', 'bell', 'eye', 'dragon', 'robot', 'compass', 'map',
] as const

/** Extra icons after the numbered first line (9-col demo has 9 + these). */
const LIMIT_9 = 9
const TAIL_ICONS_9 = [
	'locationDot', 'mapLocationDot', 'circleCheck', 'circleXmark',
	'lock', 'unlock', 'users', 'house', 'sun', 'moon', 'clock',
] as const

type GridIconName = typeof TAIL_ICONS_12[number] | typeof TAIL_ICONS_9[number]


// MARK: GridCell
/**
 * Icon / number cell for the grid demos.
 * Pass `number` for a digit glyph, `name` for an FA icon, or neither for an
 * empty slot (Grid pads incomplete tracks itself when needed).
 */
function GridCell({
	name,
	number,
	color,
	backgroundColor,
	uiTransform,
	uiBackground,
}: {
	key?             : string
	name?            : GridIconName
	number?          : number
	/** Cell fill — alias of `backgroundColor`. */
	color?           : Color4
	backgroundColor? : Color4
	uiTransform?     : UiTransformProps
	uiBackground?    : UiBackgroundProps
}) {
	const theme = getTheme()
	const empty = name === undefined && number === undefined
	const fill  = empty
		? undefined
		: (backgroundColor ?? color ?? uiBackground?.color ?? alpha(theme.colors.body, 0.45))

	return (
		<Column
			spacing        = {0}
			borderWidth    = {empty ? 0 : theme.border.width}
			borderRadius   = {theme.border.radiusSmall}
			borderColor    = {alpha(theme.colors.light, 0.12)}
			color          = {fill}
			uiBackground   = {uiBackground}
			alignItems     = "center"
			justifyContent = "center"
			padding        = {{ top: 8, right: 4, bottom: 8, left: 4 }}
			minHeight      = {48}
			uiTransform    = {uiTransform}
		>
			{number !== undefined && (
				<IconNumber value={number} height={36} />
			)}
			{number === undefined && name !== undefined && (
				<Icon
					uvs    = {atlasIconsFontAwesome.uv[name]}
					width  = "32"
					height = "32"
				/>
			)}
		</Column>
	)
}


// MARK: DemoGridsLayer
/**
 * Showcase for equal-cell `Grid`: set `limit` (items per row/column) and drop
 * in children — no `flexWrap`, sticky `cols`, or manual chunking.
 */
export class DemoGridsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-grids',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : false,
			showCloseButton: true,
			uiTransform    : {
				width : '48vw',
				height: 'auto',
			},
		})
	}


	// MARK: body
	protected body() {
		return (
			<Background fitContent>
				<Column
					cols           = {12}
					spacing        = {10}
					alignItems     = "stretch"
					justifyContent = "flex-start"
					padding        = {{ top: 16, right: 20, bottom: 16, left: 20 }}
				>
					<H2 value="Grids" />
					<Text value={'Use Grid with limit for equal-size inventory cells. Gutters use normal spacing (spacer entities) — no padded cols wrappers. First cells are numbered so track breaks are obvious.'} />

					<Divider margin={{ top: 4, bottom: 4 }} />

					<Row alignItems="flex-start" spacing={18}>
						<Column cols={3} alignItems="stretch">
							{this.renderThreeByThreeExample()}
						</Column>

						{/* auto fills leftover after cols={3} + spacing */}
						<Column cols="auto" alignItems="stretch">
							{this.renderTwelveExample()}
						</Column>
					</Row>

					<Divider margin={{ top: 4, bottom: 4 }} />

					{this.renderNineExample()}
				</Column>
			</Background>
		)
	}


	// MARK: renderThreeByThreeExample
	/** Compact 3×3 grid: nine cells, `limit={3}`. */
	private renderThreeByThreeExample() {
		const theme = getTheme()
		const cells: ReactEcs.JSX.Element[] = []

		for (let n = 1; n <= 9; n++) {
			cells.push(
				<GridCell
					key    = {`grid3-num-${n}`}
					number = {n}
					color  = {alpha(theme.colors.primary, 0.5)}
				/>
			)
		}

		return (
			<Column cols={12} spacing={6} alignItems="stretch">
				<H3 value="3 × 3 — limit={3}" />
				<Text
					value    = "Nine equal cells, three per row."
					fontSize = {theme.typography.size.small}
				/>
				<Grid limit={3} spacing={6}>
					{cells}
				</Grid>
			</Column>
		)
	}


	// MARK: renderTwelveExample
	/** Wide board: `limit={12}`, first row digits 1–12, then more icons. */
	private renderTwelveExample() {
		const theme = getTheme()
		const cells: ReactEcs.JSX.Element[] = []

		for (let n = 1; n <= 12; n++) {
			cells.push(
				<GridCell key={`grid12-num-${n}`} number={n} />
			)
		}
		for (const name of TAIL_ICONS_12) {
			cells.push(
				<GridCell key={`grid12-${name}`} name={name} />
			)
		}

		return (
			<Column cols={12} spacing={6} alignItems="stretch">
				<H3 value="12 × ? — limit={12}" />
				<Text
					value    = "Equal cells wrap to a new track once each row hits the limit."
					fontSize = {theme.typography.size.small}
				/>
				<Grid limit={12} spacing={6}>
					{cells}
				</Grid>
			</Column>
		)
	}


	// MARK: renderNineExample
	/** Arbitrary column count the 12-col system cannot express evenly. */
	private renderNineExample() {
		const theme = getTheme()
		const cells: ReactEcs.JSX.Element[] = []

		for (let n = 1; n <= LIMIT_9; n++) {
			cells.push(
				<GridCell key={`grid9-num-${n}`} number={n} />
			)
		}
		for (const name of TAIL_ICONS_9) {
			cells.push(
				<GridCell key={`grid9-${name}`} name={name} />
			)
		}

		return (
			<Column cols={12} spacing={6} alignItems="stretch">
				<H3 value={`limit={${LIMIT_9}} — any column count`} />
				<Text
					value    = {'Need 9 (or 5, or 7) columns? Set limit — no manual chunking or cols="auto" rows.'}
					fontSize = {theme.typography.size.small}
				/>
				<Grid limit={LIMIT_9} spacing={6}>
					{cells}
				</Grid>
			</Column>
		)
	}
}

export const demoGridsLayer = new DemoGridsLayer()
