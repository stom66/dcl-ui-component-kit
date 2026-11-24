import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'
import { alpha, Background, BackgroundGradient, Column, getTheme, H1, Label, Layer, Row, Text, ZoneType } from '../../../../ui-component-kit'

const SAMPLE_HEIGHT = 72
const SAMPLE_MARGIN = { top: 8, bottom: 8 }

/** 256px icon tile. Repeat samples it smaller; stretch maps the whole image once. */
const ICON_TILE_SRC  = 'assets/images/example-themes/showcase/tex-bg-dcl-icons.png'
const ICON_TILE_PX   = 256
/** 128px rounded logo. Slice inset is 42px on every edge, as a fraction of the texture. */
const LOGO_SRC       = 'assets/images/example-themes/showcase/tex-bg-dcl-logo.png'
const LOGO_SLICE     = 42 / 128
const PATTERN_WIDTH  = ICON_TILE_PX * 2
const PATTERN_HEIGHT = 128
/** One row of square tiles at the sample height, so the repeat is smaller than the source. */
const REPEAT_TILES_X = PATTERN_WIDTH / PATTERN_HEIGHT
const REPEAT_TILES_Y = 1


// MARK: DemoSample
/**
 * Sized host so absolute `Background` / `BackgroundGradient` fill a visible
 * sample slot. Chrome and caption are siblings (intended Background usage).
 */
function DemoSample({
	key,
	children,
	width,
	height = SAMPLE_HEIGHT,
}: {
	/** Sibling identity. react-ecs passes `key` through as a real prop. */
	key?     : string
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Fixed width. Omit to span the column (`cols={12}`). */
	width?   : number
	height?  : number
}) {
	return (
		<Column
			key            = {key}
			cols           = {width === undefined ? 12 : undefined}
			width          = {width}
			height         = {height}
			alignSelf      = {width === undefined ? undefined : 'center'}
			margin         = {SAMPLE_MARGIN}
			alignItems     = "center"
			justifyContent = "center"
		>
			{children}
		</Column>
	)
}


// MARK: repeatUvs
/**
 * UV quad covering `tilesX` × `tilesY` copies of a texture.
 * Order is bottom-left, top-left, top-right, bottom-right.
 * Use with `textureMode: 'stretch'` and `wrapMode: 'repeat'`.
 */
function repeatUvs(
	tilesX: number,
	tilesY: number,
): number[] {
	return [
		0,      0,
		0,      tilesY,
		tilesX, tilesY,
		tilesX, 0,
	]
}


// MARK: DemoCaption
/**
 * Centered caption. `Text` defaults to `alignSelf: 'flex-start'` and a full
 * width, which leaves the line on the left; size to the words and center the box.
 */
function DemoCaption({
	key,
	value,
	fontColor,
}: {
	/** Sibling identity. react-ecs passes `key` through as a real prop. */
	key?      : string
	value     : string
	fontColor?: Color4
}) {
	return (
		<Text
			key       = {key}
			value     = {value}
			width     = "auto"
			alignSelf = "center"
			fontColor = {fontColor}
			textAlign = "middle-center"
			textWrap  = "nowrap"
		/>
	)
}


// MARK: DemoTextureLabel
/** White bold caption on a translucent dark chip, centered on a texture sample. */
function DemoTextureLabel({
	key,
	value,
}: {
	/** Sibling identity. react-ecs passes `key` through as a real prop. */
	key? : string
	value: string
}) {
	const theme = getTheme()

	return (
		<Label
			key             = {key}
			value           = {value}
			fontColor       = {Color4.create(1, 1, 1, 1)}
			backgroundColor = {alpha(theme.colors.dark, 0.75)}
			borderRadius    = {theme.border.radiusDefault}
			alignSelf       = "center"
			textWrap        = "nowrap"
		/>
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
				height: '54vh',
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
				height         = "100%"
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 16, right: 16, bottom: 16, left: 16 }}
			>
				<H1 key="title" value="Backgrounds" />
				<Row
					key            = "columns"
					flexGrow       = {1}
					alignItems     = "flex-start"
					justifyContent = "flex-start"
				>
					<Column
						key            = "textures"
						cols           = {6}
						height         = "100%"
						alignItems     = "stretch"
						justifyContent = "flex-start"
						padding        = {{ right: 8 }}
					>
						<Row key="heading" margin={{ bottom: 4 }}>
							<Label cols={12} value="Textures" />
						</Row>

						<DemoSample
							key    = "repeat"
							width  = {PATTERN_WIDTH}
							height = {PATTERN_HEIGHT}
						>
							<Background
								key             = "chrome"
								backgroundColor = {Color4.create(1, 1, 1, 1)}
								textureSrc      = {ICON_TILE_SRC}
								textureMode     = "stretch"
								uiBackground    = {{
									uvs    : repeatUvs(REPEAT_TILES_X, REPEAT_TILES_Y),
									texture: {
										src     : ICON_TILE_SRC,
										wrapMode: 'repeat',
									},
								}}
							/>
							<DemoTextureLabel key="caption" value="<b>Texture · repeat</b>" />
						</DemoSample>

						<DemoSample
							key    = "stretch"
							width  = {PATTERN_WIDTH}
							height = {PATTERN_HEIGHT}
						>
							<Background
								key             = "chrome"
								backgroundColor = {Color4.create(1, 1, 1, 1)}
								textureSrc      = {ICON_TILE_SRC}
								textureMode     = "stretch"
							/>
							<DemoTextureLabel key="caption" value="<b>Texture · stretch</b>" />
						</DemoSample>

						<DemoSample
							key    = "nine-slice"
							width  = {PATTERN_WIDTH}
							height = {PATTERN_HEIGHT}
						>
							<Background
								key             = "chrome"
								backgroundColor = {Color4.create(1, 1, 1, 1)}
								borderWidth     = {0}
								borderRadius    = {0}
								textureSrc      = {LOGO_SRC}
								textureMode     = "nine-slices"
								textureSlices   = {{
									top   : LOGO_SLICE,
									right : LOGO_SLICE,
									bottom: LOGO_SLICE,
									left  : LOGO_SLICE,
								}}
							/>
							<DemoTextureLabel key="caption" value="<b>Texture · nine-slice</b>" />
						</DemoSample>
					</Column>

					<Column
						key            = "gradients"
						cols           = {6}
						height         = "100%"
						alignItems     = "stretch"
						justifyContent = "flex-start"
						padding        = {{ left: 8 }}
					>
						<Row key="heading" margin={{ bottom: 4 }}>
							<Label cols={12} value="Background gradients" />
						</Row>

						<DemoSample>
							<BackgroundGradient
								key             = "chrome"
								backgroundColor = {theme.colors.primary}
								direction       = "top"
							/>
							<DemoCaption key="caption" value="Primary · top" />
						</DemoSample>

						<DemoSample>
							<BackgroundGradient
								key             = "chrome"
								backgroundColor = {theme.colors.danger}
								direction       = "bottom"
							/>
							<DemoCaption key="caption" value="Danger · bottom" />
						</DemoSample>

						<DemoSample>
							<BackgroundGradient
								key             = "chrome"
								backgroundColor = {theme.colors.info}
								direction       = "left"
							/>
							<DemoCaption key="caption" value="Info · left" />
						</DemoSample>

						<DemoSample>
							<BackgroundGradient
								key             = "chrome"
								backgroundColor = {theme.colors.success}
								direction       = "right"
							/>
							<DemoCaption key="caption" value="Success · right" />
						</DemoSample>
					</Column>
				</Row>
			</Column>,
		]
	}
}

export const demoBackgroundsLayer = new DemoBackgroundsLayer()
