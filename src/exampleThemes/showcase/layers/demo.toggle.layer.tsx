import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, Column, Divider, getTheme, H2, Label, Layer, PropsController, Row, Text, Toggle, ZoneType } from '../../../ui-component-kit'


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
			defaultOn   : false,
			backgroundOn: true,
			toggleOn    : false,
			bothOn      : false,
		})
	}


	// MARK: body
	protected body() {
		if (!this.props) {
			console.error('DemoToggleLayer.body: props controller missing')
			return null
		}

		const theme        = getTheme()
		const defaultOn    = this.props.get('defaultOn') as boolean
		const backgroundOn = this.props.get('backgroundOn') as boolean
		const toggleOn     = this.props.get('toggleOn') as boolean
		const bothOn       = this.props.get('bothOn') as boolean

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
						cols={12}
						uiTransform={{
							alignItems: 'center',
							margin    : { bottom: 12 },
						}}
					>
						<Column cols={2} uiTransform={{ alignItems: 'center', justifyContent: 'center' }}>
							<Toggle
								id       = "demo_toggle_default"
								value    = {defaultOn}
								onChange = {(next) => this.props?.set('defaultOn', next)}
							/>
						</Column>
						<Column cols={10} uiTransform={{ alignItems: 'stretch', justifyContent: 'center' }}>
							<Label cols={12} value="Default — no custom colors" />
						</Column>
					</Row>

					<Row
						cols={12}
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
								onChange        = {(next) => this.props?.set('backgroundOn', next)}
							/>
						</Column>
						<Column cols={10} uiTransform={{ alignItems: 'stretch', justifyContent: 'center' }}>
							<Label cols={12} value="backgroundColor — default ↔ green" />
						</Column>
					</Row>

					<Row
						cols={12}
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
								onChange    = {(next) => this.props?.set('toggleOn', next)}
							/>
						</Column>
						<Column cols={10} uiTransform={{ alignItems: 'stretch', justifyContent: 'center' }}>
							<Label cols={12} value="toggleColor — default ↔ primary" />
						</Column>
					</Row>

					<Row
						cols={12}
						uiTransform={{ alignItems: 'center' }}
					>
						<Column cols={2} uiTransform={{ alignItems: 'center', justifyContent: 'center' }}>
							<Toggle
								id              = "demo_toggle_both"
								value           = {bothOn}
								backgroundColor = {bothOn ? theme.colors.success : undefined}
								toggleColor     = {bothOn ? theme.colors.primary : undefined}
								onChange        = {(next) => this.props?.set('bothOn', next)}
							/>
						</Column>
						<Column cols={10} uiTransform={{ alignItems: 'stretch', justifyContent: 'center' }}>
							<Label cols={12} value="Both — background + toggleColor" />
						</Column>
					</Row>
				</Column>
			</Background>
		)
	}
}

export const demoToggleLayer = new DemoToggleLayer()
