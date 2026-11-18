import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, Background, Code, Column, Divider, getTheme, Grid, H2, H3, Icon, IconNumber, Layer, Row, Text, ZoneType } from '../../../ui-component-kit'


/** FA icons for cells after the numbered first track. */
const DEMO_ICONS = [
	'skull', 'bomb', 'bell', 'eye', 'dragon', 'robot', 'compass', 'map',
	'locationDot', 'mapLocationDot', 'circleCheck', 'circleXmark',
	'lock', 'unlock', 'users', 'house', 'sun', 'moon', 'clock',
] as const

/** Shared square so the vertical and horizontal examples use the same cell size. */
const CELL_SIZE  = 72
const GLYPH_SIZE = 48


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
				width : '44vw',
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
					<Text value="Equal-cell Grid with limit and direction. Horizontal fills rows left-to-right; vertical fills columns top-to-bottom. Numbers mark the first row or first column. Cells are fixed-size squares (plain UiEntity boxes)." />

					<Divider margin={{ top: 4, bottom: 4 }} />

					<Row alignItems="flex-start" spacing={18}>
						<Column cols={4} alignItems="stretch">
							{this.renderVerticalExample()}
						</Column>
						<Column cols={8} alignItems="stretch">
							{this.renderHorizontalExample()}
						</Column>
					</Row>
				</Column>
			</Background>
		)
	}


	// MARK: renderVerticalExample
	/**
	 * Column-major grid: `limit={3}` rows per column, 7 entries.
	 * First column is numbered 1–3.
	 */
	private renderVerticalExample() {
		const theme = getTheme()
		const cell  = {
			width         : CELL_SIZE,
			height        : CELL_SIZE,
			alignSelf     : 'center' as const,
			borderRadius  : theme.border.radiusSmall,
			borderWidth   : theme.border.width,
			borderColor   : alpha(theme.colors.light, 0.12),
			alignItems    : 'center' as const,
			justifyContent: 'center' as const,
		}
		const cells: ReactEcs.JSX.Element[] = []

		for (let n = 1; n <= 3; n++) {
			cells.push(
				<UiEntity
					key          = {`vert-num-${n}`}
					uiTransform  = {cell}
					uiBackground = {{ color: alpha(theme.colors.primary, 0.5) }}
				>
					<IconNumber value={n} height={GLYPH_SIZE} />
				</UiEntity>
			)
		}
		for (let i = 0; i < 4; i++) {
			const name = DEMO_ICONS[i]
			cells.push(
				<UiEntity
					key          = {`vert-${name}`}
					uiTransform  = {cell}
					uiBackground = {{ color: alpha(theme.colors.body, 0.45) }}
				>
					<Icon
						src    = {atlasIconsFontAwesome.source}
						uvs    = {atlasIconsFontAwesome.uv[name]}
						width  = {GLYPH_SIZE}
						height = {GLYPH_SIZE}
					/>
				</UiEntity>
			)
		}

		return (
			<Column cols={12} spacing={6} alignItems="stretch">
				<H3 key="title" value="Vertical" />
				<Code key="limit" value="limit={3}" />
				<Grid key="grid" direction="vertical" limit={3} spacing={6}>
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
			width         : CELL_SIZE,
			height        : CELL_SIZE,
			alignSelf     : 'center' as const,
			borderRadius  : theme.border.radiusSmall,
			borderWidth   : theme.border.width,
			borderColor   : alpha(theme.colors.light, 0.12),
			alignItems    : 'center' as const,
			justifyContent: 'center' as const,
		}
		const cells: ReactEcs.JSX.Element[] = []

		for (let n = 1; n <= 7; n++) {
			cells.push(
				<UiEntity
					key          = {`horiz-num-${n}`}
					uiTransform  = {cell}
					uiBackground = {{ color: alpha(theme.colors.primary, 0.5) }}
				>
					<IconNumber value={n} height={GLYPH_SIZE} />
				</UiEntity>
			)
		}
		for (let i = 0; i < 11; i++) {
			const name = DEMO_ICONS[i]
			cells.push(
				<UiEntity
					key          = {`horiz-${name}`}
					uiTransform  = {cell}
					uiBackground = {{ color: alpha(theme.colors.body, 0.45) }}
				>
					<Icon
						src    = {atlasIconsFontAwesome.source}
						uvs    = {atlasIconsFontAwesome.uv[name]}
						width  = {GLYPH_SIZE}
						height = {GLYPH_SIZE}
					/>
				</UiEntity>
			)
		}

		return (
			<Column cols={12} spacing={6} alignItems="stretch">
				<H3 key="title" value="Horizontal" />
				<Code key="limit" value="limit={7}" />
				<Grid key="grid" limit={7} spacing={6}>
					{cells}
				</Grid>
			</Column>
		)
	}
}

export const demoGridsLayer = new DemoGridsLayer()
