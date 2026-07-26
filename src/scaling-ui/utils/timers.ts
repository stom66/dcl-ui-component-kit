/*
	Original author: unknown

	This script was taken from an example repo for the new auth servers. 
	I like it, so I've used it here.
	If the OA wants to lay claim to this please let me know and I'll happily 
	add attribution.
*/

import { engine, IEngine } from '@dcl/sdk/ecs'

export type Timers   = ReturnType<typeof createTimers>
export type Callback = () => void
export type TimerId  = number

const createTimers = (targetEngine: IEngine) => {
	type TimerData = {
		accumulatedTime: number
		interval       : number
		recurrent      : boolean
		callback       : Callback
	}
	
	const timers: Map<TimerId, TimerData> = new Map()
	let timerIdCounter = 0
	
	const sys_timers = (dt: number) => {
		const deadTimers = []
		const callbacks  = []
		
		for (const [timerId, timerData] of timers) {
			timerData.accumulatedTime += 1000 * dt
			if (timerData.accumulatedTime < timerData.interval) continue
			
			callbacks.push(timerData.callback)
			
			if (timerData.recurrent) {
				timerData.accumulatedTime -= Math.floor(timerData.accumulatedTime / timerData.interval) * timerData.interval
			} else {
				deadTimers.push(timerId)
			}
		}
		
		for (const timerId of deadTimers) timers.delete(timerId)
			
		for (const callback of callbacks) callback()
	}
	
	targetEngine.addSystem(sys_timers, 100e3 + 256)
	
	return {
		//MARK: setTimeout
		setTimeout(
			callback    : Callback, 
			milliseconds: number
		): TimerId {
			if (milliseconds <= 0) {
				callback()
				return 0
			}

			const timerId = timerIdCounter++
			timers.set(timerId, { 
				callback       : callback, 
				interval       : milliseconds, 
				recurrent      : false, 
				accumulatedTime: 0 
			})
			return timerId
		},

		//MARK: clearTimeout
		clearTimeout(
			timer: TimerId
		) {
			timers.delete(timer)
		},
		
		//MARK: setInterval
		setInterval(
			callback    : Callback, 
			milliseconds: number
		): TimerId {
			const timerId = timerIdCounter++
			timers.set(timerId, { 
				callback       : callback, 
				interval       : milliseconds, 
				recurrent      : true, 
				accumulatedTime: 0 
			})
			return timerId
		},

		//MARK: clearInterval
		clearInterval(
			timer: TimerId
		) {
			timers.delete(timer)
		}
	}
}

export const timers = createTimers(engine)
