import ReactEcs from '@dcl/sdk/react-ecs'
import { Background, getTheme, Layer, PropsController, Text, ZoneType } from '../../../ui-component-kit'
import { timers } from '../../../ui-component-kit/utils/timers'

// MARK: getSecondsRemainingInMinute
/** Seconds left until the next wall-clock minute. */
function getSecondsRemainingInMinute(): number {
	return 60 - new Date().getSeconds()
}


// MARK: TimerLayer
/**
 * Example top-bar countdown: seconds remaining in the current minute.
 * Uses ZoneType.Top; size overrides go through Layer → Zone props.
 * Chrome (fill / border) is a sibling empty `Background` in `body()`.
 */
export class TimerLayer extends Layer {
	constructor() {
		super({
			id  : 'timer',
			zone: ZoneType.Top,
			uiTransform: {
				width : '15vw',
				height: '5vw',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			secondsRemaining: getSecondsRemainingInMinute(),
		})

		timers.setInterval(() => {
			if (!this.props) {
				console.error('TimerLayer: tick: props controller missing')
				return
			}
			this.props.set('secondsRemaining', getSecondsRemainingInMinute())
		}, 250)
	}


	// MARK: body
	protected body() {
		if (!this.props) {
			console.error('TimerLayer.body: props controller missing')
			return null
		}

		const theme   = getTheme()
		const seconds = this.props.get('secondsRemaining') as number

		return [
			<Background key="chrome" backgroundColor={theme.colors.primary} />,
			<Text
				key       = "timer-value"
				value     = {String(seconds).padStart(2, '0')}
				fontSize  = {theme.typography.size.h2}
				fontColor = {theme.colors.light}
				textAlign = "middle-center"
			/>,
		]
	}
}

export const timerLayer = new TimerLayer()
