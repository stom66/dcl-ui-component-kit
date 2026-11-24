import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, Background, ButtonText, Column, getTheme, H2, Layer, ProgressBar, ProgressBarRadial, PropsController, Row, Text, ZoneType } from '../../../../ui-component-kit'

import { BigText, Card, demoClock, FaIcon, formatClock, SectionLabel } from './demo.layouts.shared'


const ROUND_SECONDS     = 180
const ROUND_COUNT       = 5
const WARNING_SECONDS   = 30
const COUNTDOWN_SECONDS = 10
const RESPAWN_SECONDS   = 6
const NEXT_ROUND_SECS   = 20
const CAPTURE_SECONDS   = [7, 11, 5]
const RADIAL_SIZE       = 64
const CLOCK_HEIGHT      = 44
const SCORE_HEIGHT      = 36

type CapturePoint = {
	letter : string
	owner  : 'blue' | 'red'
}

const CAPTURE_POINTS: CapturePoint[] = [
	{ letter: 'A', owner: 'blue' },
	{ letter: 'B', owner: 'red'  },
	{ letter: 'C', owner: 'blue' },
]


// MARK: DemoTimersLayer
/**
 * Game-status examples built around timers: a match HUD (team scores + round
 * clock), radial and bar countdowns, capture points, and an interactive
 * stopwatch. All clocks derive from one scene clock.
 */
export class DemoTimersLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-timers',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '54vw',
				height: 'auto',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			swRunning: false,
			swStart  : 0,
			swBanked : 0,
			swLaps   : [] as number[],
		})
	}


	// MARK: stopwatch
	private stopwatchSeconds(): number {
		const running = this.props?.get('swRunning') as boolean
		const banked  = this.props?.get('swBanked') as number
		const start   = this.props?.get('swStart') as number
		return running ? banked + (demoClock() - start) : banked
	}

	private toggleStopwatch() {
		if (!this.props) {
			console.error('DemoTimersLayer.toggleStopwatch: props controller missing')
			return
		}
		const running = this.props.get('swRunning') as boolean
		if (running) {
			this.props.set('swBanked', this.stopwatchSeconds())
			this.props.set('swRunning', false)
		} else {
			this.props.set('swStart', demoClock())
			this.props.set('swRunning', true)
		}
	}

	private lapOrReset() {
		if (!this.props) {
			console.error('DemoTimersLayer.lapOrReset: props controller missing')
			return
		}
		const running = this.props.get('swRunning') as boolean
		if (running) {
			const laps = this.props.get('swLaps') as number[]
			this.props.set('swLaps', [this.stopwatchSeconds(), ...laps].slice(0, 3))
		} else {
			this.props.set('swBanked', 0)
			this.props.set('swLaps', [])
		}
	}


	// MARK: body
	protected body() {
		const theme = getTheme()
		const now   = demoClock()

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
				<H2 value="Game Status — Timers" />
				<Text value="Round clocks, countdowns, capture timers and a stopwatch. Everything ticks from a single scene clock." />

				<SectionLabel value="Match HUD — scores + round clock (turns red under 0:30)" />
				{this.renderMatchHud(now)}

				<SectionLabel value="Countdowns — radial, draining bar, inline pill" />
				{this.renderCountdowns(now)}

				<SectionLabel value="Capture points — radial fill tinted by owner" />
				{this.renderCapturePoints(now)}

				<SectionLabel value="Stopwatch — interactive (Start / Stop, Lap / Reset)" />
				{this.renderStopwatch()}
			</Column>,
		]
	}


	// MARK: renderMatchHud
	private renderMatchHud(now: number) {
		const theme     = getTheme()
		const roundTime = now % ROUND_SECONDS
		const remaining = ROUND_SECONDS - roundTime
		const round     = (Math.floor(now / ROUND_SECONDS) % ROUND_COUNT) + 1
		const warning   = remaining <= WARNING_SECONDS
		const blueScore = 2 + Math.floor(roundTime / 47)
		const redScore  = 1 + Math.floor(roundTime / 61)

		const teamBox = (key: string, label: string, score: number, color: Color4, icon: 'shield' | 'skull', flip: boolean) => (
			<Column
				key             = {key}
				cols            = {4}
				height          = {64}
				alignItems      = "stretch"
				justifyContent  = "center"
				backgroundColor = {alpha(color, 0.85)}
				borderRadius    = {theme.border.radiusDefault}
				padding         = {{ left: 12, right: 12 }}
			>
			<Row alignItems="center" justifyContent={flip ? 'flex-end' : 'flex-start'} spacing={10}>
				{flip ? <BigText key="score" value={String(score)} size={SCORE_HEIGHT} /> : <FaIcon key="icon" name={icon} size={28} color={theme.colors.light} />}
				<Text key="label" value={label} width="auto" textWrap="nowrap" fontSize={theme.typography.size.h5} fontColor={theme.colors.light} />
				{flip ? <FaIcon key="icon" name={icon} size={28} color={theme.colors.light} /> : <BigText key="score" value={String(score)} size={SCORE_HEIGHT} />}
			</Row>
			</Column>
		)

		return (
			<Row key="match_hud" alignItems="center" justifyContent="space-between" spacing={8}>
				{teamBox('team_blue', 'BLUE', blueScore, theme.colors.info, 'shield', false)}
				<Column
					cols            = {4}
					height          = {64}
					alignItems      = "center"
					justifyContent  = "center"
					backgroundColor = {alpha(warning ? theme.colors.danger : theme.colors.dark, 0.85)}
					borderRadius    = {theme.border.radiusDefault}
				>
					<Text
						value     = {`ROUND ${round} / ${ROUND_COUNT}`}
						width     = "auto"
						alignSelf = "center"
						textAlign = "middle-center"
						textWrap  = "nowrap"
						fontSize  = {theme.typography.size.small}
						fontColor = {theme.colors.light}
					/>
					<BigText value={formatClock(remaining)} size={CLOCK_HEIGHT * 0.75} />
				</Column>
				{teamBox('team_red', 'RED', redScore, theme.colors.danger, 'skull', true)}
			</Row>
		)
	}


	// MARK: renderCountdowns
	private renderCountdowns(now: number) {
		const theme        = getTheme()
		const cdRemaining  = COUNTDOWN_SECONDS - (now % COUNTDOWN_SECONDS)
		const cdProgress   = cdRemaining / COUNTDOWN_SECONDS
		const rsRemaining  = RESPAWN_SECONDS - (now % RESPAWN_SECONDS)
		const nrRemaining  = NEXT_ROUND_SECS - (now % NEXT_ROUND_SECS)

		return (
			<Row key="countdowns" alignItems="stretch" spacing={8}>
				<Card cols={3}>
					<ProgressBarRadial
						progress  = {cdProgress}
						width     = {RADIAL_SIZE}
						fillColor = {cdRemaining <= 3 ? theme.colors.danger : theme.colors.primary}
					>
						<Text
							value       = {String(Math.ceil(cdRemaining))}
							fontSize    = {theme.typography.size.h3}
							fontColor   = {theme.colors.light}
							textAlign   = "middle-center"
							textWrap    = "nowrap"
							uiTransform = {{ width: 'auto', alignSelf: 'center' }}
						/>
					</ProgressBarRadial>
					<Text value="Match starts" width="auto" alignSelf="center" textWrap="nowrap" fontSize={theme.typography.size.small} margin={{ top: 6 }} />
				</Card>

				<Card cols={5} alignItems="stretch">
					<Row alignItems="center" spacing={8} margin={{ bottom: 8 }}>
						<FaIcon name="skullCrossbones" size={22} color={theme.colors.danger} />
						<Text value="You were eliminated" width="auto" textWrap="nowrap" fontColor={theme.colors.light} />
					</Row>
					<ProgressBar
						id           = "demo_timers_respawn"
						value        = {rsRemaining}
						maxValue     = {RESPAWN_SECONDS}
						height       = {28}
						fillColor    = {theme.colors.danger}
						lerpDuration = {0}
					>
						<Text
							value       = {`Respawn in ${rsRemaining.toFixed(1)}s`}
							fontSize    = {theme.typography.size.small}
							fontColor   = {theme.colors.light}
							textAlign   = "middle-center"
							textWrap    = "nowrap"
							uiTransform = {{ width: 'auto', alignSelf: 'center' }}
						/>
					</ProgressBar>
				</Card>

				<Card cols={4}>
					<Row
						alignItems      = "center"
						justifyContent  = "center"
						spacing         = {8}
						backgroundColor = {theme.colors.warning}
						borderRadius    = {24}
						padding         = {{ top: 8, right: 16, bottom: 8, left: 16 }}
						width           = "auto"
					>
						<FaIcon name="hourglassHalf" size={20} color={theme.colors.light} />
						<Text value="Next round" width="auto" textWrap="nowrap" fontColor={theme.colors.light} />
						<Text value={formatClock(nrRemaining)} width="auto" textWrap="nowrap" fontColor={theme.colors.light} fontSize={theme.typography.size.h5} />
					</Row>
					<Text value="Inline pill — icon + label + clock" width="auto" alignSelf="center" textWrap="nowrap" fontSize={theme.typography.size.small} margin={{ top: 6 }} />
				</Card>
			</Row>
		)
	}


	// MARK: renderCapturePoints
	private renderCapturePoints(now: number) {
		const theme = getTheme()

		return (
			<Row key="capture_points" alignItems="center" justifyContent="space-around" spacing={8}>
				{CAPTURE_POINTS.map((point, index) => {
					const period    = CAPTURE_SECONDS[index]
					const progress  = (now % period) / period
					const color     = point.owner === 'blue' ? theme.colors.info : theme.colors.danger
					const contested = index === 1 && progress > 0.6

					return (
						<Card key={`cp_${point.letter}`} cols={4}>
							<Row alignItems="center" justifyContent="center" spacing={12}>
								<ProgressBarRadial
									progress        = {progress}
									width           = {RADIAL_SIZE}
									fillColor       = {color}
									backgroundColor = {theme.colors.dark}
									borderColor     = {contested ? theme.colors.primary : theme.colors.secondary}
									borderWidth     = {4}
									inset           = {-2}
								>
									<Text
										value       = {point.letter}
										fontSize    = {theme.typography.size.h3}
										fontColor   = {theme.colors.light}
										textAlign   = "middle-center"
										textWrap    = "nowrap"
										uiTransform = {{ width: 'auto', alignSelf: 'center' }}
									/>
								</ProgressBarRadial>
								<Column width="auto" alignItems="flex-start">
									<Text value={contested ? 'CONTESTED' : `${point.owner.toUpperCase()} capturing`} width="auto" textWrap="nowrap" fontColor={contested ? theme.colors.primary : theme.colors.light} />
									<Text value={`${Math.round(progress * 100)}%  ·  ${(period * (1 - progress)).toFixed(1)}s`} width="auto" textWrap="nowrap" fontSize={theme.typography.size.small} />
								</Column>
							</Row>
						</Card>
					)
				})}
			</Row>
		)
	}


	// MARK: renderStopwatch
	private renderStopwatch() {
		const theme   = getTheme()
		const running = this.props?.get('swRunning') as boolean
		const laps    = (this.props?.get('swLaps') as number[]) ?? []
		const time    = this.stopwatchSeconds()

		return (
			<Row key="stopwatch" alignItems="center" spacing={8}>
				<Card cols={5}>
					<Row alignItems="center" justifyContent="center" spacing={10}>
						<FaIcon name="stopwatch" size={30} color={running ? theme.colors.success : theme.colors.tertiary} />
						<BigText value={formatClock(time, true)} size={CLOCK_HEIGHT * 0.8} monospace />
					</Row>
				</Card>
				<Column cols={3} alignItems="stretch" spacing={4}>
					<ButtonText
						key             = {running ? 'sw_stop' : 'sw_start'}
						id              = {running ? 'demo_timers_sw_stop' : 'demo_timers_sw_start'}
						textLabel       = {running ? 'Stop' : 'Start'}
						cols            = {12}
						backgroundColor = {running ? theme.colors.danger : theme.colors.success}
						callback        = {() => this.toggleStopwatch()}
					/>
					<ButtonText
						key             = {running ? 'sw_lap' : 'sw_reset'}
						id              = {running ? 'demo_timers_sw_lap' : 'demo_timers_sw_reset'}
						textLabel       = {running ? 'Lap' : 'Reset'}
						cols            = {12}
						backgroundColor = {theme.colors.secondary}
						callback        = {() => this.lapOrReset()}
					/>
				</Column>
				<Card cols={4} alignItems="stretch">
					<Text value="Laps" fontColor={theme.colors.light} />
					{laps.length === 0
						? <Text key="no_laps" value="—" fontSize={theme.typography.size.small} />
						: laps.map((lap, i) => (
							<Text
								key      = {`lap_${laps.length - i}`}
								value    = {`#${laps.length - i}   ${formatClock(lap, true)}`}
								fontSize = {theme.typography.size.small}
								font     = {theme.typography.family.code}
							/>
						))}
				</Card>
			</Row>
		)
	}
}

export const demoTimersLayer = new DemoTimersLayer()
