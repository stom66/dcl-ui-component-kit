import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { Background, ColorPicker, Column, Divider, getColorPickerHex, getTheme, H2, hexToRgb, Label, Layer, PropsController, Row, setColorPickerColor, Text, ZoneType } from '../../../../ui-component-kit'


const PICKER_ID     = 'demo_color_picker'
const DEFAULT_COLOR = '#3BA4FF'
const PRESETS       = ['#FF4D4D', '#FF9F1C', '#FFE14D', '#4DFF88', '#3BA4FF', '#9B5CFF', '#FF5CC8', '#FFFFFF', '#808080', '#000000']
const SWATCH_SIZE   = 108
const PRESET_SIZE   = 24
const PRESET_GAP    = 4
const PRESET_ROWS   = 4


// MARK: readableTextColor
/** Black or white, whichever reads better on `color` (relative luminance). */
function readableTextColor(color: Color4): Color4 {
	const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
	return luminance > 0.55 ? Color4.Black() : Color4.White()
}


// MARK: DemoColorPickerLayer
/**
 * Demo panel for `ColorPicker`. The swatch and preset grid on the right are NOT part
 * of the component — they are ordinary elements wired to the picker:
 *
 * - the swatch fill reads `selectedColor`, which the picker's `onChange` callback
 *   writes into this layer's own props;
 * - the hex text inside it reads the picker's controller directly with
 *   `getColorPickerHex(id)`, the way any other layer / system could;
 * - the preset buttons write back with `setColorPickerColor(id, hex, true)`, which
 *   moves the wheel and fires `onChange` like a click would.
 */
export class DemoColorPickerLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-color-picker',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '40vw',
				height: '27vw',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			selectedColor: Color4.fromHexString(DEFAULT_COLOR),
		})
	}


	// MARK: body
	protected body() {
		if (!this.props) {
			console.error('DemoColorPickerLayer.body: props controller missing')
			return null
		}

		const theme         = getTheme()
		const selectedColor = this.props.get('selectedColor') as Color4
		const hex           = getColorPickerHex(PICKER_ID) ?? DEFAULT_COLOR

		return [
			<Background key="chrome" />,
			<Column
				key            = "body"
				cols           = {12}
				height         = "100%"
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 16, right: 20, bottom: 16, left: 20 }}
			>
				<H2 value="Color Picker" />
				<Text value="Click the wheel for hue and saturation, the bar for brightness. Drag to fine-tune (desktop)." />

				<Divider margin={{ top: 8, bottom: 12 }} />

				<Row alignItems="flex-start" justifyContent="flex-start">
					<Column cols={7} alignItems="center" justifyContent="flex-start">
						<ColorPicker
							id           = {PICKER_ID}
							defaultColor = {DEFAULT_COLOR}
							size         = {260}
							onChange     = {(color) => {
								this.props?.set('selectedColor', color)
							}}
						/>
					</Column>

					<Column cols={5} alignItems="flex-start" justifyContent="flex-start">
						<Row alignItems="flex-start" justifyContent="flex-start">
							{/* Swatch — fill from the onChange callback, hex read from the controller. */}
							<UiEntity
								uiTransform = {{
									width         : SWATCH_SIZE,
									height        : SWATCH_SIZE,
									flexGrow      : 0,
									flexShrink    : 0,
									borderRadius  : 8,
									borderWidth   : 2,
									borderColor   : theme.colors.light,
									alignItems    : 'center',
									justifyContent: 'center',
									margin        : { right: 12 },
								}}
								uiBackground = {{ color: selectedColor }}
							>
								<Label
									value           = {hex}
									width           = {SWATCH_SIZE - 8}
									height          = {SWATCH_SIZE - 8}
									backgroundColor = {Color4.Clear()}
									fontColor       = {readableTextColor(selectedColor)}
									textAlign       = "middle-center"
								/>
							</UiEntity>

							{/* Preset grid — fills top-to-bottom, then the next column. */}
							<UiEntity
								uiTransform = {{
									flexDirection: 'column',
									flexWrap     : 'wrap',
									alignContent : 'flex-start',
									// +1 so float rounding never wraps the last row early.
									height       : PRESET_ROWS * (PRESET_SIZE + PRESET_GAP) + 1,
									flexGrow     : 0,
									flexShrink   : 0,
								}}
							>
								{PRESETS.map((preset, i) => {
									const rgb      = hexToRgb(preset)
									const fill     = rgb ? Color4.create(rgb.r, rgb.g, rgb.b, 1) : Color4.White()
									const selected = preset.toUpperCase() === hex.toUpperCase()
									const pick     = () => setColorPickerColor(PICKER_ID, preset, true)
									return (
										<UiEntity
											key         = {`demo_color_preset_${i}`}
											uiTransform = {{
												width        : PRESET_SIZE,
												height       : PRESET_SIZE,
												flexGrow     : 0,
												flexShrink   : 0,
												margin       : { right: PRESET_GAP, bottom: PRESET_GAP },
												borderRadius : 4,
												borderWidth  : selected ? 2 : 1,
												borderColor  : selected ? theme.colors.light : theme.colors.dark,
												pointerFilter: 'block',
											}}
											uiBackground = {{ color: fill }}
											onMouseDown  = {() => { if (isMobile()) pick() }}
											onMouseUp    = {() => { if (!isMobile()) pick() }}
										/>
									)
								})}
							</UiEntity>
						</Row>
					</Column>
				</Row>
			</Column>,
		]
	}
}

export const demoColorPickerLayer = new DemoColorPickerLayer()
