import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasIcons } from '../../atlases'
import { AvatarIcon, Background, Code, Column, DEFAULT_AVATAR_USER_ID, Divider, H2, Icon, Label, Row, Text } from '../../components'
import { Layer } from '../../components/layers'
import { ZoneType } from '../../components/zones/zone.presets'
import { getTheme } from '../../styles'
import { alpha } from '../../utils'


const NAMED_ICONS = [
	'prohibited', 'target', 'play', 'cat',
	'starburst', 'check', 'coins', 'phone',
	'crown', 'crosshair', 'dice', 'ghost',
	'gift', 'heart', 'stopwatch', 'trash',
] as const


// MARK: DemoIconsLayer
/** Demo panel for named atlas icons (`atlasIcons`). */
export class DemoIconsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-icons',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : false,
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
					<Text value="Named cells from atlasIcons — use atlas.uv.<name> with Icon. AvatarIcon uses uiBackground.avatarTexture." />

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
							iconSrc     = {atlasIcons.source}
							uvs         = {atlasIcons.uv.cat}
							width       = "64"
							height      = "64"
							uiTransform = {{ margin: { right: 12 } }}
						/>
						<Code value = "uvs={atlasIcons.uv.cat}" />
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
						<Code value = {'userId="0xcec7…"'} />
					</Row>


					<Label
						cols        = {12}
						value       = "Full atlas (atlasIcons.named)"
						uiTransform = {{ margin: { bottom: 8 } }}
					/>
					{this.renderIconGrid()}
				</Column>
			</Background>
		)
	}


	// MARK: renderIconGrid
	/** Renders the 4×4 named atlas as labelled rows. */
	private renderIconGrid() {
		const theme = getTheme()
		const rows: ReactEcs.JSX.Element[] = []

		for (let row = 0; row < 4; row++) {
			const cells: ReactEcs.JSX.Element[] = []

			for (let col = 0; col < 6; col++) {
				const name = NAMED_ICONS[row * 4 + col]
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
							iconSrc     = {atlasIcons.source}
							uvs         = {atlasIcons.uv[name]}
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
