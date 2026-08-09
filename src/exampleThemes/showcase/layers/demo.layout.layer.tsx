import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, Background, Column, Divider, getTheme, H2, H3, Layer, Row, Text, UiBox, ZoneType, type Theme } from '../../../ui-component-kit'


// MARK: DemoCell
/** Coloured swatch used to make column spans obvious in the layout demo. */
function DemoCell({
	label,
	backgroundColor,
	theme,
}: {
	label: string
	backgroundColor: Color4
	theme: Theme
}) {
	return (
		<UiBox
			backgroundColor = {backgroundColor}
			borderRadius   = {theme.border.radiusSmall}
			padding        = {{ top: 8, right: 8, bottom: 8, left: 8 }}
			alignItems     = "center"
			justifyContent = "center"
			width          = "100%"
		>
			<Text
				value     = {label}
				fontSize  = {theme.typography.size.small}
				textAlign = "middle-center"
			/>
		</UiBox>
	)
}


// MARK: DemoLayoutLayer
/**
 * Showcase for Row / Column grid behaviour: explicit `cols` spans stay fixed,
 * `cols="auto"` fills leftover row space (equal share among siblings), omitting
 * `cols` applies no grid sizing, and Rows are always full parent width.
 */
export class DemoLayoutLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-layout',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '48vw',
				height: 'auto',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme  = getTheme()
		const c4     = alpha(theme.colors.primary, 0.85)
		const cFill  = alpha(theme.colors.info, 0.75)
		const c8     = alpha(theme.colors.success, 0.75)
		const cNest  = alpha(theme.colors.warning, 0.7)
		const cMuted = alpha(theme.colors.secondary, 0.55)

		return [
			<Background key="demo_layout_chrome" />,
			<Column
				key            = "demo_layout_body"
				cols           = {12}
				spacing        = {10}
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 16, right: 20, bottom: 16, left: 20 }}
			>
					<H2 value="Rows & Columns" />
					<Text value="Typically, Cols go inside Rows. Cols are sized by the number of columns they span, out of 12." />

					<Divider margin={{ top: 4, bottom: 4 }} />

					<Text value="Cols with auto expand to fill the space" />
					<Row
						backgroundColor        = {alpha(theme.colors.secondary, 0.25)}
						borderRadius = {theme.border.radiusSmall}
					>
						<Column cols={4}>
							<DemoCell label="cols={4} (33%)" backgroundColor={c4} theme={theme} />
						</Column>
						<Column cols="auto">
							<DemoCell label='cols="auto" → fill' backgroundColor={cFill} theme={theme} />
						</Column>
					</Row>

					<Text value="Sibling autos share space evenly" />
					<Row
						backgroundColor        = {alpha(theme.colors.secondary, 0.25)}
						borderRadius = {theme.border.radiusSmall}
					>
						<Column cols={3}>
							<DemoCell label="cols={3} (25%)" backgroundColor={c4} theme={theme} />
						</Column>
						<Column cols="auto">
							<DemoCell label='cols="auto"' backgroundColor={cFill} theme={theme} />
						</Column>
						<Column cols="auto">
							<DemoCell label='cols="auto"' backgroundColor={cFill} theme={theme} />
						</Column>
					</Row>


					<Text value="Explicit col sizes don't expand" />
					<Row
						backgroundColor        = {alpha(theme.colors.secondary, 0.25)}
						borderRadius = {theme.border.radiusSmall}
					>
						<Column cols={4}>
							<DemoCell label="cols={4}" backgroundColor={c4} theme={theme} />
						</Column>
						<Column cols={4}>
							<DemoCell label="cols={4}" backgroundColor={c4} theme={theme} />
						</Column>
					</Row>

					<Divider margin={{ top: 4, bottom: 4 }} />

					<H3 value="cols={4} + cols={8} with nested rows" />
					<Text value="Rows are always 100% of their parent. Narrow a section with a Column wrapper" />
					<Row
						backgroundColor        = {alpha(theme.colors.secondary, 0.25)}
						borderRadius = {theme.border.radiusSmall}
					>
						<Column
							cols         = {4}
							spacing      = {6}
							alignItems   = "stretch"
							backgroundColor        = {alpha(theme.colors.primary, 0.15)}
							borderRadius = {theme.border.radiusSmall}
						>
							<DemoCell label="cols={4} parent" backgroundColor={c4} theme={theme} />
							<Row
								backgroundColor        = {alpha(theme.colors.body, 0.5)}
								borderRadius = {theme.border.radiusSmall}
								margin       = {{ top: 6, bottom: 6 }}
							>
								<Column cols="auto">
									<DemoCell label="nested → auto fill" backgroundColor={cNest} theme={theme} />
								</Column>
							</Row>
							<Row
								backgroundColor        = {alpha(theme.colors.body, 0.5)}
								borderRadius = {theme.border.radiusSmall}
								margin       = {{ top: 6, bottom: 6 }}
							>
								<Column cols={6}>
									<DemoCell label="6" backgroundColor={cMuted} theme={theme} />
								</Column>
								<Column cols={6}>
									<DemoCell label="6" backgroundColor={cMuted} theme={theme} />
								</Column>
							</Row>
						</Column>
						<Column
							cols         = {8}
							spacing      = {6}
							alignItems   = "stretch"
							backgroundColor        = {alpha(theme.colors.primary, 0.15)}
							borderRadius = {theme.border.radiusSmall}
						>
							<DemoCell label="cols={8} parent" backgroundColor={c8} theme={theme} />
							<Row
								backgroundColor        = {alpha(theme.colors.body, 0.5)}
								borderRadius = {theme.border.radiusSmall}
								margin       = {{ top: 6, bottom: 6 }}
							>
								<Column cols={4}>
									<DemoCell label="4" backgroundColor={cNest} theme={theme} />
								</Column>
								<Column cols={4}>
									<DemoCell label="4" backgroundColor={cNest} theme={theme} />
								</Column>
								<Column cols={4}>
									<DemoCell label="4" backgroundColor={cNest} theme={theme} />
								</Column>
							</Row>
							<Row
								backgroundColor        = {alpha(theme.colors.body, 0.5)}
								borderRadius = {theme.border.radiusSmall}
								margin       = {{ top: 6, bottom: 6 }}
							>
								<Column cols={6}>
									<DemoCell label="cols={6} half of parent" backgroundColor={cFill} theme={theme} />
								</Column>
							</Row>
						</Column>
					</Row>
			</Column>,
		]
	}
}

export const demoLayoutLayer = new DemoLayoutLayer()
