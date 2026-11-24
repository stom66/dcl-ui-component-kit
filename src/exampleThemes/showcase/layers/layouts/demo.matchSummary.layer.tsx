import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, AvatarIcon, Background, ButtonText, Column, DEFAULT_AVATAR_USER_ID, Divider, getTheme, Label, Layer, ProgressBar, Pulse, Row, showToast, Text, ZoneType } from '../../../../ui-component-kit'

import { BigText, Card, demoClock, FaIcon, type FaIconName, SectionLabel } from './demo.layouts.shared'


const XP_LOOP_SECONDS = 8
const XP_FROM         = 1250
const XP_GAINED       = 1840
const XP_PER_LEVEL    = 2500

type Stat = {
	icon : FaIconName
	label: string
	value: string
}

const STATS: Stat[] = [
	{ icon: 'crosshairs', label: 'Eliminations',   value: '18'    },
	{ icon: 'skull',      label: 'Deaths',         value: '6'     },
	{ icon: 'handFist',   label: 'Assists',        value: '9'     },
	{ icon: 'bullseye',   label: 'Accuracy',       value: '46%'   },
	{ icon: 'burst',      label: 'Damage',         value: '4,210' },
	{ icon: 'flag',       label: 'Objective time', value: '2:31'  },
]

type Reward = {
	icon : FaIconName
	label: string
	color: (theme: ReturnType<typeof getTheme>) => Color4
}

const REWARDS: Reward[] = [
	{ icon: 'coins', label: '+350', color: (t) => t.colors.primary },
	{ icon: 'gem',   label: '+5',   color: (t) => t.colors.info    },
	{ icon: 'medal', label: 'x2',   color: (t) => t.colors.success },
]

type Teammate = {
	userId: string
	name  : string
	kda   : string
}

const TEAMMATES: Teammate[] = [
	{ userId: '0x1E93E534C5E26B01Ed242410b43AE23dD0fAA52b', name: 'Albert', kda: '18 / 6 / 9'  },
	{ userId: '0x8967ad851ccbd4c1a2d57a128d3c606fcab29bad', name: 'Brutha', kda: '11 / 8 / 14' },
	{ userId: '0x1e105bb213754519903788022b962fe2b9c4b263', name: 'Carrot', kda: '9 / 7 / 5'   },
	{ userId: DEFAULT_AVATAR_USER_ID,                       name: 'Fred',   kda: '6 / 10 / 12' },
]


// MARK: DemoMatchSummaryLayer
/**
 * End-of-match screen: result banner, personal stat tiles, MVP card,
 * rewards, an animated XP bar, team K/D/A rows and Play again / Leave actions.
 */
export class DemoMatchSummaryLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-match-summary',
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

		return [
			<Background key="chrome" />,
			<Column
				key            = "body"
				cols           = {12}
				spacing        = {6}
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 16, right: 20, bottom: 16, left: 20 }}
			>
				{this.renderBanner()}

				<Row alignItems="flex-start" spacing={10}>
					<Column cols={7} alignItems="stretch" spacing={6}>
						<SectionLabel value="Your performance" />
						{this.renderStats()}
						<SectionLabel value="Progression" />
						{this.renderXp()}
					</Column>
					<Column cols={5} alignItems="stretch" spacing={6}>
						<SectionLabel value="MVP" color={theme.colors.primary} />
						{this.renderMvp()}
						<SectionLabel value="Rewards" />
						{this.renderRewards()}
					</Column>
				</Row>

				<SectionLabel value="Blue team" color={theme.colors.info} />
				{TEAMMATES.map((mate, i) => this.renderTeammate(mate, i))}

				<Divider margin={{ top: 8, bottom: 8 }} />

				<Row justifyContent="flex-end" spacing={8}>
					<ButtonText
						id              = "demo_match_leave"
						textLabel       = "Leave"
						cols            = {3}
						backgroundColor = {theme.colors.secondary}
						callback        = {() => this.hide()}
					/>
					<ButtonText
						id              = "demo_match_play_again"
						textLabel       = "Play again"
						cols            = {4}
						backgroundColor = {theme.colors.success}
						callback        = {() => showToast({
							position     : 'top',
							duration     : 2,
							isDismissable: true,
							width        : 220,
							height       : 48,
							content      : () => (
								<Label value="Searching for a match…" backgroundColor={theme.colors.success} />
							),
						})}
					/>
				</Row>
			</Column>,
		]
	}


	// MARK: renderBanner
	private renderBanner() {
		const theme = getTheme()

		return (
			<Row
				key             = "banner"
				alignItems      = "center"
				justifyContent  = "center"
				spacing         = {16}
				backgroundColor = {alpha(theme.colors.success, 0.25)}
				borderRadius    = {theme.border.radiusDefault}
				padding         = {{ top: 10, bottom: 10 }}
			>
				<Pulse id="demo_match_trophy_pulse" width={48} height={48} scaleMax={1.15}>
					<FaIcon name="trophy" size={48} color={theme.colors.primary} />
				</Pulse>
				<Column width="auto" alignItems="flex-start">
					<BigText value="VICTORY" size={theme.typography.size.h1} color={theme.colors.success} />
					<Text value="Blue wins 4 – 2  ·  Capture the Flag  ·  12:43" width="auto" textWrap="nowrap" />
				</Column>
			</Row>
		)
	}


	// MARK: renderStats
	/** 3 × 2 stat tiles. */
	private renderStats() {
		const theme = getTheme()
		const rows  = [STATS.slice(0, 3), STATS.slice(3)]

		return rows.map((row, r) => (
			<Row key={`stats_row_${r}`} spacing={6}>
				{row.map((stat) => (
					<Card key={`stat_${stat.label}`} cols={4} padding={8}>
						<FaIcon name={stat.icon} size={22} color={theme.colors.primary} />
						<BigText value={stat.value} size={theme.typography.size.h3} />
						<Text value={stat.label} width="auto" alignSelf="center" textWrap="nowrap" fontSize={theme.typography.size.small} />
					</Card>
				))}
			</Row>
		))
	}


	// MARK: renderXp
	/** XP bar that replays the post-match fill on a loop. */
	private renderXp() {
		const theme    = getTheme()
		const t        = Math.min(1, (demoClock() % XP_LOOP_SECONDS) / (XP_LOOP_SECONDS * 0.5))
		const xp       = XP_FROM + XP_GAINED * t
		const levelUp  = xp >= XP_PER_LEVEL
		const level    = levelUp ? 13 : 12
		const inLevel  = levelUp ? xp - XP_PER_LEVEL : xp

		return (
			<Card key="xp" alignItems="stretch">
				<Row alignItems="center" justifyContent="space-between" margin={{ bottom: 6 }}>
					<Row width="auto" alignItems="center" spacing={6}>
						<FaIcon name="star" size={20} color={theme.colors.primary} />
						<Text value={`Level ${level}`} width="auto" textWrap="nowrap" fontColor={theme.colors.light} />
						{levelUp ? <Label key="lvl_up" value="LEVEL UP!" backgroundColor={theme.colors.success} /> : null}
					</Row>
					<Text value={`+${Math.round(XP_GAINED * t)} XP`} width="auto" textWrap="nowrap" fontColor={theme.colors.success} />
				</Row>
				<ProgressBar
					id           = "demo_match_xp"
					value        = {inLevel}
					maxValue     = {XP_PER_LEVEL}
					height       = {22}
					fillColor    = {theme.colors.primary}
					lerpDuration = {0}
				>
					<Text
						value       = {`${Math.round(inLevel)} / ${XP_PER_LEVEL}`}
						fontSize    = {theme.typography.size.small}
						fontColor   = {theme.colors.light}
						textAlign   = "middle-center"
						textWrap    = "nowrap"
						uiTransform = {{ width: 'auto', alignSelf: 'center' }}
					/>
				</ProgressBar>
			</Card>
		)
	}


	// MARK: renderMvp
	private renderMvp() {
		const theme = getTheme()
		const mvp   = TEAMMATES[0]

		return (
			<Card key="mvp" backgroundColor={alpha(theme.colors.primary, 0.3)}>
				<Row alignItems="center" spacing={12}>
					<AvatarIcon userId={mvp.userId} width={72} height={72} />
					<Column width="auto" alignItems="flex-start">
						<Row width="auto" alignItems="center" spacing={6}>
							<FaIcon name="crown" size={20} color={theme.colors.primary} />
							<Text value={mvp.name} width="auto" textWrap="nowrap" fontSize={theme.typography.size.h4} fontColor={theme.colors.light} />
						</Row>
						<Text value="Most eliminations" width="auto" textWrap="nowrap" fontSize={theme.typography.size.small} />
						<Text value={`K/D/A  ${mvp.kda}`} width="auto" textWrap="nowrap" fontSize={theme.typography.size.small} font={theme.typography.family.code} />
					</Column>
				</Row>
			</Card>
		)
	}


	// MARK: renderRewards
	private renderRewards() {
		const theme = getTheme()

		return (
			<Row key="rewards" spacing={6}>
				{REWARDS.map((reward) => (
					<Card key={`reward_${reward.icon}`} cols={4} padding={8}>
						<FaIcon name={reward.icon} size={28} color={reward.color(theme)} />
						<Text value={reward.label} width="auto" alignSelf="center" textWrap="nowrap" fontColor={theme.colors.light} margin={{ top: 4 }} />
					</Card>
				))}
			</Row>
		)
	}


	// MARK: renderTeammate
	private renderTeammate(mate: Teammate, index: number) {
		const theme = getTheme()

		return (
			<Row
				key             = {`mate_${mate.name}`}
				alignItems      = "center"
				backgroundColor = {alpha(theme.colors.secondary, index % 2 === 0 ? 0.35 : 0.2)}
				borderRadius    = {theme.border.radiusDefault}
				padding         = {{ top: 4, right: 10, bottom: 4, left: 10 }}
			>
				<Column cols={1} alignItems="flex-start" justifyContent="center">
					<AvatarIcon userId={mate.userId} width={26} height={26} />
				</Column>
				<Column cols={6} alignItems="flex-start" justifyContent="center">
					<Text value={mate.name} textWrap="nowrap" />
				</Column>
				<Column cols={5} alignItems="flex-end" justifyContent="center">
					<Text value={mate.kda} textWrap="nowrap" textAlign="middle-right" font={theme.typography.family.code} />
				</Column>
			</Row>
		)
	}
}

export const demoMatchSummaryLayer = new DemoMatchSummaryLayer()
