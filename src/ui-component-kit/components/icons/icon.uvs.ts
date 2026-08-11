import { getRotatedUVs, getUVCell } from '../../utils'


/** Full-texture UV quad — used when rotating without an explicit cell. */
const FULL_TEXTURE_UVS = getUVCell({ xStart: 1, yStart: 1, xTotal: 1, yTotal: 1 })

/** Stable rotated quads — new arrays every frame leak ReactEcs entities. */
const rotatedUvCache = new Map<string, number[]>()


// MARK: resolveIconRotatedUvs
/**
 * Applies a static UV rotation (degrees) around the quad centre.
 * When `rotate` is set and `uvs` is missing / not an 8-value quad, uses the
 * full texture. Returns `uvs` unchanged when `rotate` is omitted or `0`.
 */
export function resolveIconRotatedUvs(
	uvs   : number[] | undefined,
	rotate: number | undefined,
): number[] | undefined {
	if (rotate === undefined || rotate === 0) {
		return uvs
	}

	const base = (uvs && uvs.length === 8) ? uvs : FULL_TEXTURE_UVS
	const key  = `${base.join(',')}|${rotate}`
	let cached = rotatedUvCache.get(key)
	if (!cached) {
		cached = getRotatedUVs(base, rotate)
		rotatedUvCache.set(key, cached)
	}
	return cached
}
