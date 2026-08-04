import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, AvatarIcon, Background, Code, Column, DEFAULT_AVATAR_USER_ID, getTheme, H2, Icon, Label, Layer, Row, Text, ZoneType } from '../../../ui-component-kit'
import { vhToPixels, vwToPixels } from '../../../ui-component-kit/utils'

/** Curated sample from `atlasIconsFontAwesome` (full sheet is 16×16 / 256 cells). */
const SAMPLE_ICONS = [
	'cat', 'check', 'coins', 'crown', 'dice', 'gift',
	'ghost', 'heart', 'play', 'flagCheckered', 'star', 'meteor', 'bolt',
	'rocket', 'shield', 'trophy', 'caretLeft', 'ban', 'crosshairs', 'stopwatch', 'fireFlameCurved', 'caretRight'
] as const

const GRID_COLS = 8


// MARK: DemoIconsLayer
/** Demo panel for named Font Awesome atlas icons (`atlasIconsFontAwesome`). */
export class DemoIconsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-icons',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : false,
			showCloseButton: true,
			uiTransform    : {
				width : vwToPixels(50),
				height: vhToPixels(80),
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return (
			<Background>
				<Column
					cols={12}
					spacing={6}
					uiTransform={{
						height        : '100%',
						alignItems    : 'flex-start',
						justifyContent: 'flex-start',
						padding       : { top: 12, right: 20, bottom: 12, left: 20 },
					}}
				>
					{/* MARK: Title 
					*/}
					<H2 value="Icons" />
					<Text value="Named cells from atlasIconsFontAwesome — use atlas.uv.<name> with Icon (src defaults to this atlas). AvatarIcon uses uiBackground.avatarTexture." />

					<Label
						cols        = {12}
						value       = "Named shortcut (cat)"
						uiTransform = {{ margin: { bottom: 8 } }}
					/>
					<Row
						cols = {12}
						uiTransform={{
							justifyContent: 'flex-start',
							alignItems    : 'center',
							margin        : { bottom: 8 },
						}}
					>
						<Icon
							uvs         = {atlasIconsFontAwesome.uv.cat}
							width       = "64"
							height      = "64"
							uiTransform = {{ margin: { right: 12 } }}
						/>
						<Code value = "<Icon uvs={atlasIconsFontAwesome.uv.cat} />" />
					</Row>

					{/* MARK: Colors 
					*/}
					<Row
						cols={12}
						uiTransform={{
							justifyContent: 'flex-start',
							alignItems    : 'flex-start',
							margin        : { bottom: 8 },
						}}
					>
						<Column
							cols={6}
							uiTransform={{
								alignItems    : 'flex-start',
								justifyContent: 'flex-start',
								padding       : { right: 8 },
							}}
						>
							<Label
								cols        = {12}
								value       = "color tint (texture × color)"
								uiTransform = {{ margin: { bottom: 8 } }}
							/>
							<Row
								cols={12}
								uiTransform={{
									justifyContent: 'flex-start',
									alignItems    : 'center',
									margin        : { bottom: 6 },
								}}
							>
								<Icon
									uvs         = {atlasIconsFontAwesome.uv.star}
									width       = "64"
									height      = "64"
									color       = {theme.colors.primary}
									uiTransform = {{ margin: { right: 8 } }}
								/>
								<Icon
									uvs         = {atlasIconsFontAwesome.uv.star}
									width       = "64"
									height      = "64"
									color       = {theme.colors.danger}
									uiTransform = {{ margin: { right: 8 } }}
								/>
								<Icon
									uvs    = {atlasIconsFontAwesome.uv.star}
									width  = "64"
									height = "64"
									color  = {theme.colors.success}
								/>
							</Row>
							<Code
								value  = "<Icon color={…} />"
								uiText = {{
									fontSize: scaleFontSize(theme.typography.size.code+3, -0.1),
									textWrap: 'nowrap',
								}}
							/>
						</Column>

					{/* MARK: Avatar 
					*/}
						<Column
							cols={6}
							uiTransform={{
								alignItems    : 'flex-start',
								justifyContent: 'flex-start',
								padding       : { left: 8 },
							}}
						>
							<Label
								cols        = {12}
								value       = "AvatarIcon (player portrait)"
								uiTransform = {{ margin: { bottom: 8 } }}
							/>
							<Row
								cols={12}
								uiTransform={{
									justifyContent: 'flex-start',
									alignItems    : 'center',
									margin        : { bottom: 6 },
								}}
							>
								<AvatarIcon
									userId = {DEFAULT_AVATAR_USER_ID}
									width  = {64}
									height = {64}
								/>
								<AvatarIcon
									userId       = {DEFAULT_AVATAR_USER_ID}
									width        = {64}
									height       = {64}
									borderRadius = {32}
									borderWidth  = {3}
									borderColor  = {alpha(theme.colors.light, 0.8)}
								/>
								<AvatarIcon
									userId       = {DEFAULT_AVATAR_USER_ID}
									width        = {64}
									height       = {64}
									borderRadius = {theme.border.radiusDefault}
									borderWidth  = {3}
									borderColor  = {alpha(theme.colors.info, 0.8)}
								/>
								<AvatarIcon
									userId       = {DEFAULT_AVATAR_USER_ID}
									width        = {64}
									height       = {64}
									borderRadius = {theme.border.radiusDefault}
									borderWidth  = {3}
									borderColor  = {alpha(theme.colors.light, 0.8)}
									backgroundColor={theme.colors.danger}
								/>
							</Row>
							<Code
								value  = {'<AvatarIcon userId="…" />'}
								uiText = {{
									fontSize: scaleFontSize(theme.typography.size.code+2, -0.1),
									textWrap: 'nowrap',
								}}
							/>
						</Column>
					</Row>


					<Label
						cols        = {12}
						value       = "Sample icons (atlasIconsFontAwesome)"
						uiTransform = {{ margin: { bottom: 8 } }}
					/>
					{this.renderIconGrid()}
				</Column>
			</Background>
		)
	}


	// MARK: renderIconGrid
	/** Renders a curated sample of named Font Awesome icons. */
	private renderIconGrid() {
		const theme = getTheme()
		const rows: ReactEcs.JSX.Element[] = []
		const rowCount = Math.ceil(SAMPLE_ICONS.length / GRID_COLS)

		for (let row = 0; row < rowCount; row++) {
			const cells: ReactEcs.JSX.Element[] = []

			for (let col = 0; col < GRID_COLS; col++) {
				const name = SAMPLE_ICONS[row * GRID_COLS + col]
				if (!name) break

				cells.push(
					<Column
						key          = {`icon-cell-${name}`}
						cols         = {2}
						borderWidth  = {theme.border.width}
						borderRadius = {theme.border.radiusDefault}
						borderColor  = {alpha(theme.colors.light, 0.1)}
						spacing      = {0}
						uiTransform  = {{
							alignItems    : 'center',
							justifyContent: 'center',
							padding       : { top: 8, left: 2, right: 2, bottom: 8 },
							margin        : { bottom: 8 },
						}}
					>
						<Icon
							uvs         = {atlasIconsFontAwesome.uv[name]}
							width       = "40"
							height      = "40"
							uiTransform = {{ margin: { bottom: 0 } }}
						/>
						<Text
							value           = {name}
							uiText          = {{ textAlign     : 'middle-center', fontSize: scaleFontSize(theme.typography.size.default, -0.1) }}
							uiTransform     = {{ justifyContent: 'center', padding: 0 }}
						/>
					</Column>
				)
			}

			rows.push(
				<Row
					key         = {`icon-row-${row}`}
					cols        = {12}
					uiTransform = {{
						justifyContent: 'flex-start',
						alignItems    : 'flex-start',
					}}
				>
					{cells}
				</Row>
			)
		}

		return rows
	}
}

export const demoIconsLayer = new DemoIconsLayer()
