import ReactEcs from '@dcl/sdk/react-ecs'
import { openExternalUrl } from '~system/RestrictedActions'

import { alpha, AvatarIcon, Background, Column, DEFAULT_AVATAR_USER_ID, FontAwesome, GAME_ICONS_BUILD, GameIcon, getTheme, H2, Icon, Label, Layer, Row, Text, ZoneType, type Theme } from '../../../../ui-component-kit'
import { exampleIconsAtlas } from '../../atlases'

const FONT_AWESOME_ICONS_URL = 'https://fontawesome.com/search?o=r&m=free'
const GAME_ICONS_URL         = 'https://game-icons.net'

/** Common DCL-game FA sample — 3×6 grid (not the full Free catalog). */
const GAME_FA_ICONS = [
	'heart', 'star', 'coins', 'trophy', 'fire', 'bolt',
	'key', 'gem', 'crown', 'gift', 'compass', 'clock',
	'users', 'shield', 'rocket', 'bomb', 'gamepad', 'dice',
] as const

/** game-icons.net sample — 2×6 grid (not the full set). */
const GAME_ICONS_SAMPLE = [
	'crossed-swords', 'health-potion', 'magic-swirl', 'treasure-map', 'dragon-head', 'wizard-staff',
	'skull-crossed-bones', 'open-treasure-chest', 'two-coins', 'laurel-crown', 'castle', 'rolling-dices',
] as const

const ATLAS_SAMPLE = [
	'catButt', 'dclLogo', 'pigeonCowboy', 'pigeonWalk',
	'pigeonWaiter', 'pigeonBiker', 'pigeonGolfer', 'pigeonTracksuit',
	'pigeonBowler', 'pigeonHoodie', 'pigeonFancy', 'pigeonStreet',
] as const

const AVATAR_USER_A = '0xcec7e38e088a87d77f2b60fcae6840d00e018155'
const AVATAR_USER_B = '0x327f74101F930c76653FD11aC7C8BA3C8694678f'

const AVATAR_SIZE = 48
const FA_SIZE     = AVATAR_SIZE
const ATLAS_SIZE  = 48


// MARK: chunk
/** Split `items` into rows of `size` (last row may be shorter). */
function chunk<T>(items: readonly T[], size: number): T[][] {
	const rows: T[][] = []
	for (let i = 0; i < items.length; i += size) {
		rows.push(items.slice(i, i + size) as T[])
	}
	return rows
}


// MARK: ExampleCodeChip
/**
 * Muted grey rounded chip for example snippets (not the primary/orange section title).
 */
function ExampleCodeChip({
	keyName,
	value,
	theme,
}: {
	keyName: string
	value  : string
	theme  : Theme
}) {
	return (
		<Label
			key             = {keyName}
			cols            = {12}
			value           = {value}
			font            = "monospace"
			fontSize        = {theme.typography.size.code}
			fontColor       = {theme.colors.light}
			textAlign       = "middle-left"
			textWrap        = "nowrap"
			backgroundColor = {alpha(theme.colors.dark, 0.5)}
			borderRadius    = {theme.border.radiusSmall}
			padding         = {{ top: 6, right: 10, bottom: 6, left: 10 }}
		/>
	)
}


// MARK: openFontAwesomeIcons
/** Opens the Font Awesome Free icon browser (player confirms via Explorer). */
function openFontAwesomeIcons() {
	void openExternalUrl({ url: FONT_AWESOME_ICONS_URL })
}


// MARK: openGameIcons
/** Opens game-icons.net (player confirms via Explorer). */
function openGameIcons() {
	void openExternalUrl({ url: GAME_ICONS_URL })
}


// MARK: DemoIconsLayer
/**
 * Demo panel for AvatarIcon, FontAwesome + GameIcon (TTF), custom atlas `Icon`, and tint.
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
				width : '48vw',
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
				spacing        = {10}
				alignItems     = "flex-start"
				justifyContent = "flex-start"
				padding        = {{ top: 14, right: 20, bottom: 16, left: 20 }}
			>
				<H2 key="title" value="Icons" />
				<Text
					key      = "intro"
					value    = "This kit supports AvatarIcon, FontAwesome and GameIcon out of the box. Custom icons are also supported — see the documentation for more info on adding your own. Font Awesome and game-icons.net have far more icons than we show here — browse them at the links below."
					fontSize = {theme.typography.size.small}
				/>
				<Text
					key       = "fa-icons-link"
					value     = "fontawesome.com/icons"
					fontSize  = {theme.typography.size.small}
					fontColor = {theme.colors.info}
					width     = "auto"
					textWrap  = "nowrap"
					onMouseDown = {openFontAwesomeIcons}
					margin    = {{ top: 2 }}
				/>
				<Text
					key         = "game-icons-link"
					value       = "game-icons.net"
					fontSize    = {theme.typography.size.small}
					fontColor   = {theme.colors.info}
					width       = "auto"
					textWrap    = "nowrap"
					onMouseDown = {openGameIcons}
					margin      = {{ bottom: 4 }}
				/>

				{/* AvatarIcon | FontAwesome */}
				<Row key="row-avatar-fa" justifyContent="flex-start" alignItems="flex-start" spacing={12} margin={{ top: 4 }}>
					<Column key="avatar-col" cols={6} spacing={8} alignItems="flex-start">
						<Label key="avatar-label" cols={12} value="AvatarIcon" />
						<ExampleCodeChip
							keyName = "avatar-code"
							theme   = {theme}
							value   = {'<AvatarIcon userId="…" />'}
						/>
						<Row key="avatar-row-default" justifyContent="flex-start" alignItems="center" spacing={8}>
							<AvatarIcon key="avatar-default-plain" userId={DEFAULT_AVATAR_USER_ID} width={AVATAR_SIZE} height={AVATAR_SIZE} />
							<AvatarIcon
								key          = "avatar-default-round"
								userId       = {DEFAULT_AVATAR_USER_ID}
								width        = {AVATAR_SIZE}
								height       = {AVATAR_SIZE}
								borderRadius = {AVATAR_SIZE / 2}
								borderWidth  = {2}
								borderColor  = {alpha(theme.colors.light, 0.8)}
							/>
							<AvatarIcon
								key             = "avatar-default-chip"
								userId          = {DEFAULT_AVATAR_USER_ID}
								width           = {AVATAR_SIZE}
								height          = {AVATAR_SIZE}
								borderRadius    = {theme.border.radiusDefault}
								borderWidth     = {2}
								borderColor     = {alpha(theme.colors.info, 0.8)}
								backgroundColor = {alpha(theme.colors.info, 0.8)}
							/>
						</Row>
						<Row key="avatar-row-a" justifyContent="flex-start" alignItems="center" spacing={8}>
							<AvatarIcon key="avatar-a-plain" userId={AVATAR_USER_A} width={AVATAR_SIZE} height={AVATAR_SIZE} />
							<AvatarIcon
								key          = "avatar-a-round"
								userId       = {AVATAR_USER_A}
								width        = {AVATAR_SIZE}
								height       = {AVATAR_SIZE}
								borderRadius = {AVATAR_SIZE / 2}
								borderWidth  = {2}
								borderColor  = {alpha(theme.colors.light, 0.8)}
							/>
							<AvatarIcon
								key             = "avatar-a-chip"
								userId          = {AVATAR_USER_A}
								width           = {AVATAR_SIZE}
								height          = {AVATAR_SIZE}
								borderRadius    = {theme.border.radiusDefault}
								borderWidth     = {2}
								borderColor     = {alpha(theme.colors.primary, 0.8)}
								backgroundColor = {alpha(theme.colors.primary, 0.8)}
							/>
						</Row>
						<Row key="avatar-row-b" justifyContent="flex-start" alignItems="center" spacing={8}>
							<AvatarIcon key="avatar-b-plain" userId={AVATAR_USER_B} width={AVATAR_SIZE} height={AVATAR_SIZE} />
							<AvatarIcon
								key          = "avatar-b-round"
								userId       = {AVATAR_USER_B}
								width        = {AVATAR_SIZE}
								height       = {AVATAR_SIZE}
								borderRadius = {AVATAR_SIZE / 2}
								borderWidth  = {2}
								borderColor  = {alpha(theme.colors.light, 0.8)}
							/>
							<AvatarIcon
								key             = "avatar-b-chip"
								userId          = {AVATAR_USER_B}
								width           = {AVATAR_SIZE}
								height          = {AVATAR_SIZE}
								borderRadius    = {theme.border.radiusDefault}
								borderWidth     = {2}
								borderColor     = {alpha(theme.colors.danger, 0.8)}
								backgroundColor = {alpha(theme.colors.danger, 0.8)}
							/>
						</Row>
					</Column>

					<Column key="fa-col" cols={6} spacing={8} alignItems="flex-start">
						<Label key="fa-label" cols={12} value="FontAwesome" />
						<ExampleCodeChip
							keyName = "fa-code"
							theme   = {theme}
							value   = {`<FontAwesome icon="star" fontSize={${FA_SIZE}} />`}
						/>
						{chunk(GAME_FA_ICONS, 6).map((row, rowIndex) => (
							<Row
								key            = {`fa-row-${rowIndex}`}
								justifyContent = "flex-start"
								alignItems     = "center"
								spacing        = {8}
							>
								{row.map((icon) => (
									<FontAwesome key={`fa-${icon}`} icon={icon} fontSize={FA_SIZE} />
								))}
							</Row>
						))}
					</Column>
				</Row>

				{/* Custom atlas | Color */}
				<Row key="row-atlas-color" justifyContent="flex-start" alignItems="flex-start" spacing={12} margin={{ top: 8 }}>
					<Column key="atlas-col" cols={6} spacing={8} alignItems="flex-start">
						<Label key="atlas-label" cols={12} value="Custom icons" />
						<ExampleCodeChip
							keyName = "atlas-code"
							theme   = {theme}
							value   = {'<Icon src={exampleIconsAtlas.source} uvs={…} />'}
						/>
						{chunk(ATLAS_SAMPLE, 6).map((row, rowIndex) => (
							<Row
								key            = {`atlas-row-${rowIndex}`}
								justifyContent = "flex-start"
								alignItems     = "center"
								spacing        = {8}
							>
								{row.map((name) => (
									<Icon
										key    = {`atlas-${name}`}
										src    = {exampleIconsAtlas.source}
										uvs    = {exampleIconsAtlas.uv[name]}
										width  = {ATLAS_SIZE}
										height = {ATLAS_SIZE}
									/>
								))}
							</Row>
						))}
					</Column>

					<Column key="color-col" cols={6} spacing={8} alignItems="flex-start">
						<Label key="color-label" cols={12} value="Color" />
						<ExampleCodeChip
							keyName = "color-code"
							theme   = {theme}
							value   = {'<FontAwesome icon="star" fontColor={…} />'}
						/>
						<Row key="fa-color-row" justifyContent="flex-start" alignItems="center" spacing={8}>
							<FontAwesome key="fa-color-primary" icon="star" fontSize={FA_SIZE} fontColor={theme.colors.primary} />
							<FontAwesome key="fa-color-danger" icon="star" fontSize={FA_SIZE} fontColor={theme.colors.danger} />
							<FontAwesome key="fa-color-light" icon="star" fontSize={FA_SIZE} fontColor={theme.colors.light} />
							<FontAwesome key="fa-color-success" icon="heart" fontSize={FA_SIZE} fontColor={theme.colors.success} />
							<FontAwesome key="fa-color-warning" icon="bolt" fontSize={FA_SIZE} fontColor={theme.colors.warning} />
							<FontAwesome key="fa-color-info" icon="gem" fontSize={FA_SIZE} fontColor={theme.colors.info} />
						</Row>
					</Column>
				</Row>

				{/* GameIcon | GameIcon color */}
				<Row key="row-game-icons" justifyContent="flex-start" alignItems="flex-start" spacing={12} margin={{ top: 8 }}>
					<Column key="gi-col" cols={6} spacing={8} alignItems="flex-start">
						<Label key="gi-label" cols={12} value="GameIcon" />
						<ExampleCodeChip
							keyName = "gi-code"
							theme   = {theme}
							value   = {`<GameIcon icon="crossed-swords" fontSize={${FA_SIZE}} />`}
						/>
						{chunk(GAME_ICONS_SAMPLE, 6).map((row, rowIndex) => (
							<Row
								key            = {`gi-row-${rowIndex}`}
								justifyContent = "flex-start"
								alignItems     = "center"
								spacing        = {8}
							>
								{row.map((icon) => (
									<GameIcon key={`gi-${icon}`} icon={icon} fontSize={FA_SIZE} />
								))}
							</Row>
						))}
					</Column>

					<Column key="gi-color-col" cols={6} spacing={8} alignItems="flex-start">
						<Label key="gi-color-label" cols={12} value="GameIcon color" />
						<ExampleCodeChip
							keyName = "gi-color-code"
							theme   = {theme}
							value   = {'<GameIcon icon="health-potion" fontColor={…} />'}
						/>
						<Row key="gi-color-row" justifyContent="flex-start" alignItems="center" spacing={8}>
							<GameIcon key="gi-color-primary" icon="crossed-swords" fontSize={FA_SIZE} fontColor={theme.colors.primary} />
							<GameIcon key="gi-color-danger" icon="health-potion" fontSize={FA_SIZE} fontColor={theme.colors.danger} />
							<GameIcon key="gi-color-light" icon="wizard-staff" fontSize={FA_SIZE} fontColor={theme.colors.light} />
							<GameIcon key="gi-color-success" icon="laurel-crown" fontSize={FA_SIZE} fontColor={theme.colors.success} />
							<GameIcon key="gi-color-warning" icon="two-coins" fontSize={FA_SIZE} fontColor={theme.colors.warning} />
							<GameIcon key="gi-color-info" icon="magic-swirl" fontSize={FA_SIZE} fontColor={theme.colors.info} />
						</Row>
						<Text
							key         = "gi-credit"
							value       = {`Icons by Lorc, Delapouite & contributors — game-icons.net, CC BY 3.0. Fonts built ${GAME_ICONS_BUILD.builtAt} from ${GAME_ICONS_BUILD.upstreamCommit.slice(0, 7)}.`}
							fontSize    = {theme.typography.size.small}
							fontColor   = {alpha(theme.colors.light, 0.7)}
							onMouseDown = {openGameIcons}
						/>
					</Column>
				</Row>
			</Column>,
		]
	}
}

export const demoIconsLayer = new DemoIconsLayer()
