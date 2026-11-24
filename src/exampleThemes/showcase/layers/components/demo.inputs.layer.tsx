import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, Column, Divider, getTheme, H2, H3, Layer, MultiSelect, MultiSelectOption, PropsController, RangeSlider, Row, Text, Toggle, ZoneType } from '../../../../ui-component-kit'

import { FaIcon, type FaIconName } from '../layouts/demo.layouts.shared'


const ROW_HEIGHT = 48

const TOGGLES = [
	{ key: 'toggleDefault',    label: 'Default'    },
	{ key: 'toggleBackground', label: 'Track color' },
	{ key: 'toggleThumb',      label: 'Thumb color' },
] as const

const TIME_OF_DAY: { value: string, icon: FaIconName }[] = [
	{ value: 'day',   icon: 'sun'  },
	{ value: 'night', icon: 'moon' },
	{ value: 'star',  icon: 'star' },
]


// MARK: DemoInputsLayer
/** Demo panel for the input components: Toggle, MultiSelect and RangeSlider. */
export class DemoInputsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-inputs',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '44vw',
				height: 'auto',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			toggleDefault   : false,
			toggleBackground: true,
			toggleThumb     : false,
			aimStep         : 'position',
			difficulty      : 'normal',
			timeOfDay       : 'day',
			volume          : 65,
			fov             : 70,
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
			<Row key={`row_${key}`} alignItems="center" height={ROW_HEIGHT} margin={{ bottom: 8 }}>
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

		const theme = getTheme()

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
				<Text value="Toggles, multi-selects and range sliders. All work with taps on mobile." />

				<Divider margin={{ top: 8, bottom: 8 }} />

				{/* Toggle */}
				<H3 value="Toggle" />
				<Row alignItems="center" height={ROW_HEIGHT} margin={{ bottom: 8 }}>
					{TOGGLES.map((toggle) => {
						const on = this.get<boolean>(toggle.key)
						return (
							<Column key={toggle.key} cols={4} alignItems="center" justifyContent="center">
								<Row alignItems="center" justifyContent="center" spacing={10}>
									<Toggle
										id              = {`demo_inputs_${toggle.key}`}
										value           = {on}
										backgroundColor = {toggle.key === 'toggleBackground' && on ? theme.colors.info : undefined}
										toggleColor     = {toggle.key === 'toggleThumb' && on ? theme.colors.primary : undefined}
										onChange        = {(next) => this.set(toggle.key, next)}
									/>
									<Text value={toggle.label} width="auto" textWrap="nowrap" />
								</Row>
							</Column>
						)
					})}
				</Row>

				<Divider margin={{ top: 4, bottom: 8 }} />

				{/* MultiSelect */}
				<H3 value="Multi-select" />
				{this.inputRow('aim', (
					<MultiSelect
						id       = "demo_inputs_aim"
						width    = "100%"
						value    = {this.get<string>('aimStep')}
						onSelect = {(value) => this.set('aimStep', value)}
					>
						<MultiSelectOption value="position"  label="Position"  />
						<MultiSelectOption value="direction" label="Direction" />
						<MultiSelectOption value="strength"  label="Strength"  />
					</MultiSelect>
				), `Filled, click to cycle: ${this.get<string>('aimStep')}`)}

				{this.inputRow('difficulty', (
					<MultiSelect
						id        = "demo_inputs_difficulty"
						variant   = "outline"
						clickMode = "direct"
						width     = "100%"
						value     = {this.get<string>('difficulty')}
						onSelect  = {(value) => this.set('difficulty', value)}
					>
						<MultiSelectOption value="easy"   label="Easy"   />
						<MultiSelectOption value="normal" label="Normal" />
						<MultiSelectOption value="hard"   label="Hard"   />
						<MultiSelectOption value="insane" label="Insane" />
					</MultiSelect>
				), `Outline, click an option: ${this.get<string>('difficulty')}`)}

				{this.inputRow('time', (
					<MultiSelect
						id       = "demo_inputs_time"
						width    = {180}
						value    = {this.get<string>('timeOfDay')}
						onSelect = {(value) => this.set('timeOfDay', value)}
						options  = {TIME_OF_DAY.map((option) => ({
							value : option.value,
							render: (state) => <FaIcon name={option.icon} size={24} color={state.color} />,
						}))}
					/>
				), `Icon options: ${this.get<string>('timeOfDay')}`)}

				<Divider margin={{ top: 4, bottom: 8 }} />

				{/* RangeSlider */}
				<H3 value="Range slider" />
				{this.inputRow('volume', (
					<RangeSlider
						id       = "demo_inputs_volume"
						width    = "26vw"
						value    = {this.get<number>('volume')}
						onChange = {(value) => this.set('volume', value)}
					/>
				), `Continuous: ${Math.round(this.get<number>('volume'))}%`)}

				{this.inputRow('fov', (
					<RangeSlider
						id       = "demo_inputs_fov"
						variant  = "outline"
						width    = "26vw"
						min      = {40}
						max      = {120}
						step     = {10}
						value    = {this.get<number>('fov')}
						onChange = {(value) => this.set('fov', value)}
					/>
				), `Step 10: ${this.get<number>('fov')}`)}

				<Text value="Tap the track to jump to a point. On desktop, hold and drag." fontColor={theme.colors.tertiary} />
			</Column>,
		]
	}
}

export const demoInputsLayer = new DemoInputsLayer()
