import { PropsController } from '../../ui-component-kit'


export type SkyChaserGameData = {
	/** True while a match / round is actively running. */
	gameInProgress: boolean
	/** Seconds left on the round timer. */
	timerRemaining: number
	/** Full round length in seconds (progress bar max). */
	timerDuration : number
}


/** Default round length used when starting a game. */
export const DEFAULT_TIMER_DURATION = 60


// MARK: skyChaserGameData
/**
 * Shared SkyChaser game state. Layers (and game logic) read / write this
 * controller so HUD pieces stay in sync without remounting.
 */
export const skyChaserGameData = new PropsController<SkyChaserGameData>({
	gameInProgress: false,
	timerRemaining: DEFAULT_TIMER_DURATION,
	timerDuration : DEFAULT_TIMER_DURATION,
})
