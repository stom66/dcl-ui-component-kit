import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, Background, Column, Divider, getTheme, Grid, H2, H3, Icon, IconNumber, Layer, Row, Text, UiBox, ZoneType } from '../../../ui-component-kit'


/** FA icons for cells after the numbered first track. */
const DEMO_ICONS = [
	'skull', 'bomb', 'bell', 'eye', 'dragon', 'robot', 'compass', 'map',
	'locationDot', 'mapLocationDot', 'circleCheck', 'circleXmark',
	'lock', 'unlock', 'users', 'house', 'sun', 'moon', 'clock',
] as const

const CELL_SIZE = 48


// MARK: DemoGridsLayer
/**
 * Showcase for equal-cell `Grid`: horizontal (row-major) vs vertical (column-major).
 */
export class DemoGridsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-grids',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '52vw',
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
					<Text value="Equal-cell Grid with limit and direction. Horizontal fills rows left-to-right; vertical fills columns top-to-bottom. Numbers mark the first row or first column. Cells use aspectRatio={1} so they stay square inside the track." />

					<Divider margin={{ top: 4, bottom: 4 }} />

					<Row alignItems="flex-start" spacing={18}>
						<Column cols={5} alignItems="stretch">
							{this.renderVerticalExample()}
						</Column>
						<Column cols={7} alignItems="stretch">
							{this.renderHorizontalExample()}
						</Column>
					</Row>
				</Column>
			</Background>
		)
	}


	// MARK: renderVerticalExample
	/**
	 * Column-major grid: `limit={5}` rows per column, 12 entries.
	 * First column is numbered 1–5.
	 */
	private renderVerticalExample() {
		const theme = getTheme()
		const cell  = {
			aspectRatio : 1,
			height      : CELL_SIZE,
			alignSelf   : 'center' as const,
			borderRadius: theme.border.radiusSmall,
			borderWidth : theme.border.width,
			borderColor : alpha(theme.colors.light, 0.12),
			alignItems  : 'center' as const,
			justifyContent: 'center' as const,
		}
		const cells: ReactEcs.JSX.Element[] = []

		for (let n = 1; n <= 5; n++) {
			cells.push(
				<UiBox
					key   = {`vert-num-${n}`}
					backgroundColor = {alpha(theme.colors.primary, 0.5)}
					{...cell}
				>
					<IconNumber value={n} height={28} />
				</UiBox>
			)
		}
		for (let i = 0; i < 7; i++) {
			const name = DEMO_ICONS[i]
			cells.push(
				<UiBox
					key   = {`vert-${name}`}
					backgroundColor = {alpha(theme.colors.body, 0.45)}
					{...cell}
				>
					<Icon
						uvs    = {atlasIconsFontAwesome.uv[name]}
						width  = {28}
						height = {28}
					/>
				</UiBox>
			)
		}

		return (
			<Column cols={12} spacing={6} alignItems="stretch">
				<H3 value="Vertical — limit={5}" />
				<Text
					value    = {'direction="vertical", 12 cells. Numbers mark the first column.'}
					fontSize = {theme.typography.size.small}
				/>
				<Grid direction="vertical" limit={5} spacing={6}>
					{cells}
				</Grid>
			</Column>
		)
	}


	// MARK: renderHorizontalExample
	/**
	 * Row-major grid: `limit={7}` columns per row, 18 entries.
	 * First row is numbered 1–7.
	 */
	private renderHorizontalExample() {
		const theme = getTheme()
		const cell  = {
			aspectRatio : 1,
			height      : CELL_SIZE,
			alignSelf   : 'center' as const,
			borderRadius: theme.border.radiusSmall,
			borderWidth : theme.border.width,
			borderColor : alpha(theme.colors.light, 0.12),
			alignItems  : 'center' as const,
			justifyContent: 'center' as const,
		}
		const cells: ReactEcs.JSX.Element[] = []

		for (let n = 1; n <= 7; n++) {
			cells.push(
				<UiBox
					key   = {`horiz-num-${n}`}
					backgroundColor = {alpha(theme.colors.primary, 0.5)}
					{...cell}
				>
					<IconNumber value={n} height={28} />
				</UiBox>
			)
		}
		for (let i = 0; i < 11; i++) {
			const name = DEMO_ICONS[i]
			cells.push(
				<UiBox
					key   = {`horiz-${name}`}
					backgroundColor = {alpha(theme.colors.body, 0.45)}
					{...cell}
				>
					<Icon
						uvs    = {atlasIconsFontAwesome.uv[name]}
						width  = {28}
						height = {28}
					/>
				</UiBox>
			)
		}

		return (
			<Column cols={12} spacing={6} alignItems="stretch">
				<H3 value="Horizontal — limit={7}" />
				<Text
					value    = "Default direction, 18 cells. Numbers mark the first row."
					fontSize = {theme.typography.size.small}
				/>
				<Grid limit={7} spacing={6}>
					{cells}
				</Grid>
			</Column>
		)
	}
}

export const demoGridsLayer = new DemoGridsLayer()
