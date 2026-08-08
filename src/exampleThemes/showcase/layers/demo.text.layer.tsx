import ReactEcs from '@dcl/sdk/react-ecs'
import { atlasIconsFontAwesome, Background, Code, Column, Divider, getTheme, H1, H2, H3, H4, H5, H6, Icon, IconNumber, Label, Layer, Row, SectionHeader, Text, ZoneType } from '../../../ui-component-kit'

// MARK: DemoTextLayer
/** Demo panel for headers, body text, labels, code, and icons. */
export class DemoTextLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-text',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return (
			<Background>
				<Column
					cols           = {12}
					height         = "100%"
					alignItems     = "flex-start"
					justifyContent = "flex-start"
					padding        = {{ top: 16, right: 16, bottom: 16, left: 16 }}
				>
					<H1 value="Header 1" />
					<H2 value="Header 2" />
					<H3 value="Header 3" />
					<H4 value="Header 4" />
					<H5 value="Header 5" />
					<H6 value="Header 6" />

					<Divider />

					<SectionHeader value="Section header" />
					<Text value="Body text via the Text component. Use this for longer copy." />
					<Code value="const tip = 'Code uses the monospace theme font.'" />

					<Divider />

					<Row justifyContent="flex-start" alignItems="center" margin={{ top: 8 }}>
						<Label
							value  = "Sample label"
							margin = {{ right: 8 }}
						/>
						<Label
							value  = "Success"
							color  = {theme.colors.success}
							margin = {{ right: 8 }}
						/>
						<Label
							value = "Warning"
							color = {theme.colors.warning}
						/>
					</Row>

					<Row justifyContent="flex-start" alignItems="center" margin={{ top: 16 }}>
						<Icon
							uvs    = {atlasIconsFontAwesome.uv.gift}
							width  = "48"
							height = "48"
							margin = {{ right: 12 }}
						/>
						<Text
							value  = "Icon + atlas number font (see Icons demo for more):"
							margin = {{ right: 8 }}
						/>
						<IconNumber value="+120/2=60" />
					</Row>
				</Column>
			</Background>
		)
	}
}

export const demoTextLayer = new DemoTextLayer()
