import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize, UiBackgroundProps, UiTransformProps } from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, Background, Column, Divider, getTheme, H2, H3, Icon, IconNumber, Layer, Row, Text, ZoneType } from '../../../ui-component-kit'


/** Extra icons after the numbered first line (wrap demo has 12 + these). */
const WRAP_TAIL_ICONS = [
	'skull', 'bomb', 'bell', 'eye', 'dragon', 'robot', 'compass', 'map',
] as const

/** Extra icons after the numbered first line (chunk demo has 9 + these). */
const CHUNK_PER_ROW = 9
const CHUNK_TAIL_ICONS = [
	'locationDot', 'mapLocationDot', 'circleCheck', 'circleXmark',
	'lock', 'unlock', 'users', 'house', 'sun', 'moon', 'clock',
] as const

type GridIconName = typeof WRAP_TAIL_ICONS[number] | typeof CHUNK_TAIL_ICONS[number]


// MARK: chunkArray
/** Splits `items` into arrays of at most `size` (last chunk may be shorter). */
function chunkArray<T>(items: readonly T[], size: number): T[][] {
	const chunks: T[][] = []
	for (let i = 0; i < items.length; i += size) {
		chunks.push(items.slice(i, i + size) as T[])
	}
	return chunks
}


// MARK: GridCell
/**
 * Icon / number cell for the grid demos.
 * Pass `number` for a digit glyph (first-row markers), `name` for an FA icon,
 * or neither for an invisible pad (chunked last row).
 */
function GridCell({
	name,
	number,
	cols,
	backgroundColor,
	uiTransform,
	uiBackground,
}: {
	key?             : string
	name?            : GridIconName
	number?          : number
	cols             : number | 'auto'
	backgroundColor? : Color4
	uiTransform?     : UiTransformProps
	uiBackground?    : UiBackgroundProps
}) {
	const theme = getTheme()
	const empty = name === undefined && number === undefined
	const fill  = empty
		? undefined
		: (backgroundColor ?? uiBackground?.color ?? alpha(theme.colors.body, 0.45))

	return (
		<Column
			cols            = {cols}
			spacing         = {0}
			borderWidth     = {empty ? 0 : theme.border.width}
			borderRadius    = {theme.border.radiusSmall}
			borderColor     = {alpha(theme.colors.light, 0.12)}
			backgroundColor = {fill}
			uiBackground    = {uiBackground}
			uiTransform={{
				alignItems    : 'center',
				justifyContent: 'center',
				padding       : { top: 8, right: 4, bottom: 8, left: 4 },
				minHeight     : 48,
				...uiTransform,
			}}
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
 * Showcase for icon / inventory-style grids:
 * 1. One Row + `flexWrap` + sticky `cols` (12-friendly spans)
 * 2. Chunked Rows + `cols="auto"` for arbitrary column counts (e.g. 9)
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
					cols        = {12}
					spacing     = {10}
					uiTransform = {{
						alignItems    : 'stretch',
						justifyContent: 'flex-start',
						padding       : { top: 16, right: 20, bottom: 16, left: 20 },
					}}
				>
					<H2 value="Grids" />
					<Text value={'Use cols + flexWrap for 12-grid inventories, or chunked Rows with cols="auto" when you need a count the 12-grid cannot express (e.g. 9). First cells are numbered so wrap / row breaks are obvious.'} />

					<Divider uiTransform={{ margin: { top: 4, bottom: 4 } }} />

					<Row uiTransform={{ alignItems: 'flex-start' }} spacing={18}>
						<Column cols={3} uiTransform={{ alignItems: 'stretch' }}>
							{this.renderThreeByThreeExample()}
						</Column>

						{/* auto fills leftover after cols={3} + spacing (3+9 sticky % would overflow by the gutter) */}
						<Column cols="auto" uiTransform={{ alignItems: 'stretch' }}>
							{this.renderWrapExample()}
						</Column>
					</Row>

					<Divider uiTransform={{ margin: { top: 4, bottom: 4 } }} />

					{this.renderChunkExample()}
				</Column>
			</Background>
		)
	}


	// MARK: renderThreeByThreeExample
	/**
	 * Compact 3×3 grid: nine cells, `cols={4}` + `flexWrap` (3 per line in the
	 * 12-col grid). Digits 1–9 so the wrap breaks are obvious.
	 */
	private renderThreeByThreeExample() {
		const theme = getTheme()
		const cells: ReactEcs.JSX.Element[] = []

		for (let n = 1; n <= 9; n++) {
			cells.push(
				<GridCell 
					key          = {`grid3-num-${n}`} 
					number       = {n} 
					cols         = {4} 
					uiBackground = {{ 
						color: alpha(theme.colors.primary, 0.5) 
					}} 
				/>
			)
		}

		return (
			<Column cols={12} spacing={6} uiTransform={{ alignItems: 'stretch' }}>
				<H3 value="3 × 3 — cols={4}" />
				<Text
					value = "Nine cells, cols={4} each (3 per wrapped line)."
					uiText={{ fontSize: scaleFontSize(theme.typography.size.small) }}
				/>
				<Row
					uiTransform = {{
						flexWrap      : 'wrap',
						alignItems    : 'flex-start',
						justifyContent: 'flex-start',
					}}
				>
					{cells}
				</Row>
			</Column>
		)
	}


	// MARK: renderWrapExample
	/**
	 * Single Row, `flexWrap: 'wrap'`, each cell `cols={1}` → 12 per line, then wrap.
	 * First 12 cells are digits 1–12. Row `spacing` uses padded wrap gutters.
	 */
	private renderWrapExample() {
		const theme = getTheme()
		const cells: ReactEcs.JSX.Element[] = []

		for (let n = 1; n <= 12; n++) {
			cells.push(
				<GridCell key={`wrap-num-${n}`} number={n} cols={1} />
			)
		}
		for (const name of WRAP_TAIL_ICONS) {
			cells.push(
				<GridCell key={`wrap-${name}`} name={name} cols={1} />
			)
		}

		return (
			<Column cols={12} spacing={6} uiTransform={{ alignItems: 'stretch' }}>
				<H3 value="12 × ? — cols={1}" />
				<Text
					value = {`Cells will wrap to a new line once they reach the end of the row. Row spacing (${theme.spacing}) applies wrap gutters (padded cell wrappers).`}
					uiText={{ fontSize: scaleFontSize(theme.typography.size.small) }}
				/>
				<Row
					uiTransform = {{
						flexWrap      : 'wrap',
						alignItems    : 'flex-start',
						justifyContent: 'flex-start',
					}}
				>
					{cells}
				</Row>
			</Column>
		)
	}


	// MARK: renderChunkExample
	/**
	 * Chunk items into Rows of N; each cell `cols="auto"`.
	 * First row is digits 1–9 so column count is obvious.
	 */
	private renderChunkExample() {
		const theme  = getTheme()
		const items: Array<{ key: string; number?: number; name?: GridIconName }> = []

		for (let n = 1; n <= CHUNK_PER_ROW; n++) {
			items.push({ key: `chunk-num-${n}`, number: n })
		}
		for (const name of CHUNK_TAIL_ICONS) {
			items.push({ key: `chunk-${name}`, name })
		}

		const chunks = chunkArray(items, CHUNK_PER_ROW)

		return (
			<Column cols={12} spacing={6} uiTransform={{ alignItems: 'stretch' }}>
				<H3 value={`Chunked rows — ${CHUNK_PER_ROW} × cols="auto"`} />
				<Text
					value = {'Need a count the 12-grid can\'t do evenly? Split your items into rows yourself and set each cell to cols="auto".'}
					uiText={{ fontSize: scaleFontSize(theme.typography.size.small) }}
				/>
				{chunks.map((chunk, rowIndex) => {
					const cells: ReactEcs.JSX.Element[] = chunk.map((item) => (
						<GridCell
							key    = {item.key}
							number = {item.number}
							name   = {item.name}
							cols   = "auto"
						/>
					))

					while (cells.length < CHUNK_PER_ROW) {
						const pad = cells.length
						cells.push(
							<GridCell key={`chunk-${rowIndex}-pad-${pad}`} cols="auto" />
						)
					}

					return (
						<Row
							key         = {`chunk-row-${rowIndex}`}
							uiTransform = {{
								alignItems    : 'stretch',
								justifyContent: 'flex-start',
							}}
						>
							{cells}
						</Row>
					)
				})}
			</Column>
		)
	}
}

export const demoGridsLayer = new DemoGridsLayer()
