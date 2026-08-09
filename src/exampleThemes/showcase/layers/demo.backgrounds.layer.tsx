import ReactEcs from '@dcl/sdk/react-ecs'
import { Background, BackgroundGradient, Column, getTheme, Label, Layer, Row, ZoneType } from '../../../ui-component-kit'

const SAMPLE_HEIGHT = 72
const SAMPLE_MARGIN = { top: 8, bottom: 8 }


// MARK: DemoSample
/**
 * Sized host so absolute `Background` / `BackgroundGradient` fill a visible
 * sample slot. Chrome and label are siblings (intended Background usage).
 */
function DemoSample({
	children,
}: {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}) {
	return (
		<Column
			cols           = {12}
			height         = {SAMPLE_HEIGHT}
			margin         = {SAMPLE_MARGIN}
			alignItems     = "center"
			justifyContent = "center"
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

		return [
			<Background key="chrome" />,
			<Row
				key            = "body"
				height         = "100%"
				alignItems     = "flex-start"
				justifyContent = "flex-start"
				padding        = {{ top: 16, right: 16, bottom: 16, left: 16 }}
			>
				<Column
					cols           = {4}
					height         = "100%"
					alignItems     = "stretch"
					justifyContent = "flex-start"
					padding        = {{ right: 8 }}
				>
					<Row margin={{ bottom: 4 }}>
						<Label cols={12} value="Backgrounds" />
					</Row>

					<DemoSample>
						<Background />
						<Label value="Default" />
					</DemoSample>

					<DemoSample>
						<Background
							backgroundColor        = {theme.colors.primary}
							borderRadius = {theme.border.radiusLarge}
							borderWidth  = {theme.border.width}
						/>
						<Label value="Custom color" />
					</DemoSample>
				</Column>

				<Column
					cols           = {8}
					height         = "100%"
					alignItems     = "stretch"
					justifyContent = "flex-start"
					padding        = {{ left: 8 }}
				>
					<Row margin={{ bottom: 4 }}>
						<Label cols={12} value="Background gradients" />
					</Row>

					<DemoSample>
						<BackgroundGradient
							backgroundColor     = {theme.colors.primary}
							direction = "top"
						/>
						<Label value="Primary · top" />
					</DemoSample>

					<DemoSample>
						<BackgroundGradient
							backgroundColor     = {theme.colors.danger}
							direction = "bottom"
						/>
						<Label value="Danger · bottom" />
					</DemoSample>

					<DemoSample>
						<BackgroundGradient
							backgroundColor     = {theme.colors.info}
							direction = "left"
						/>
						<Label value="Info · left" />
					</DemoSample>

					<DemoSample>
						<BackgroundGradient
							backgroundColor     = {theme.colors.success}
							direction = "right"
						/>
						<Label value="Success · right" />
					</DemoSample>
				</Column>
			</Row>,
		]
	}
}

export const demoBackgroundsLayer = new DemoBackgroundsLayer()
