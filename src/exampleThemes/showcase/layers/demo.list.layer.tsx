import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, AvatarIcon, Background, Column, darken, DEFAULT_AVATAR_USER_ID, FlashBorder, getTheme, H2, Icon, IconNumber, Layer, lighten, Row, Text, ZoneType, type Theme } from '../../../ui-component-kit'

type ScoreboardIcon = 'crown' | 'cat' | 'ghost'

type ScoreboardEntry = {
	icon?   : ScoreboardIcon
	userId? : string
	name    : string
	score   : number
}


const ICON_SIZE = 28

const SCOREBOARD: ScoreboardEntry[] = [
	{ icon: 'crown', userId: '0x1E93E534C5E26B01Ed242410b43AE23dD0fAA52b', name: 'Albert',      score: 999999999 },
	{ icon: 'cat',   userId: '0x8967ad851ccbd4c1a2d57a128d3c606fcab29bad', name: 'Brutha',      score:  9980 },
	{ icon: 'ghost', userId: '0x1e105bb213754519903788022b962fe2b9c4b263', name: 'Carrot',      score:  1875 },
	{                userId: '0x327f74101F930c76653FD11aC7C8BA3C8694678f', name: 'Detritus',    score:  720 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Esmerelda',   score:  640 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Fred',        score:  505 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Gaspode',     score:  430 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Harry King',  score:  310 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Igorina',     score:  245 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Jimothy',     score:  180 },
]


// MARK: formatScore
/** Formats a score with thousands separators for `IconNumber` (e.g. `1,250`). */
function formatScore(score: number): string {
	return score.toLocaleString('en-US')
}


// MARK: DemoListLayer
/** Demo panel for a scoreboard-style list: rows of fixed column spans. */
export class DemoListLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-list',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '42vw',
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
					spacing        = {8}
					alignItems     = "stretch"
					justifyContent = "flex-start"
					padding        = {{ top: 16, right: 20, bottom: 16, left: 20 }}
				>
					<H2 value="List / Scoreboard" />
					<Text
						value  = "Column of rows — cols 1 + 1 + 1 + 6 + 3. Avatar after rank; ranks and scores use IconNumber. Row 4 uses FlashBorder."
						margin = {{ bottom: 12 }}
					/>
					{SCOREBOARD.map((entry, index) => this.renderRow(entry, index, theme))}
				</Column>
			</Background>
		)
	}


	// MARK: renderRow
	/** One scoreboard row with alternating secondary fill. Row 4 flashes its border. */
	private renderRow(
		entry: ScoreboardEntry,
		index: number,
		theme: Theme,
	) {
		const rank        = index + 1
		const fillLighten = index % 2 === 0 ? 0.35 : 0.2
		const fill        = alpha(theme.colors.secondary, fillLighten)
		const flashBorder = rank === 4

		const row = (
			<Row
				key          = {`score-row-${rank}`}
				color        = {fill}
				borderRadius = {theme.border.radiusDefault}
				borderWidth  = {flashBorder ? theme.border.width : 0}
				borderColor  = {flashBorder ? alpha(lighten(fill, 0.75), 0.5) : undefined}
				alignItems   = "center"
				padding      = {{ top: 6, right: 10, bottom: 6, left: 10 }}
			>
				{/* Icon — cols 1; blank spacer keeps alignment for rows without an icon */}
				<Column
					cols           = {1}
					alignItems     = "flex-start"
					justifyContent = "center"
				>
					{entry.icon ? (
						<Icon
							uvs    = {atlasIconsFontAwesome.uv[entry.icon]}
							width  = {ICON_SIZE}
							height = {ICON_SIZE}
							color  = {rank === 1 ? theme.colors.primary : undefined}
						/>
					) : null}
				</Column>

				{/* Rank — cols 1 */}
				<Column
					cols           = {1}
					alignItems     = "flex-start"
					justifyContent = "center"
				>
					<IconNumber value={rank} height={ICON_SIZE} />
				</Column>

				{/* Avatar — cols 1 */}
				<Column
					cols           = {1}
					alignItems     = "flex-start"
					justifyContent = "center"
				>
					<AvatarIcon
						userId = {entry.userId}
						width  = {ICON_SIZE}
						height = {ICON_SIZE}
					/>
				</Column>

				{/* Name — cols 6; nowrap so short names stay on one line in the row */}
				<Column
					cols           = {6}
					alignItems     = "flex-start"
					justifyContent = "center"
				>
					<Text
						value    = {entry.name}
						textWrap = "nowrap"
					/>
				</Column>

				{/* Score — cols 3, right-aligned */}
				<Column
					cols           = {3}
					alignItems     = "flex-end"
					justifyContent = "center"
				>
					<IconNumber value={formatScore(entry.score)} height={ICON_SIZE} />
				</Column>
			</Row>
		)

		if (!flashBorder) return row

		return (
			<FlashBorder
				key           = {`score-row-flash-${rank}`}
				id            = {`score-row-flash-${rank}`}
				duration      = {0.5}
				burstCount    = {2}
				burstInterval = {1}
				color         = {theme.colors.primary}
			>
				{row}
			</FlashBorder>
		)
	}
}

export const demoListLayer = new DemoListLayer()
