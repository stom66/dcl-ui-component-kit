import ReactEcs from '@dcl/sdk/react-ecs'
import { Background, BackgroundGradient, Column, getTheme, Label, Layer, Row, ZoneType } from '../../../ui-component-kit'

const SAMPLE_HEIGHT = 72
const SAMPLE_MARGIN = { top: 8, bottom: 8 }


// MARK: DemoSample
/** Sized host so absolute `Background` / `BackgroundGradient` fill a visible sample slot. */
function DemoSample({
	children,
}: {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}) {
	return (
		<Column
			cols={12}
			uiTransform={{
				height: SAMPLE_HEIGHT,
				margin: SAMPLE_MARGIN,
			}}
		>
			{children}
		</Column>
	)
}


// MARK: DemoBackgroundsLayer
/** Demo panel for `Background` and `BackgroundGradient` variants. */
export class DemoBackgroundsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-backgrounds',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '60vw',
				height: '42vh',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return (
			<Background
				uiTransform={{
					padding: { top: 16, right: 16, bottom: 16, left: 16 },
				}}
			>
				<Row
					uiTransform={{
						height        : '100%',
						alignItems    : 'flex-start',
						justifyContent: 'flex-start',
					}}
				>
					<Column
						cols={4}
						uiTransform={{
							height        : '100%',
							alignItems    : 'stretch',
							justifyContent: 'flex-start',
							padding       : { right: 8 },
						}}
					>
						<Row uiTransform={{ margin: { bottom: 4 } }}>
							<Label cols={12} value="Backgrounds" />
						</Row>

						<DemoSample>
							<Background>
								<Label value="Default" />
							</Background>
						</DemoSample>

						<DemoSample>
							<Background
								backgroundColor = {theme.colors.primary}
								borderRadius    = {theme.border.radiusLarge}
								borderWidth     = {theme.border.width}
							>
								<Label value="Custom color" />
							</Background>
						</DemoSample>
					</Column>

					<Column
						cols={8}
						uiTransform={{
							height        : '100%',
							alignItems    : 'stretch',
							justifyContent: 'flex-start',
							padding       : { left: 8 },
						}}
					>
						<Row uiTransform={{ margin: { bottom: 4 } }}>
							<Label cols={12} value="Background gradients" />
						</Row>

						<DemoSample>
							<BackgroundGradient
								color     = {theme.colors.primary}
								direction = "top"
							>
								<Label value="Primary · top" />
							</BackgroundGradient>
						</DemoSample>

						<DemoSample>
							<BackgroundGradient
								color     = {theme.colors.danger}
								direction = "bottom"
							>
								<Label value="Danger · bottom" />
							</BackgroundGradient>
						</DemoSample>

						<DemoSample>
							<BackgroundGradient
								color     = {theme.colors.info}
								direction = "left"
							>
								<Label value="Info · left" />
							</BackgroundGradient>
						</DemoSample>

						<DemoSample>
							<BackgroundGradient
								color     = {theme.colors.success}
								direction = "right"
							>
								<Label value="Success · right" />
							</BackgroundGradient>
						</DemoSample>
					</Column>
				</Row>
			</Background>
		)
	}
}

export const demoBackgroundsLayer = new DemoBackgroundsLayer()
