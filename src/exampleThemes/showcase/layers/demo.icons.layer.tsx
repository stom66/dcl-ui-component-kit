import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, AvatarIcon, Background, Code, Column, DEFAULT_AVATAR_USER_ID, getTheme, H2, Icon, IconCharacter, IconNumber, IconString, IconSymbol, Label, Layer, PropsController, Row, Text, ZoneType } from '../../../ui-component-kit'
import { timers } from '../../../ui-component-kit/utils/timers'

/** 4×8 sample from `atlasIconsFontAwesome` (full sheet is 16×16 / 256 cells). */
const SAMPLE_ICONS = [
	'cat', 'star', 'heart', 'coins',
	'crown', 'dice', 'rocket', 'trophy',
	'fire', 'cubes', 'gear', 'bolt',
	'gem', 'key', 'shield', 'skull',
	'gamepad', 'bomb', 'ghost', 'dragon',
	'gift', 'medal', 'compass', 'bell',
] as const

const COUNTDOWN_SECONDS = 3 * 60


// MARK: formatClock
/** Formats total seconds as `MM:SS` with leading zeros (always 5 glyphs). */
function formatClock(totalSeconds: number): string {
	const clamped = Math.max(0, Math.floor(totalSeconds))
	const minutes = Math.floor(clamped / 60)
	const seconds = clamped % 60
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}


// MARK: DemoIconsLayer
/**
 * Demo panel for Font Awesome icons, AvatarIcon, and atlas glyph text
 * (`IconNumber` / `IconCharacter` / `IconSymbol` / `IconString`).
 */
export class DemoIconsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-icons',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '52vw',
				height: 'auto',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			countdownSeconds: COUNTDOWN_SECONDS,
		})

		timers.setInterval(() => {
			if (!this.props) {
				console.error('DemoIconsLayer: tick: props controller missing')
				return
			}
			const current = this.props.get('countdownSeconds') as number
			const next    = current <= 0 ? COUNTDOWN_SECONDS : current - 1
			this.props.set('countdownSeconds', next)
		}, 1000)
	}


	// MARK: body
	protected body() {
		if (!this.props) {
			console.error('DemoIconsLayer.body: props controller missing')
			return null
		}

		const theme     = getTheme()
		const countdown = this.props.get('countdownSeconds') as number

		return [
			<Background key="chrome" />,
			<Column
				key            = "body"
				cols           = {12}
				spacing        = {6}
				alignItems     = "flex-start"
				justifyContent = "flex-start"
				padding        = {{ top: 12, right: 20, bottom: 16, left: 20 }}
			>
					<H2 value="Icons" />
					<Text value="Named Font Awesome cells via atlas.uv.<name>, AvatarIcon portraits, and atlas glyph text for scores / labels." />

					{/* MARK: Font Awesome named shortcut */}
					<Label
						cols   = {12}
						value  = "Icons - Font Awesome"
						margin = {{ top: 8, bottom: 8 }}
					/>
					<Row
						justifyContent = "flex-start"
						alignItems     = "center"
						margin         = {{ bottom: 4 }}
					>
						<Column cols = {8}>
							<Row>
								<Text
									value    = "This kit ships 256 Font Awesome icons - use atlasIconsFontAwesome.uv.<name>."
									fontSize = {theme.typography.size.small}
									margin   = {{ top: 6 }}
								/>
							</Row>

							<Row
								justifyContent = "flex-start"
								alignItems     = "center"
								margin         = {{ bottom: 4 }}
							>
								<Icon
									uvs    = {atlasIconsFontAwesome.uv.cat}
									width  = "64"
									height = "64"
									margin = {{ right: 12 }}
								/>
								<Icon
									uvs    = {atlasIconsFontAwesome.uv.cat}
									width  = "64"
									height = "64"
									rotate = {45}
									margin = {{ right: 12 }}
								/>
								<Code value="<Icon uvs={…} rotate={45} /> — custom art: src + optional uvs" />
							</Row>


							{/* MARK: Tints / avatars / sample grid */}
							<Row
								flexWrap       = "wrap"
								justifyContent = "flex-start"
								alignItems     = "flex-start"
								margin         = {{ top: 8, bottom: 8 }}
							>
								<Column
									cols           = {6}
									alignItems     = "flex-start"
									justifyContent = "flex-start"
									padding        = {{ right: 8 }}
								>
									<Label
										cols   = {12}
										value  = "Icon - Color Tints"
										margin = {{ bottom: 8 }}
									/>
									<Row
										justifyContent = "flex-start"
										alignItems     = "center"
										margin         = {{ bottom: 6 }}
									>
										<Icon
											uvs       = {atlasIconsFontAwesome.uv.star}
											width     = "48"
											height    = "48"
											iconColor = {theme.colors.primary}
											margin    = {{ right: 8 }}
										/>
										<Icon
											uvs       = {atlasIconsFontAwesome.uv.star}
											width     = "48"
											height    = "48"
											iconColor = {theme.colors.danger}
											margin    = {{ right: 8 }}
										/>
										<Icon
											uvs             = {atlasIconsFontAwesome.uv.star}
											width           = "48"
											height          = "48"
											iconColor       = {theme.colors.light}
											backgroundColor = {theme.colors.primary}
											borderRadius    = {8}
											padding         = {{ top: 6, right: 6, bottom: 6, left: 6 }}
										/>
									</Row>
									<Code value="<Icon iconColor={…} backgroundColor={…} />" textWrap="nowrap" />
								</Column>

								<Column
									cols           = {6}
									alignItems     = "flex-start"
									justifyContent = "flex-start"
									padding        = {{ right: 4, left: 4 }}
								>
									<Label
										cols   = {12}
										value  = "Avatar Icons"
										margin = {{ bottom: 8 }}
									/>
									<Row
										justifyContent = "flex-start"
										alignItems     = "center"
										margin         = {{ bottom: 6 }}
									>
										<AvatarIcon
											userId = {DEFAULT_AVATAR_USER_ID}
											width  = {48}
											height = {48}
										/>
										<AvatarIcon
											userId       = {DEFAULT_AVATAR_USER_ID}
											width        = {48}
											height       = {48}
											borderRadius = {24}
											borderWidth  = {2}
											borderColor  = {alpha(theme.colors.light, 0.8)}
										/>
										<AvatarIcon
											userId       = {DEFAULT_AVATAR_USER_ID}
											width        = {48}
											height       = {48}
											borderRadius = {theme.border.radiusDefault}
											borderWidth  = {2}
											borderColor  = {alpha(theme.colors.info, 0.8)}
										/>
										<AvatarIcon
											userId          = {DEFAULT_AVATAR_USER_ID}
											width           = {48}
											height          = {48}
											borderRadius    = {theme.border.radiusDefault}
											borderWidth     = {2}
											borderColor     = {alpha(theme.colors.info, 0.8)}
											backgroundColor = {alpha(theme.colors.info, 0.8)}
										/>
									</Row>
									<Code value={'<AvatarIcon userId="…" />'} textWrap="nowrap" />
								</Column>

							</Row>
							
						</Column>
						<Column cols = {4}>
							{this.renderSampleGrid()}							
						</Column>
					</Row>	

					

					{/* MARK: Atlas glyph examples */}
					<Row
						flexWrap       = "wrap"
						justifyContent = "flex-start"
						alignItems     = "flex-start"
					>
						<Column
							cols           = {4}
							spacing        = {6}
							alignItems     = "flex-start"
							justifyContent = "flex-start"
							padding        = {{ right: 8 }}
						>
							<Label cols={12} value="IconNumber" margin={{ bottom: 4 }} />
							<Text
								value    = "Countdown timer (MM:SS) — digits from the alphanumeric atlas, colon from symbols."
								fontSize = {theme.typography.size.small}
							/>
							<Column
								cols           = {12}
								alignItems     = "center"
								justifyContent = "center"
								borderWidth    = {theme.border.width}
								borderRadius   = {theme.border.radiusDefault}
								borderColor    = {alpha(theme.colors.light, 0.2)}
								backgroundColor          = {alpha(theme.colors.primary, 0.35)}
								padding        = {{ top: 10, right: 12, bottom: 10, left: 12 }}
								margin         = {{ top: 4, bottom: 6 }}
							>
								<IconNumber value={formatClock(countdown)} height={36} />
							</Column>
							<Text value="Score / formula:" fontSize={theme.typography.size.small} />
							<IconNumber value="+120/2=60" height={28} />
							<Row justifyContent="flex-start" alignItems="center" margin={{ top: 4 }}>
								<IconNumber value={42} height={28} iconColor={theme.colors.primary} margin={{ right: 8 }} />
								<IconNumber value={42} height={28} iconColor={theme.colors.danger} margin={{ right: 8 }} />
								<IconNumber value={42} height={28} iconColor={theme.colors.success} />
							</Row>
							<Code value={'<IconNumber value={42} iconColor={…} />'} textWrap="nowrap" />
						</Column>

						<Column
							cols           = {4}
							spacing        = {6}
							alignItems     = "flex-start"
							justifyContent = "flex-start"
							padding        = {{ right: 4, left: 4 }}
						>
							<Label cols={12} value="IconCharacter" margin={{ bottom: 4 }} />
							<Text
								value    = "Letters from atlasCharsAlphaNumeric (a–z, A–Z, 0–9)."
								fontSize = {theme.typography.size.small}
							/>
							<IconCharacter value="HELLO" height={28} />
							<IconCharacter value="Player1" height={28} iconColor={theme.colors.primary} />
							<IconCharacter value="WAVE 3" height={28} iconColor={theme.colors.success} />
							<Code value={'<IconCharacter value="HELLO" iconColor={…} />'} textWrap="nowrap" />
						</Column>

						<Column
							cols           = {4}
							spacing        = {6}
							alignItems     = "flex-start"
							justifyContent = "flex-start"
							padding        = {{ left: 8 }}
						>
							<Label cols={12} value="IconSymbol / IconString" margin={{ bottom: 4 }} />
							<Text
								value    = "Symbols alone, or IconString when you need mixed letters + punctuation."
								fontSize = {theme.typography.size.small}
							/>
							<IconSymbol value="$%#?!" height={28} iconColor={theme.colors.warning} />
							<IconSymbol value="(@)" height={28} iconColor={theme.colors.primary} />
							<IconString value="HI $120!" height={28} iconColor={theme.colors.danger} />
							<IconString value="A+B=C" height={28} iconColor={theme.colors.success} />
							<Code value={'<IconString value="HI $120!" iconColor={…} />'} textWrap="nowrap" />
						</Column>
					</Row>
			</Column>,
		]
	}


	// MARK: renderSampleGrid
	/** Renders a 4×8 sample of named Font Awesome icons. */
	private renderSampleGrid() {
		const theme = getTheme()

		return (
			<Row
				flexWrap       = "wrap"
				justifyContent = "flex-start"
				alignItems     = "flex-start"
			>
				{SAMPLE_ICONS.map((name) => (
					<Column
						key            = {`icon-sample-${name}`}
						cols           = {3}
						spacing        = {0}
						borderWidth    = {theme.border.width}
						borderRadius   = {theme.border.radiusSmall}
						borderColor    = {alpha(theme.colors.light, 0.12)}
						alignItems     = "center"
						justifyContent = "center"
						padding        = {{ top: 6, right: 2, bottom: 6, left: 2 }}
						minHeight      = {40}
					>
						<Icon
							uvs    = {atlasIconsFontAwesome.uv[name]}
							width  = "26"
							height = "26"
						/>
					</Column>
				))}
			</Row>
		)
	}
}

export const demoIconsLayer = new DemoIconsLayer()
