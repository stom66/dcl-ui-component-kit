import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, Background, Column, Divider, getTheme, H2, Label, Layer, PropsController, Row, Text, Toggle, ZoneType } from '../../../ui-component-kit'
import { easingFunctions, tweenValue } from '../../../ui-component-kit/utils'


const LABEL_LERP_DURATION = 0.2

const labelAlphaGeneration = new Map<string, number>()


// MARK: tweenLabelAlpha
/** Lerps a stored label background alpha toward `to` (0 or 1). */
function tweenLabelAlpha(
	key     : string,
	props   : PropsController<Record<string, unknown>>,
	to      : number,
	duration: number = LABEL_LERP_DURATION
) {
	const from       = props.get(key) as number
	const generation = (labelAlphaGeneration.get(key) ?? 0) + 1
	labelAlphaGeneration.set(key, generation)

	if (duration <= 0 || from === to) {
		props.set(key, to)
		return
	}

	tweenValue(
		from,
		to,
		duration,
		(next) => {
			if (labelAlphaGeneration.get(key) !== generation) return
			props.set(key, next)
		},
		undefined,
		easingFunctions.easeOutQuart
	)
}


// MARK: DemoToggleLayer
/** Demo panel for the procedural Toggle switch. */
export class DemoToggleLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-toggle',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '40vw',
				height: '36vw',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			defaultOn         : false,
			backgroundOn      : true,
			toggleOn          : false,
			bothOn            : false,
			defaultOnAlpha    : 0,
			backgroundOnAlpha : 1,
			toggleOnAlpha     : 0,
			bothOnAlpha       : 0,
		})
	}


	// MARK: body
	protected body() {
		if (!this.props) {
			console.error('DemoToggleLayer.body: props controller missing')
			return null
		}

		const theme             = getTheme()
		const defaultOn         = this.props.get('defaultOn') as boolean
		const backgroundOn      = this.props.get('backgroundOn') as boolean
		const toggleOn          = this.props.get('toggleOn') as boolean
		const bothOn            = this.props.get('bothOn') as boolean
		const defaultOnAlpha    = this.props.get('defaultOnAlpha') as number
		const backgroundOnAlpha = this.props.get('backgroundOnAlpha') as number
		const toggleOnAlpha     = this.props.get('toggleOnAlpha') as number
		const bothOnAlpha       = this.props.get('bothOnAlpha') as number
		const primary           = theme.colors.primary

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
					<H2 value="Toggle" />
					<Text value="Pill track with a sliding thumb. Click anywhere on the switch." />

					<Divider uiTransform={{ margin: { top: 8, bottom: 8 } }} />

					<Row
						uiTransform={{
							alignItems: 'center',
							margin    : { bottom: 12 },
						}}
					>
						<Column cols={2} uiTransform={{ alignItems: 'center', justifyContent: 'center' }}>
							<Toggle
								id       = "demo_toggle_default"
								value    = {defaultOn}
								onChange = {(next) => {
									this.props?.set('defaultOn', next)
									if (this.props) tweenLabelAlpha('defaultOnAlpha', this.props, next ? 1 : 0)
								}}
							/>
						</Column>
						<Column cols={10} uiTransform={{ alignItems: 'stretch', justifyContent: 'center' }}>
							<Label cols={12} value="Default — no custom colors" color={alpha(primary, defaultOnAlpha)} />
						</Column>
					</Row>

					<Row
						uiTransform={{
							alignItems: 'center',
							margin    : { bottom: 12 },
						}}
					>
						<Column cols={2} uiTransform={{ alignItems: 'center', justifyContent: 'center' }}>
							<Toggle
								id              = "demo_toggle_background"
								value           = {backgroundOn}
								backgroundColor = {backgroundOn ? theme.colors.success : undefined}
								onChange        = {(next) => {
									this.props?.set('backgroundOn', next)
									if (this.props) tweenLabelAlpha('backgroundOnAlpha', this.props, next ? 1 : 0)
								}}
							/>
						</Column>
						<Column cols={10} uiTransform={{ alignItems: 'stretch', justifyContent: 'center' }}>
							<Label cols={12} value="backgroundColor — default ↔ green" color={alpha(primary, backgroundOnAlpha)} />
						</Column>
					</Row>

					<Row
						uiTransform={{
							alignItems: 'center',
							margin    : { bottom: 12 },
						}}
					>
						<Column cols={2} uiTransform={{ alignItems: 'center', justifyContent: 'center' }}>
							<Toggle
								id          = "demo_toggle_thumb"
								value       = {toggleOn}
								toggleColor = {toggleOn ? theme.colors.primary : undefined}
								onChange    = {(next) => {
									this.props?.set('toggleOn', next)
									if (this.props) tweenLabelAlpha('toggleOnAlpha', this.props, next ? 1 : 0)
								}}
							/>
						</Column>
						<Column cols={10} uiTransform={{ alignItems: 'stretch', justifyContent: 'center' }}>
							<Label cols={12} value="toggleColor — default ↔ primary" color={alpha(primary, toggleOnAlpha)} />
						</Column>
					</Row>

					<Row
						uiTransform={{ alignItems: 'center' }}
					>
						<Column cols={2} uiTransform={{ alignItems: 'center', justifyContent: 'center' }}>
							<Toggle
								id              = "demo_toggle_both"
								value           = {bothOn}
								backgroundColor = {bothOn ? theme.colors.success : undefined}
								toggleColor     = {bothOn ? theme.colors.primary : undefined}
								onChange        = {(next) => {
									this.props?.set('bothOn', next)
									if (this.props) tweenLabelAlpha('bothOnAlpha', this.props, next ? 1 : 0)
								}}
							/>
						</Column>
						<Column cols={10} uiTransform={{ alignItems: 'stretch', justifyContent: 'center' }}>
							<Label cols={12} value="Both — background + toggleColor" color={alpha(primary, bothOnAlpha)} />
						</Column>
					</Row>
				</Column>
			</Background>
		)
	}
}

export const demoToggleLayer = new DemoToggleLayer()
