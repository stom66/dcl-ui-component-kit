import ReactEcs from '@dcl/sdk/react-ecs'
import { atlasIconsFontAwesome, Background, Code, Column, Divider, getTheme, H1, H2, H3, H4, H5, H6, Icon, IconNumber, IconString, Label, Layer, Row, SectionHeader, Text, ZoneType } from '../../../ui-component-kit'


/** Bundled glyph specimen, atlas order. Each alphabet is two lines; symbols are two lines. */
const GLYPH_LOWER_A   = 'abcdefghijklm'
const GLYPH_LOWER_B   = 'nopqrstuvwxyz'
const GLYPH_UPPER_A   = 'ABCDEFGHIJKLM'
const GLYPH_UPPER_B   = 'NOPQRSTUVWXYZ'
const GLYPH_DIGITS    = '0123456789'
const GLYPH_SYMBOLS_A = '.\'";()!?&%@#÷=$_×:'
const GLYPH_SYMBOLS_B = ',/+-£€¥~^*\\|<>[]{}'

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
			uiTransform    : {
				height: 'auto',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return [
			<Background key="chrome" />,
			<Column
				key            = "panel"
				cols           = {12}
				alignItems     = "flex-start"
				justifyContent = "flex-start"
			>
			<Row key="main">
				<Column
					key            = "headers"
					cols           = {4}
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
					key            = "copy"
					cols           = {8}
					alignItems     = "flex-start"
					justifyContent = "flex-start"
					padding        = {{ top: 16, right: 16, bottom: 16, left: 16 }}
				>
						<SectionHeader value="Section header" />
						<Text value="Body text via the Text component. Use this for longer copy. By default it will fill 100% width, and automatically wrap long content" />
						<Text
							value    = "Prefer theme.typography.size.* (small / default / code / h1–h6). Kit Text auto-scales those base px values."
							fontSize = {theme.typography.size.small}
						/>
						<Code value="const tip = '<Code> uses the monospace theme font.</Code>'" />
						<Code value={"// Ad-hoc size: pass theme-base px on fontSize — UiBox scales it. Raw UiEntity: scaleThemeFontSize(theme.typography.size.default)"} />

						<Divider />

						<Row justifyContent="flex-start" alignItems="center" margin={{ top: 8 }}>
							<Text value="Labels:" width="auto" />
							<Label
								value  = "Sample label"
							/>
							<Label
								value  = "Success"
								backgroundColor  = {theme.colors.success}
							/>
							<Label
								value = "Info"
								backgroundColor = {theme.colors.info}
							/>
							<Label
								value = "Warning"
								backgroundColor = {theme.colors.warning}
							/>
							<Label
								value = "Danger"
								backgroundColor = {theme.colors.danger}
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
			<Divider key="glyphs-rule" />
			<Row
				key        = "glyphs"
				alignItems = "flex-start"
				padding    = {{ top: 4, right: 16, bottom: 16, left: 16 }}
			>
				<Column
					key            = "symbols"
					cols           = {6}
					alignItems     = "flex-start"
					justifyContent = "flex-start"
					spacing        = {4}
				>
					<Text
						key      = "symbols-label"
						value    = "Symbols"
						fontSize = {theme.typography.size.small}
					/>
					<IconString key="symbols-a" value={GLYPH_SYMBOLS_A} height={36} />
					<IconString key="symbols-b" value={GLYPH_SYMBOLS_B} height={36} />
				</Column>
				<Column
					key            = "alphanumeric"
					cols           = {6}
					alignItems     = "flex-start"
					justifyContent = "flex-start"
					spacing        = {4}
				>
					<Text
						key      = "alphanumeric-label"
						value    = "Alphanumeric"
						fontSize = {theme.typography.size.small}
					/>
					<IconString key="lower-a" value={GLYPH_LOWER_A} height={36} />
					<IconString key="lower-b" value={GLYPH_LOWER_B} height={36} />
					<IconString key="upper-a" value={GLYPH_UPPER_A} height={36} />
					<IconString key="upper-b" value={GLYPH_UPPER_B} height={36} />
					<IconString key="digits" value={GLYPH_DIGITS} height={36} />
				</Column>
			</Row>
			</Column>
		]
	}
}

export const demoTextLayer = new DemoTextLayer()
