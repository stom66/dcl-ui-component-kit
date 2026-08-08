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

		return [
			<Background key="chrome" />,
			<Row>
				<Column
					key            = "body"
					cols           = {4}
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
				</Column>
				<Column
					key            = "body"
					cols           = {8}
					height         = "100%"
					alignItems     = "flex-start"
					justifyContent = "flex-start"
					padding        = {{ top: 16, right: 16, bottom: 16, left: 16 }}
				>
						<SectionHeader value="Section header" />
						<Text value="Body text via the Text component. Use this for longer copy. By default it will fill 100% width, and automatically wrap long content" />
						<Code value="const tip = '<Code> uses the monospace theme font.</Code>'" />

						<Divider />

						<Row justifyContent="flex-start" alignItems="center" margin={{ top: 8 }}>
							<Text value="Labels:" width="auto" />
							<Label
								value  = "Sample label"
							/>
							<Label
								value  = "Success"
								color  = {theme.colors.success}
							/>
							<Label
								value = "Info"
								color = {theme.colors.info}
							/>
							<Label
								value = "Warning"
								color = {theme.colors.warning}
							/>
							<Label
								value = "Danger"
								color = {theme.colors.danger}
							/>
						</Row>

						<Divider />

						<Row justifyContent="flex-start" alignItems="center" margin={{ top: 8 }}>
							<Text
								value  = "Icons, and custom font support via texture atlases (see Icons):"
								margin = {{ right: 8 }}
								width = "auto"
							/>
						</Row>

						<Row justifyContent="flex-start" alignItems="center" margin={{ top: 8 }}>
							
							<Icon
								uvs    = {atlasIconsFontAwesome.uv.gift}
								width  = "48"
								height = "48"
							/>
							<IconNumber value="+1" margin={{right: 64}} />
							
							
							<IconNumber value="1*0+120/2=60" margin={{right: 64}} />
							
							
							<IconNumber value="12:30" margin={{right: 16}} />
						</Row>
				</Column>
			</Row>
		]
	}
}

export const demoTextLayer = new DemoTextLayer()
