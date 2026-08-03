import ReactEcs from '@dcl/sdk/react-ecs'

import { atlasIconsFontAwesome } from '../../atlases'
import { AvatarIcon, Background, Column, DEFAULT_AVATAR_USER_ID, H2, Icon, IconNumber, Row, Text, UiBox } from '../../components'
import { Layer } from '../../components/layers'
import { ZoneType } from '../../components/zones/zone.presets'
import { getTheme, type Theme } from '../../styles'
import { alpha } from '../../utils'


type ScoreboardIcon = 'crown' | 'cat' | 'ghost'

type ScoreboardEntry = {
	icon?   : ScoreboardIcon
	userId? : string
	name    : string
	score   : number
}


const ICON_SIZE = 28

const SCOREBOARD: ScoreboardEntry[] = [
	{ icon: 'crown', userId: '0x1E93E534C5E26B01Ed242410b43AE23dD0fAA52b', name: 'Albert',      score: 1250 },
	{ icon: 'cat',   userId: '0x8967ad851ccbd4c1a2d57a128d3c606fcab29bad', name: 'Brutha',      score:  980 },
	{ icon: 'ghost', userId: '0x1e105bb213754519903788022b962fe2b9c4b263', name: 'Carrot',      score:  875 },
	{                userId: '0x327f74101F930c76653FD11aC7C8BA3C8694678f', name: 'Detritus',    score:  720 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Esmerelda',   score:  640 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Fred :',      score:  505 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Gaspode',     score:  430 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Harry King',  score:  310 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Igorina',     score:  245 },
	{                userId: DEFAULT_AVATAR_USER_ID,                       name: 'Jimothy 🦝',  score:  180 },
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
				height: '70vh',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return (
			<Background>
				<Column
					cols        = {12}
					spacing     = {8}
					uiTransform = {{
						height        : '100%',
						alignItems    : 'stretch',
						justifyContent: 'flex-start',
						padding       : { top: 16, right: 20, bottom: 16, left: 20 },
					}}
				>
					<H2 value="List / Scoreboard" />
					<Text
						value       = "Column of rows — cols 1 + 1 + 1 + 6 + 3. Avatar after rank; ranks and scores use IconNumber."
						uiTransform = {{ margin: { bottom: 12 } }}
					/>
					{SCOREBOARD.map((entry, index) => this.renderRow(entry, index, theme))}
				</Column>
			</Background>
		)
	}


	// MARK: renderRow
	/** One scoreboard row with alternating secondary fill and default radius (no border). */
	private renderRow(
		entry: ScoreboardEntry,
		index: number,
		theme: Theme,
	) {
		const rank      = index + 1
		const fillAlpha = index % 2 === 0 ? 0.6 : 0.8

		return (
			<Row
				key             = {`score-row-${rank}`}
				cols            = {12}
				backgroundColor = {alpha(theme.colors.secondary, fillAlpha)}
				borderRadius    = {theme.border.radiusDefault}
				borderWidth     = {0}
				uiTransform     = {{
					alignItems: 'center',
					padding   : { top: 6, right: 10, bottom: 6, left: 10 },
				}}
			>
				{/* Icon — cols 1; blank spacer keeps alignment for rows without an icon */}
				<Column
					cols={1}
					uiTransform={{
						alignItems    : 'flex-start',
						justifyContent: 'center',
					}}
				>
					{entry.icon ? (
						<Icon
							uvs    = {atlasIconsFontAwesome.uv[entry.icon]}
							width  = {ICON_SIZE}
							height = {ICON_SIZE}
						/>
					) : (
						<UiBox
							uiTransform={{
								width : ICON_SIZE,
								height: ICON_SIZE,
							}}
						/>
					)}
				</Column>

				{/* Rank — cols 1 */}
				<Column
					cols        = {1}
					uiTransform = {{
						alignItems    : 'flex-start',
						justifyContent: 'center',
					}}
				>
					<IconNumber value={rank} height={ICON_SIZE} />
				</Column>

				{/* Avatar — cols 1 */}
				<Column
					cols        = {1}
					uiTransform = {{
						alignItems    : 'flex-start',
						justifyContent: 'center',
					}}
				>
					<AvatarIcon
						userId = {entry.userId}
						width  = {ICON_SIZE}
						height = {ICON_SIZE}
					/>
				</Column>

				{/* Name — cols 6; nowrap so short names stay on one line in the row */}
				<Column
					cols        = {6}
					uiTransform = {{
						alignItems    : 'flex-start',
						justifyContent: 'center',
					}}
				>
					<Text
						value  = {entry.name}
						uiText = {{ textWrap: 'nowrap' }}
					/>
				</Column>

				{/* Score — cols 3, right-aligned */}
				<Column
					cols        = {3}
					uiTransform = {{
						alignItems    : 'flex-end',
						justifyContent: 'center',
					}}
				>
					<IconNumber value={formatScore(entry.score)} height={ICON_SIZE} />
				</Column>
			</Row>
		)
	}
}

export const demoListLayer = new DemoListLayer()
