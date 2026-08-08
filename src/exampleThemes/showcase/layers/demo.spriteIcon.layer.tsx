import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, Code, Column, getTheme, H2, Label, Layer, playOnce, Row, setPlaying, SpriteIcon, Text, ZoneType } from '../../../ui-component-kit'
import { exampleSpriteSheetAtlas, SpriteSmoke, SpriteSmoke2, SpriteSmoke3 } from '../atlases'

const SIZE = 128

const ID = {
	full      : 'demo-sprite-full',
	smoke     : 'demo-sprite-smoke',
	smoke2    : 'demo-sprite-smoke-2',
	smoke3    : 'demo-sprite-smoke-3',
	partial   : 'demo-sprite-partial',
	pingpong  : 'demo-sprite-pingpong',
	interval  : 'demo-sprite-interval',
	hoverLoop : 'demo-sprite-hover-loop',
	hoverOnce : 'demo-sprite-hover-once',
} as const


// MARK: DemoSpriteIconLayer
/**
 * Demo panel for `SpriteIcon`: sprite rows with code samples on the row below.
 */
export class DemoSpriteIconLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-sprite-icon',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '52vw',
				height: 'auto',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return (
			<Background fitContent>
				<Column
					cols           = {12}
					spacing        = {6}
					alignItems     = "flex-start"
					justifyContent = "flex-start"
					padding        = {{ top: 12, right: 20, bottom: 16, left: 20 }}
				>
					<H2 value="Sprite Icon" />
					<Text value="Animated sprite sheets via SpriteIcon. Cells play left → right, top → bottom. Use offset / limit for a window; pingPong reverses at the end; loopInterval pauses between loops." />

					{/* MARK: Full sheet — 4 sprites, then code */}
					<Label
						cols   = {12}
						value  = "Full sheet"
						margin = {{ top: 8, bottom: 8 }}
					/>
					<Row
						justifyContent = "flex-start"
						alignItems     = "center"
						spacing        = {0}
					>
						<Column cols={6}>
							<Row>
								<Column cols={4}>
								<Code
									value = {`<SpriteIcon
  atlas = {myAtlas}
  fps   = {15}
/>`}
								/>
								</Column>
								
								<SpriteIcon
									id     = {ID.full}
									atlas  = {exampleSpriteSheetAtlas}
									fps    = {15}
									limit  = {44}
									width  = {SIZE}
									height = {SIZE}
									margin = {{ right: 16 }}
									/>
								<SpriteIcon
									id     = {ID.smoke}
									atlas  = {SpriteSmoke}
									fps    = {30}
									limit  = {16} // There's actually only 12 occupied cells in this 4x4 sheet, so we limit to more to show blank space after the sequence
									width  = {SIZE}
									height = {SIZE}
									margin = {{ right: 16 }}
								/>
								<SpriteIcon
									id     = {ID.smoke2}
									atlas  = {SpriteSmoke2}
									fps    = {20}
									limit  = {8}
									width  = {SIZE}
									height = {SIZE}
									margin = {{ right: 16 }}
									/>
								<SpriteIcon
									id     = {ID.smoke3}
									atlas  = {SpriteSmoke3}
									fps    = {16}
									limit  = {10}
									width  = {SIZE}
									height = {SIZE*0.75}
									/>
							</Row>
						</Column>
					</Row>

					{/* MARK: Windows — sprites row, then codes row */}
					<Label
						cols   = {12}
						value  = "Limit / offset / pingPong / loopInterval, and onHover / onClick events"
						margin = {{ top: 12 }}
					/>
					<Row
						justifyContent = "flex-start"
						alignItems     = "center"
						spacing        = {0}
					>
						<Column cols={2} alignItems="center" spacing={0}>
							<SpriteIcon
								id       = {ID.pingpong}
								atlas    = {exampleSpriteSheetAtlas}
								fps      = {15}
								offset   = {21}
								limit    = {24}
								pingPong
								width    = {SIZE}
								height   = {SIZE}
							/>
						</Column>
						<Column cols={2} alignItems="center" spacing={0}>
							<SpriteIcon
								id           = {ID.interval}
								atlas        = {SpriteSmoke}
								limit        = {12}
								fps          = {30}
								loopInterval = {2}
								width        = {SIZE}
								height       = {SIZE}
							/>
						</Column>
						<Column cols={4} alignItems="center" spacing={0}>
							<SpriteIcon
								id           = {ID.hoverLoop}
								atlas        = {exampleSpriteSheetAtlas}
								fps          = {15}
								playing      = {true}
								width        = {SIZE}
								height       = {SIZE}
								onMouseEnter = {() => setPlaying(ID.hoverLoop, false)}
								onMouseLeave = {() => setPlaying(ID.hoverLoop, true)}
							/>
						</Column>
						<Column cols={4} alignItems="center" spacing={0}>
							<SpriteIcon
								id           = {ID.hoverOnce}
								atlas        = {exampleSpriteSheetAtlas}
								fps          = {15}
								offset       = {21}
								limit        = {24}
								playing      = {false}
								looping      = {false}
								width        = {SIZE}
								height       = {SIZE}
								onMouseDown = {() => playOnce(ID.hoverOnce)}
							/>
						</Column>
					</Row>
					<Row
						justifyContent = "flex-start"
						alignItems     = "flex-start"
						spacing        = {0}
						margin         = {{ top: 6 }}
					>
					</Row>

					<Row
						justifyContent = "flex-start"
						alignItems     = "flex-start"
						spacing        = {0}
						margin         = {{ top: 6 }}
					>
						<Column cols={2} alignItems="flex-start" spacing={0} padding={{ right: 8 }}>
							<Code
								value = {`<SpriteIcon
  ...
  offset  = {8}
  limit   = {8}
  pingPong
/>`}
							/>
						</Column>
						<Column cols={2} alignItems="flex-start" spacing={0}>
							<Code
								value = {`<SpriteIcon
  ...
  loopInterval = {2}
/>`}
							/>
						</Column>
						<Column cols={4} alignItems="flex-start" spacing={0} padding={{ right: 8 }}>
							<Code
								value = {`<SpriteIcon
  ...
  onMouseEnter = {() => setPlaying(id, false)}
  onMouseLeave = {() => setPlaying(id, true)}
/>`}
							/>
						</Column>
						<Column cols={4} alignItems="flex-start" spacing={0}>
							<Code
								value = {`<SpriteIcon
  ...
  playing     = {false}
  looping     = {false}
  onMouseDown = {() => playOnce(id)}
/>`}
							/>
						</Column>
					</Row>
				</Column>
			</Background>
		)
	}
}

export const demoSpriteIconLayer = new DemoSpriteIconLayer()
