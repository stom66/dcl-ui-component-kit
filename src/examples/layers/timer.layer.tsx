import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { PropsController } from 'src/scaling-ui/classes/propsController'
import { UiBox } from 'src/scaling-ui/components'
import { Layer } from 'src/scaling-ui/components/layers'
import { ZoneType } from 'src/scaling-ui/components/zones/zone.presets'
import { getTheme } from 'src/scaling-ui/styles'
import { timers } from 'src/scaling-ui/utils/timers'


// MARK: getSecondsRemainingInMinute
/** Seconds left until the next wall-clock minute. */
function getSecondsRemainingInMinute(): number {
	return 60 - new Date().getSeconds()
}


// MARK: TimerLayer
/**
 * Example top-bar countdown: seconds remaining in the current minute.
 * Uses ZoneType.BarTop; size/chrome overrides go through Layer → Zone props.
 */
export class TimerLayer extends Layer {
	constructor() {
		const theme = getTheme()

		super({
			id          : 'timer',
			zone        : ZoneType.Top,
			showFrame   : true,
			uiBackground: {
				color: theme.colors.primary,
			},
			uiTransform: {
				width       : '15vw',
				height      : '5vw',
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
			<UiBox
				key="timer-value"
				uiTransform={{
					width : '100%',
					height: '100%',
				}}
				uiText={{
					value    : String(seconds),
					fontSize : scaleFontSize(theme.typography.size.h1),
					font     : theme.typography.family.default,
					color    : theme.colors.light,
					textAlign: 'middle-center',
				}}
			/>
		)
	}
}

export const timerLayer = new TimerLayer()
