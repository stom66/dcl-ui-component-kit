import { FONT_AWESOME_ALIASES, FONT_AWESOME_ICONS, type FontAwesomeIconEntry, type FontAwesomeStyle } from './fontAwesome.icons'


/**
 * Scene-relative TTF paths for the kit's converted Font Awesome Free faces.
 * Run `npx @stom66/dcl-ui-component-kit copy-assets` so these land in the scene.
 */
export const FONT_AWESOME_FONT_SRC: Record<FontAwesomeStyle, string> = {
	solid  : 'assets/fonts/duck-font-awesome-solid.ttf',
	regular: 'assets/fonts/duck-font-awesome-regular.ttf',
	brands : 'assets/fonts/duck-font-awesome-brands.ttf',
}


export type ResolvedFontAwesomeIcon = {
	/** Canonical kebab-case name. */
	name   : string
	style  : FontAwesomeStyle
	/** Single-character string for `uiText.value`. */
	glyph  : string
	fontSrc: string
	entry  : FontAwesomeIconEntry
}


// MARK: normalizeIconName
/** Trim and strip optional `fa-` prefix. */
export function normalizeIconName(name: string): string {
	let key = name.trim()
	if (key.startsWith('fa-')) {
		key = key.slice(3)
	}
	return key
}


// MARK: resolveCanonicalName
/** Map camelCase / alias / kebab name to a key in `FONT_AWESOME_ICONS`. */
export function resolveCanonicalName(name: string): string | undefined {
	const key = normalizeIconName(name)
	if (FONT_AWESOME_ICONS[key]) {
		return key
	}
	const viaAlias = FONT_AWESOME_ALIASES[key]
	if (viaAlias && FONT_AWESOME_ICONS[viaAlias]) {
		return viaAlias
	}
	return undefined
}


// MARK: pickStyle
/**
 * Prefer `requested` when available, else `solid`, else the first free style.
 */
export function pickStyle(
	entry    : FontAwesomeIconEntry,
	requested?: FontAwesomeStyle,
): FontAwesomeStyle | undefined {
	if (requested && entry.styles.includes(requested)) {
		return requested
	}
	if (entry.styles.includes('solid')) {
		return 'solid'
	}
	return entry.styles[0]
}


// MARK: unicodeToGlyph
/** Hex codepoint string (e.g. `f005`) → JS glyph string. */
export function unicodeToGlyph(unicodeHex: string): string {
	const code = parseInt(unicodeHex, 16)
	if (!Number.isFinite(code)) {
		return ''
	}
	return String.fromCodePoint(code)
}


// MARK: resolveFontAwesomeIcon
/**
 * Resolve an icon name (+ optional style) to glyph, font path, and metadata.
 * Returns `undefined` when the name is unknown.
 */
export function resolveFontAwesomeIcon(
	name     : string,
	style?   : FontAwesomeStyle,
): ResolvedFontAwesomeIcon | undefined {
	const canonical = resolveCanonicalName(name)
	if (!canonical) {
		return undefined
	}
	const entry  = FONT_AWESOME_ICONS[canonical]
	const picked = pickStyle(entry, style)
	if (!picked) {
		return undefined
	}
	return {
		name   : canonical,
		style  : picked,
		glyph  : unicodeToGlyph(entry.unicode),
		fontSrc: FONT_AWESOME_FONT_SRC[picked],
		entry,
	}
}
