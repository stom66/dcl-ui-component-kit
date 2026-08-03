import ReactEcs from '@dcl/sdk/react-ecs'
import { Background, getTheme, IconNumber, Layer, PropsController, ZoneType } from '../../../ui-component-kit'
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
 * Chrome (fill / border) comes from `Background` inside `body()`.
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

		return (
			<Background backgroundColor={theme.colors.primary}>
				<IconNumber
					// Fixed width so the digit entity count stays at 2 (no 9↔10 remount churn).
					value  = {String(seconds).padStart(2, '0')}
					height = {"80px"}
				/>
			</Background>
		)
	}
}

export const timerLayer = new TimerLayer()
