import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, ButtonImage, ButtonText, Column, Divider, H2, Label, Row, Text } from '../../components'
import { Layer } from '../../components/layers'
import { ZoneType } from '../../components/zones/zone.presets'
import { getTheme } from '../../styles'


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
					uiTransform={{
						width         : '100%',
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
						value       = "ButtonText"
						uiTransform = {{ margin: { bottom: 8 }, width: '100%' }}
					/>
					<Row
						uiTransform={{
							width         : '100%',
							justifyContent: 'flex-start',
							alignItems    : 'center',
						}}
					>
						<ButtonText
							id          = "demo_btn_text_primary"
							textLabel   = "Primary"
							width       = "30%"
							callback    = {() => console.log('DemoButtonsLayer: primary clicked')}
						/>
						<ButtonText
							id              = "demo_btn_text_success"
							textLabel       = "Success"
							width           = "30%"
							backgroundColor = {theme.colors.success}
							callback        = {() => console.log('DemoButtonsLayer: success clicked')}
						/>
						<ButtonText
							id              = "demo_btn_text_danger"
							textLabel       = "Danger"
							width           = "30%"
							backgroundColor = {theme.colors.danger}
							callback        = {() => console.log('DemoButtonsLayer: danger clicked')}
						/>
					</Row>

					<Row
						uiTransform={{
							width         : '100%',
							justifyContent: 'flex-start',
							alignItems    : 'center',
							margin        : { top: 4 },
						}}
					>
						<ButtonText
							id              = "demo_btn_text_info"
							textLabel       = "Info"
							width           = "30%"
							backgroundColor = {theme.colors.info}
							callback        = {() => console.log('DemoButtonsLayer: info clicked')}
						/>
						<ButtonText
							id              = "demo_btn_text_warning"
							textLabel       = "Warning"
							width           = "30%"
							backgroundColor = {theme.colors.warning}
							callback        = {() => console.log('DemoButtonsLayer: warning clicked')}
						/>
						<ButtonText
							id              = "demo_btn_text_secondary"
							textLabel       = "Secondary"
							width           = "30%"
							backgroundColor = {theme.colors.secondary}
							callback        = {() => console.log('DemoButtonsLayer: secondary clicked')}
						/>
					</Row>

					<Divider uiTransform={{ margin: { top: 16, bottom: 8 } }} />

					<Label
						value       = "ButtonImage (atlas columns)"
						uiTransform = {{ margin: { bottom: 8 }, width: '100%' }}
					/>
					<Row
						uiTransform={{
							width         : '100%',
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
