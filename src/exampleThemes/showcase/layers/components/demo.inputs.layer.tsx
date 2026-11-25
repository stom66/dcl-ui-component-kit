import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, Checkbox, Column, Divider, getTheme, H2, H3, Layer, NumberInput, PropsController, RangeSlider, Row, SegmentedControl, SegmentedControlOption, Text, Toggle, ZoneType } from '../../../../ui-component-kit'

import { FaIcon, type FaIconName } from '../layouts/demo.layouts.shared'


const ROW_HEIGHT = 44

const TOGGLES = [
	{ key: 'toggleBackground', label: 'Track'   },
	{ key: 'toggleThumb',      label: 'Thumb'   },
	{ key: 'toggleBoth',       label: 'Both'    },
] as const

const TIME_OF_DAY: { value: string, icon: FaIconName }[] = [
	{ value: 'day',   icon: 'sun'  },
	{ value: 'night', icon: 'moon' },
	{ value: 'star',  icon: 'star' },
]


// MARK: DemoInputsLayer
/** Demo panel for the input components: Toggle, Checkbox, NumberInput, SegmentedControl and RangeSlider. */
export class DemoInputsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-inputs',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '70vw',
				height: 'auto',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			toggleBackground: true,
			toggleThumb     : false,
			toggleBoth      : false,
			aimStep         : 'position',
			difficulty      : 'normal',
			timeOfDay       : 'day',
			volume          : 65,
			fov             : 72,
			brightness      : 40,
			sensitivity     : 55,
			checkDefault    : true,
			checkCustom     : false,
			checkEmpty      : false,
			rounds          : 3,
			coins           : 250,
		})
	}


	// MARK: helpers
	private get<T>(key: string): T {
		return this.props?.get(key) as T
	}

	private set(key: string, value: unknown) {
		if (!this.props) {
			console.error('DemoInputsLayer.set: props controller missing')
			return
		}
		this.props.set(key, value)
	}


	// MARK: inputRow
	/** Control (cols 8) + caption (cols 4). */
	private inputRow(key: string, control: ReactEcs.JSX.Element, caption: string) {
		return (
			<Row key={`row_${key}`} alignItems="center" height={ROW_HEIGHT} margin={{ bottom: 6 }}>
				<Column cols={8} alignItems="flex-start" justifyContent="center">
					{control}
				</Column>
				<Column cols={4} alignItems="stretch" justifyContent="center" padding={{ left: 12 }}>
					<Text value={caption} textWrap="nowrap" />
				</Column>
			</Row>
		)
	}


	// MARK: body
	protected body() {
		if (!this.props) {
			console.error('DemoInputsLayer.body: props controller missing')
			return null
		}

		return [
			<Background key="chrome" />,
			<Column
				key            = "body"
				cols           = {12}
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 16, right: 20, bottom: 16, left: 20 }}
			>
				<H2 value="Inputs" />
				<Text value="Toggles, checkboxes, number inputs, segmented controls and range sliders. All work with taps on mobile." />

				<Divider margin={{ top: 8, bottom: 8 }} />

				<Row alignItems="flex-start">
					<Column key="left" cols={5} alignItems="stretch" justifyContent="flex-start" padding={{ right: 16 }}>
						{this.renderToggles()}
						<Divider margin={{ top: 4, bottom: 8 }} />
						{this.renderCheckboxes()}
						<Divider margin={{ top: 4, bottom: 8 }} />
						{this.renderNumberInputs()}
					</Column>
					<Column key="right" cols={7} alignItems="stretch" justifyContent="flex-start" padding={{ left: 16 }}>
						{this.renderSegmented()}
						<Divider margin={{ top: 4, bottom: 8 }} />
						{this.renderSliders()}
					</Column>
				</Row>
			</Column>,
		]
	}


	// MARK: renderToggles
	/** Track: track changes colour. Thumb: only the thumb changes (track stays dark). Both: both change. */
	private renderToggles() {
		const theme = getTheme()
		const trackColor = (key: string, on: boolean) => {
			if (key === 'toggleThumb') return theme.colors.dark
			return on ? theme.colors.info : undefined
		}
		return [
			<H3 key="toggle_title" value="Toggle" />,
			<Row key="toggle_row" alignItems="center" height={ROW_HEIGHT} margin={{ bottom: 6 }}>
				{TOGGLES.map((toggle) => {
					const on = this.get<boolean>(toggle.key)
					return (
						<Column key={toggle.key} cols={4} alignItems="flex-start" justifyContent="center">
							<Row alignItems="center" spacing={8}>
								<Toggle
									id              = {`demo_inputs_${toggle.key}`}
									value           = {on}
									backgroundColor = {trackColor(toggle.key, on)}
									toggleColor     = {(toggle.key === 'toggleThumb' || toggle.key === 'toggleBoth') && on ? theme.colors.primary : undefined}
									onChange        = {(next) => this.set(toggle.key, next)}
								/>
								<Text value={toggle.label} width="auto" textWrap="nowrap" />
							</Row>
						</Column>
					)
				})}
			</Row>,
		]
	}


	// MARK: renderCheckboxes
	private renderCheckboxes() {
		const theme = getTheme()
		return [
			<H3 key="check_title" value="Checkbox" />,
			<Row key="check_row" alignItems="center" height={ROW_HEIGHT} margin={{ bottom: 6 }}>
				<Column cols={4} alignItems="flex-start" justifyContent="center">
					<Checkbox
						id       = "demo_inputs_check_default"
						label    = "Default"
						value    = {this.get<boolean>('checkDefault')}
						onChange = {(next) => this.set('checkDefault', next)}
					/>
				</Column>
				<Column cols={4} alignItems="flex-start" justifyContent="center">
					<Checkbox
						id                     = "demo_inputs_check_custom"
						label                  = "Custom"
						checkedIcon            = "star"
						checkedBackgroundColor = {theme.colors.info}
						checkedIconColor       = {theme.colors.warning}
						value                  = {this.get<boolean>('checkCustom')}
						onChange               = {(next) => this.set('checkCustom', next)}
					/>
				</Column>
				<Column cols={4} alignItems="flex-start" justifyContent="center">
					<Checkbox
						id            = "demo_inputs_check_empty"
						label         = "No cross"
						uncheckedIcon = {null}
						value         = {this.get<boolean>('checkEmpty')}
						onChange      = {(next) => this.set('checkEmpty', next)}
					/>
				</Column>
			</Row>,
		]
	}


	// MARK: renderNumberInputs
	private renderNumberInputs() {
		return [
			<H3 key="number_title" value="Number input" />,
			this.inputRow('rounds', (
				<NumberInput
					id       = "demo_inputs_rounds"
					width    = "100%"
					min      = {1}
					max      = {10}
					value    = {this.get<number>('rounds')}
					onChange = {(value) => this.set('rounds', value)}
				/>
			), `1–10: ${this.get<number>('rounds')} rounds`),
			this.inputRow('coins', (
				<NumberInput
					id       = "demo_inputs_coins"
					width    = "100%"
					min      = {0}
					max      = {9999}
					steps    = {[10, 100]}
					step     = {10}
					value    = {this.get<number>('coins')}
					onChange = {(value) => this.set('coins', value)}
				/>
			), `±10 / ±100: ${this.get<number>('coins')}`),
			<Text key="number_tip" value="Click the field to type a value, then press Enter." fontColor={getTheme().colors.tertiary} />,
		]
	}


	// MARK: renderSegmented
	private renderSegmented() {
		const theme = getTheme()

		return [
			<H3 key="seg_title" value="Segmented control" />,
			this.inputRow('aim', (
				<SegmentedControl
					id              = "demo_inputs_aim"
					width           = "100%"
					backgroundColor = {theme.colors.dark}
					value           = {this.get<string>('aimStep')}
					onSelect        = {(value) => this.set('aimStep', value)}
				>
					<SegmentedControlOption value="position"  label="Position"  />
					<SegmentedControlOption value="direction" label="Direction" />
					<SegmentedControlOption value="strength"  label="Strength"  />
				</SegmentedControl>
			), `Click an option: ${this.get<string>('aimStep')}`),
			this.inputRow('difficulty', (
				<SegmentedControl
					id        = "demo_inputs_difficulty"
					variant   = "outline"
					clickMode = "cycle"
					width     = "100%"
					value     = {this.get<string>('difficulty')}
					onSelect  = {(value) => this.set('difficulty', value)}
				>
					<SegmentedControlOption value="easy"   label="Easy"   />
					<SegmentedControlOption value="normal" label="Normal" />
					<SegmentedControlOption value="hard"   label="Hard"   />
					<SegmentedControlOption value="insane" label="Insane" />
				</SegmentedControl>
			), `Outline, click to cycle: ${this.get<string>('difficulty')}`),
			this.inputRow('time', (
				<SegmentedControl
					id       = "demo_inputs_time"
					width    = {180}
					value    = {this.get<string>('timeOfDay')}
					onSelect = {(value) => this.set('timeOfDay', value)}
					options  = {TIME_OF_DAY.map((option) => ({
						value : option.value,
						render: (state) => <FaIcon name={option.icon} size={24} color={state.color} />,
					}))}
				/>
			), `Icon options: ${this.get<string>('timeOfDay')}`),
		]
	}


	// MARK: renderSliders
	private renderSliders() {
		return [
			<H3 key="slider_title" value="Range slider" />,
			this.inputRow('volume', (
				<RangeSlider
					id       = "demo_inputs_volume"
					width    = "20vw"
					value    = {this.get<number>('volume')}
					onChange = {(value) => this.set('volume', value)}
				/>
			), `Round: ${Math.round(this.get<number>('volume'))}%`),
			this.inputRow('fov', (
				<RangeSlider
					id       = "demo_inputs_fov"
					width    = "20vw"
					min      = {0}
					max      = {120}
					step     = {12}
					value    = {this.get<number>('fov')}
					onChange = {(value) => this.set('fov', value)}
				/>
			), `Round, step 12: ${this.get<number>('fov')}`),
			this.inputRow('brightness', (
				<RangeSlider
					id       = "demo_inputs_brightness"
					shape    = "inset"
					width    = "20vw"
					value    = {this.get<number>('brightness')}
					onChange = {(value) => this.set('brightness', value)}
				/>
			), `Inset: ${Math.round(this.get<number>('brightness'))}%`),
			this.inputRow('sensitivity', (
				<RangeSlider
					id       = "demo_inputs_sensitivity"
					shape    = "capsule"
					width    = "20vw"
					height   = {36}
					value    = {this.get<number>('sensitivity')}
					onChange = {(value) => this.set('sensitivity', value)}
				/>
			), `Capsule: ${Math.round(this.get<number>('sensitivity'))}%`),
		]
	}
}

export const demoInputsLayer = new DemoInputsLayer()
