import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'
import { Background, Code, Column, Divider, FontAwesome, getTheme, H1, H2, H3, H4, H5, H6, Label, Layer, Row, scaleThemeFontSize, SectionHeader, Text, ZoneType } from '../../../ui-component-kit'


const FONT_BANGERS      = 'assets/fonts/examples/Bangers/Bangers-Regular.ttf'
const FONT_LUCKIEST_GUY = 'assets/fonts/examples/Luckiest_Guy/LuckiestGuy-Regular.ttf'
const FONT_MONTSERRAT   = 'assets/fonts/examples/Montserrat/Montserrat-Regular.ttf'
const FONT_DENK_ONE     = 'assets/fonts/examples/Denk_One/DenkOne-Regular.ttf'

const LOREM       = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const LOREM_SHORT = 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
const LOREM_FACE  = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'


// MARK: FontSample
/**
 * One custom-font specimen. The face name and a short line both use `fontSrc`,
 * with the built-in sans-serif face as the SDK fallback.
 *
 * Call it as a function so the returned `Column` is a direct `Row` child and
 * `cols` is visible to the grid.
 */
function FontSample({
	sampleKey,
	name,
	fontSrc,
	nameSize,
	bodySize,
}: {
	sampleKey : string
	name      : string
	fontSrc   : string
	nameSize  : number
	bodySize  : number
}) {
	return (
		<Column
			key            = {sampleKey}
			cols           = {3}
			alignItems     = "flex-start"
			justifyContent = "flex-start"
			spacing        = {4}
		>
			<Text
				key      = "name"
				value    = {name}
				font     = "sans-serif"
				fontSrc  = {fontSrc}
				fontSize = {nameSize}
			/>
			<Text
				key      = "sample"
				value    = {LOREM_FACE}
				font     = "sans-serif"
				fontSrc  = {fontSrc}
				fontSize = {bodySize}
			/>
		</Column>
	)
}


// MARK: StatusLabel
/**
 * Colour chip with a Font Awesome status glyph beside the caption.
 * Called as a function so the `Label` is a direct `Row` child.
 */
function StatusLabel({
	labelKey,
	value,
	icon,
	backgroundColor,
	fontSize,
}: {
	labelKey        : string
	value           : string
	icon            : string
	backgroundColor : Color4
	fontSize        : number
}) {
	return (
		<Label
			key             = {labelKey}
			backgroundColor = {backgroundColor}
			uiTransform     = {{ justifyContent: 'flex-start' }}
		>
			<FontAwesome
				key       = "icon"
				icon      = {icon}
				fontSize  = {scaleThemeFontSize(fontSize)}
				fontColor = {getTheme().colors.light}
			/>
			<Text
				key      = "caption"
				value    = {value}
				fontSize = {fontSize}
				textWrap = "nowrap"
				width    = "auto"
				margin   = {{ left: 4 }}
			/>
		</Label>
	)
}


// MARK: DemoTextLayer
/** Demo panel for headers, body text, labels, one code sample, and custom fonts. */
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
						spacing        = {Math.round(theme.spacing * 2 / 3)}
						alignItems     = "flex-start"
						justifyContent = "flex-start"
						padding        = {{ top: 16, right: 16, bottom: 16, left: 16 }}
					>
						<H1 key="h1" value="Header 1" />
						<H2 key="h2" value="Header 2" />
						<H3 key="h3" value="Header 3" />
						<H4 key="h4" value="Header 4" />
						<H5 key="h5" value="Header 5" />
						<H6 key="h6" value="Header 6" />
					</Column>
					<Column
						key            = "copy"
						cols           = {8}
						alignItems     = "flex-start"
						justifyContent = "flex-start"
						padding        = {{ top: 16, right: 16, bottom: 16, left: 16 }}
					>
						<SectionHeader key="section" value="Lorem ipsum" />
						<Text key="body" value={LOREM} />
						<Text
							key      = "body-small"
							value    = {LOREM_SHORT}
							fontSize = {theme.typography.size.small}
						/>
						<Code key="code" value="const sample = 'Lorem ipsum dolor sit amet'" />

						<Row key="labels" justifyContent="flex-start" alignItems="center" margin={{ top: 8 }}>
							<Label
								key   = "labels"
								value = "Labels!"
							/>
							{StatusLabel({
								labelKey       : 'success',
								value          : 'Success',
								icon           : 'circle-check',
								backgroundColor: theme.colors.success,
								fontSize       : theme.typography.size.default,
							})}
							{StatusLabel({
								labelKey       : 'info',
								value          : 'Info',
								icon           : 'circle-info',
								backgroundColor: theme.colors.info,
								fontSize       : theme.typography.size.default,
							})}
							{StatusLabel({
								labelKey       : 'warning',
								value          : 'Warning',
								icon           : 'triangle-exclamation',
								backgroundColor: theme.colors.warning,
								fontSize       : theme.typography.size.default,
							})}
							{StatusLabel({
								labelKey       : 'danger',
								value          : 'Danger',
								icon           : 'circle-exclamation',
								backgroundColor: theme.colors.danger,
								fontSize       : theme.typography.size.default,
							})}
						</Row>
					</Column>
				</Row>
				<Divider key="fonts-rule" />
				<Column
					key     = "fonts"
					cols    = {12}
					padding = {{ top: 4, right: 16, bottom: 16, left: 16 }}
					spacing = {8}
				>
					<SectionHeader
						key      = "fonts-label"
						value    = "Custom fonts"
					/>
					<Row key="faces" alignItems="flex-start">
						{FontSample({
							sampleKey: 'bangers',
							name     : 'Bangers',
							fontSrc  : FONT_BANGERS,
							nameSize : theme.typography.size.h3,
							bodySize : theme.typography.size.default,
						})}
						{FontSample({
							sampleKey: 'luckiest-guy',
							name     : 'Luckiest Guy',
							fontSrc  : FONT_LUCKIEST_GUY,
							nameSize : theme.typography.size.h3,
							bodySize : theme.typography.size.default,
						})}
						{FontSample({
							sampleKey: 'montserrat',
							name     : 'Montserrat',
							fontSrc  : FONT_MONTSERRAT,
							nameSize : theme.typography.size.h3,
							bodySize : theme.typography.size.default,
						})}
						{FontSample({
							sampleKey: 'denk-one',
							name     : 'Denk One',
							fontSrc  : FONT_DENK_ONE,
							nameSize : theme.typography.size.h3,
							bodySize : theme.typography.size.default,
						})}
					</Row>
				</Column>
			</Column>,
		]
	}
}

export const demoTextLayer = new DemoTextLayer()
