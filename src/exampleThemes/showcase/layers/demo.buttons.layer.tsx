import ReactEcs from '@dcl/sdk/react-ecs'
import { atlasBtn1x1, atlasBtn3x1, atlasBtnIconsStyled, atlasIconsFontAwesome, Background, ButtonImage, ButtonText, Column, Divider, getTheme, H2, Icon, Label, Layer, Row, Text, ZoneType } from '../../../ui-component-kit'

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
				key            = "body"
				cols           = {12}
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 16, right: 20, bottom: 16, left: 20 }}
			>
					<H2 value="Buttons" />
					<Text value="ButtonText for labelled controls; ButtonImage for atlas icons and wide textured buttons." />

					<Divider margin={{ top: 8, bottom: 8 }} />

					<Label
						cols   = {12}
						value  = "ButtonText"
						margin = {{ bottom: 8 }}
					/>
					<Row
						justifyContent = "flex-start"
						alignItems     = "center"
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
						justifyContent = "flex-start"
						alignItems     = "center"
						margin         = {{ top: 4 }}
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

					<Divider margin={{ top: 16, bottom: 8 }} />

					<Label
						cols   = {12}
						value  = "ButtonImage — atlasBtnIconsStyled (4 columns × 4 states)"
						margin = {{ bottom: 8 }}
					/>
					<Row
						height         = {80}
						justifyContent = "flex-start"
						alignItems     = "center"
						spacing        = {12}
					>
						<ButtonImage
							id          = "demo_btn_image_0"
							atlas       = {atlasBtnIconsStyled}
							uvColumn    = {1}
							width       = {64}
							height      = {64}
							callback    = {() => console.log('DemoButtonsLayer: image col 1 clicked')}
							uiTransform = {{
								positionType: 'relative',
								position    : { top: 0, left: 0 },
							}}
						/>
						<ButtonImage
							id          = "demo_btn_image_1"
							atlas       = {atlasBtnIconsStyled}
							uvColumn    = {2}
							width       = {64}
							height      = {64}
							callback    = {() => console.log('DemoButtonsLayer: image col 2 clicked')}
							uiTransform = {{
								positionType: 'relative',
								position    : { top: 0, left: 0 },
							}}
						/>
						<ButtonImage
							id          = "demo_btn_image_2"
							atlas       = {atlasBtnIconsStyled}
							uvColumn    = {3}
							width       = {64}
							height      = {64}
							callback    = {() => console.log('DemoButtonsLayer: image col 3 clicked')}
							uiTransform = {{
								positionType: 'relative',
								position    : { top: 0, left: 0 },
							}}
						/>
						<ButtonImage
							id          = "demo_btn_image_3"
							atlas       = {atlasBtnIconsStyled}
							uvColumn    = {4}
							width       = {64}
							height      = {64}
							callback    = {() => console.log('DemoButtonsLayer: image col 4 clicked')}
							uiTransform = {{
								positionType: 'relative',
								position    : { top: 0, left: 0 },
							}}
						/>
					</Row>

					<Divider margin={{ top: 16, bottom: 8 }} />

					<Label
						cols   = {12}
						value  = "ButtonImage — blank sheets (atlasBtn3x1 + atlasBtn1x1)"
						margin = {{ bottom: 8 }}
					/>
					<Text
						value  = "Wide and narrow blank atlases with native nine-slices; nest icon / text children on top."
						margin = {{ bottom: 8 }}
					/>
					<Row
						height         = {80}
						justifyContent = "flex-start"
						alignItems     = "center"
						spacing        = {16}
					>
						<ButtonImage
							id          = "demo_btn_wide_click_me"
							atlas       = {atlasBtn3x1}
							uvColumn    = {1}
							width       = {192}
							height      = {64}
							callback    = {() => console.log('DemoButtonsLayer: wide click-me clicked')}
							uiTransform = {{
								positionType: 'relative',
								position    : { top: 0, left: 0 },
							}}
						>
							<Row
								height         = "100%"
								alignItems     = "center"
								justifyContent = "center"
								spacing        = {8}
							>
								<Icon
									uvs       = {atlasIconsFontAwesome.uv.handPointer}
									width     = {28}
									height    = {28}
									iconColor = {theme.colors.dark}
								/>
								<Text
									value     = "Click me"
									width     = "auto"
									fontSize  = {theme.typography.size.default}
									fontColor = {theme.colors.dark}
									textAlign = "middle-center"
									textWrap  = "nowrap"
								/>
							</Row>
						</ButtonImage>
						<ButtonImage
							id          = "demo_btn_narrow_ok"
							atlas       = {atlasBtn1x1}
							uvColumn    = {1}
							width       = {64}
							height      = {64}
							callback    = {() => console.log('DemoButtonsLayer: narrow ok clicked')}
							uiTransform = {{
								positionType: 'relative',
								position    : { top: 0, left: 0 },
							}}
						>
							<Row
								height         = "100%"
								alignItems     = "center"
								justifyContent = "center"
							>
								<Icon
									uvs       = {atlasIconsFontAwesome.uv.check}
									width     = {28}
									height    = {28}
									iconColor = {theme.colors.dark}
								/>
							</Row>
						</ButtonImage>
					</Row>
			</Column>,
		]
	}
}

export const demoButtonsLayer = new DemoButtonsLayer()
