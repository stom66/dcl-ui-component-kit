import { layers } from './layers'
import { theme } from './theme'

export { theme } from './theme'
export { layers } from './layers'
export { skyChaserGameData, DEFAULT_TIMER_DURATION } from './gameData'
export type { SkyChaserGameData } from './gameData'
export { startButtonAtlas, skyChaserProgressBarTextures } from './atlases'


/**
 * SkyChaser theme bundle.
 * Switch the active theme in `src/index.ts`.
 */
export const skyChaser = {
	theme,
	layers,
}
