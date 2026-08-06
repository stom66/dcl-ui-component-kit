import ReactEcs from '@dcl/sdk/react-ecs'
import { Background, ButtonImage, ButtonText, Column, Divider, getTheme, H2, Label, Layer, Row, Text, ZoneType } from '../../../ui-component-kit'

// MARK: DemoButtonsLayer
/** Demo panel for ButtonText and ButtonImage variants. */
export class DemoButtonsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-buttons',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '45vw',
				height: '40vw',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

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
					<H2 value="Buttons" />
					<Text value="ButtonText for labelled controls; ButtonImage for atlas icons." />

					<Divider uiTransform={{ margin: { top: 8, bottom: 8 } }} />

					<Label
						cols        = {12}
						value       = "ButtonText"
						uiTransform = {{ margin: { bottom: 8 } }}
					/>
					<Row
						uiTransform={{
							justifyContent: 'flex-start',
							alignItems    : 'center',
						}}
					>
						<ButtonText
							id        = "demo_btn_text_primary"
							textLabel = "Primary"
							cols      = {4}
							callback  = {() => console.log('DemoButtonsLayer: primary clicked')}
						/>
						<ButtonText
							id              = "demo_btn_text_success"
							textLabel       = "Success"
							cols            = {4}
							backgroundColor = {theme.colors.success}
							callback        = {() => console.log('DemoButtonsLayer: success clicked')}
						/>
						<ButtonText
							id              = "demo_btn_text_danger"
							textLabel       = "Danger"
							cols            = {4}
							backgroundColor = {theme.colors.danger}
							callback        = {() => console.log('DemoButtonsLayer: danger clicked')}
						/>
					</Row>

					<Row
						uiTransform={{
							justifyContent: 'flex-start',
							alignItems    : 'center',
							margin        : { top: 4 },
						}}
					>
						<ButtonText
							id              = "demo_btn_text_info"
							textLabel       = "Info"
							cols            = {4}
							backgroundColor = {theme.colors.info}
							callback        = {() => console.log('DemoButtonsLayer: info clicked')}
						/>
						<ButtonText
							id              = "demo_btn_text_warning"
							textLabel       = "Warning"
							cols            = {4}
							backgroundColor = {theme.colors.warning}
							callback        = {() => console.log('DemoButtonsLayer: warning clicked')}
						/>
						<ButtonText
							id              = "demo_btn_text_secondary"
							textLabel       = "Secondary"
							cols            = {4}
							backgroundColor = {theme.colors.secondary}
							callback        = {() => console.log('DemoButtonsLayer: secondary clicked')}
						/>
					</Row>

					<Divider uiTransform={{ margin: { top: 16, bottom: 8 } }} />

					<Label
						cols        = {12}
						value       = "ButtonImage (atlas columns)"
						uiTransform = {{ margin: { bottom: 8 } }}
					/>
					<Row
						uiTransform={{
							height        : 80,
							justifyContent: 'flex-start',
							alignItems    : 'center',
						}}
					>
						<ButtonImage
							id          = "demo_btn_image_0"
							uvColumn    = {1}
							width       = {64}
							height      = {64}
							callback    = {() => console.log('DemoButtonsLayer: image col 1 clicked')}
							uiTransform = {{
								positionType: 'relative',
								position    : { top: 0, left: 0 },
								margin      : { left: 8, right: 8 },
							}}
						/>
						<ButtonImage
							id          = "demo_btn_image_1"
							uvColumn    = {2}
							width       = {64}
							height      = {64}
							callback    = {() => console.log('DemoButtonsLayer: image col 2 clicked')}
							uiTransform = {{
								positionType: 'relative',
								position    : { top: 0, left: 0 },
								margin      : { left: 8, right: 8 },
							}}
						/>
						<ButtonImage
							id          = "demo_btn_image_2"
							uvColumn    = {3}
							width       = {64}
							height      = {64}
							callback    = {() => console.log('DemoButtonsLayer: image col 3 clicked')}
							uiTransform = {{
								positionType: 'relative',
								position    : { top: 0, left: 0 },
								margin      : { left: 8, right: 8 },
							}}
						/>
						<ButtonImage
							id          = "demo_btn_image_3"
							uvColumn    = {4}
							width       = {64}
							height      = {64}
							callback    = {() => console.log('DemoButtonsLayer: image col 4 clicked')}
							uiTransform = {{
								positionType: 'relative',
								position    : { top: 0, left: 0 },
								margin      : { left: 8, right: 8 },
							}}
						/>
					</Row>
				</Column>
			</Background>
		)
	}
}

export const demoButtonsLayer = new DemoButtonsLayer()
