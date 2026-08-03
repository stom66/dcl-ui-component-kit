import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasIconsFontAwesome } from '../../atlases'
import { AvatarIcon, Background, Code, Column, DEFAULT_AVATAR_USER_ID, H2, Icon, Label, Row, Text } from '../../components'
import { Layer } from '../../components/layers'
import { ZoneType } from '../../components/zones/zone.presets'
import { getTheme } from '../../styles'
import { alpha } from '../../utils'


/** Curated sample from `atlasIconsFontAwesome` (full sheet is 16×16 / 256 cells). */
const SAMPLE_ICONS = [
	'cat', 'check', 'coins', 'crown', 'dice', 'gift', 'ghost', 'heart',
	'play', 'phone', 'star', 'bolt', 'rocket', 'shield', 'trophy', 'ban',
	'crosshairs', 'stopwatch', 'trash', 'user', 'gear', 'bell', 'map', 'fire',
] as const

const GRID_COLS = 6


// MARK: DemoIconsLayer
/** Demo panel for named Font Awesome atlas icons (`atlasIconsFontAwesome`). */
export class DemoIconsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-icons',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '42vw',
				height: '90vh',
			},
		})
	}


	// MARK: body
	protected body() {
		return (
			<Background>
				<Column
					cols={12}
					uiTransform={{
						height        : '100%',
						alignItems    : 'stretch',
						justifyContent: 'flex-start',
						padding       : { top: 16, right: 20, bottom: 16, left: 20 },
					}}
				>
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
						<Code value = "uvs={atlasIconsFontAwesome.uv.cat}" />
					</Row>

					<Label
						cols        = {12}
						value       = "AvatarIcon (player portrait)"
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
						<AvatarIcon
							userId      = {DEFAULT_AVATAR_USER_ID}
							width       = {64}
							height      = {64}
							uiTransform = {{ margin: { right: 12 } }}
						/>
						<Code value = {'<AvatarIcon userId="0xcec7…" />'} />
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
						borderColor  = {alpha(theme.colors.light, 0.5)}
						uiTransform  = {{
							alignItems    : 'center',
							justifyContent: 'center',
							padding       : 8,
							margin        : { bottom: 8 },
						}}
					>
						<Icon
							uvs         = {atlasIconsFontAwesome.uv[name]}
							width       = "40"
							height      = "40"
							uiTransform = {{ margin: { bottom: 4 } }}
						/>
						<Text
							value  = {name}
							uiText = {{ textAlign: 'middle-center', fontSize: theme.typography.size.small }}
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
