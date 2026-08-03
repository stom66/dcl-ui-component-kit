import { layers } from './layers'
import { theme } from './theme'

export { theme } from './theme'
export { layers } from './layers'


/**
 * Clean the Club theme bundle.
 * Switch the active theme in `src/index.ts`.
 */
export const cleanTheClub = {
	theme,
	layers,
}
