import { GAME_ICON_AUTHOR_INDEX, GAME_ICON_AUTHORS, GAME_ICON_IDS, GAME_ICONS_BUILD, type GameIconAuthor, type GameIconId } from './gameIcons.icons'


/** Scene-relative TTF path (copied into the scene by `copy-assets`). */
export const GAME_ICONS_FONT_SRC: string = GAME_ICONS_BUILD.fontSrc


export type ResolvedGameIcon = {
	/** Canonical id (`crossed-swords`, or `author/name` for a duplicated name). */
	id       : GameIconId
	/** Contributor folder on game-icons.net — credit them (CC BY 3.0). */
	author   : GameIconAuthor
	/** Position in `GAME_ICON_IDS`. */
	index    : number
	/** Unicode codepoint in the Private Use Area. */
	codepoint: number
	/** Single-character string for `uiText.value`. */
	glyph    : string
	/** Scene-relative path for `uiText.fontSrc`. */
	fontSrc  : string
}


// MARK: kebabToCamel
function kebabToCamel(name: string): string {
	const parts = name.split('-')
	return parts[0] + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')
}


let lookup: Map<string, number> | undefined


// MARK: getLookup
/**
 * Lazily built name → index map. Accepts the canonical id, `author/name` for any
 * icon, and a camelCase form of the canonical id (`crossedSwords`).
 */
function getLookup(): Map<string, number> {
	if (lookup) {
		return lookup
	}
	const map = new Map<string, number>()
	for (let i = 0; i < GAME_ICON_IDS.length; i++) {
		const id     = GAME_ICON_IDS[i]
		const author = GAME_ICON_AUTHORS[GAME_ICON_AUTHOR_INDEX[i]]
		const slash  = id.indexOf('/')
		const bare   = slash >= 0 ? id.slice(slash + 1) : id
		map.set(id, i)
		map.set(`${author}/${bare}`, i)
		if (slash < 0) {
			const camel = kebabToCamel(id)
			if (!map.has(camel)) {
				map.set(camel, i)
			}
		}
	}
	lookup = map
	return map
}


// MARK: normalizeGameIconName
/** Trim and strip optional `game-icons:` (Iconify) / `gi-` prefixes. */
export function normalizeGameIconName(name: string): string {
	let key = name.trim()
	if (key.startsWith('game-icons:')) {
		key = key.slice('game-icons:'.length)
	} else if (key.startsWith('gi-')) {
		key = key.slice(3)
	}
	return key
}


// MARK: resolveGameIcon
/**
 * Resolve a Game Icons name to glyph, font path and author. Returns `undefined`
 * when the name is unknown.
 */
export function resolveGameIcon(name: string): ResolvedGameIcon | undefined {
	const index = getLookup().get(normalizeGameIconName(name))
	if (index === undefined) {
		return undefined
	}
	const codepoint = GAME_ICONS_BUILD.codepointStart + index
	return {
		id       : GAME_ICON_IDS[index],
		author   : GAME_ICON_AUTHORS[GAME_ICON_AUTHOR_INDEX[index]],
		index,
		codepoint,
		glyph    : String.fromCodePoint(codepoint),
		fontSrc  : GAME_ICONS_FONT_SRC,
	}
}


// MARK: gameIconUrl
/** game-icons.net page for an icon (preview, SVG/PNG download, author credit). */
export function gameIconUrl(name: string): string | undefined {
	const resolved = resolveGameIcon(name)
	if (!resolved) {
		return undefined
	}
	const slash = resolved.id.indexOf('/')
	const bare  = slash >= 0 ? resolved.id.slice(slash + 1) : resolved.id
	return `https://game-icons.net/1x1/${resolved.author}/${bare}.html`
}
