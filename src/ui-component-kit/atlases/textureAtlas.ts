import { getUVCell, type GetUVCellOptions } from '../utils/uvs'


export type AtlasLayout = string[]

/** Matches SDK `TextureWrapType` — kept local so atlases stay free of react-ecs. */
export type AtlasTextureWrapMode = 'repeat' | 'clamp' | 'mirror'

/** Matches SDK `TextureFilterType`. */
export type AtlasTextureFilterMode = 'point' | 'bi-linear' | 'tri-linear'

/** Ready-to-spread `uiBackground.texture` object from an atlas. */
export type AtlasTexture = {
	src         : string
	wrapMode    : AtlasTextureWrapMode
	filterMode? : AtlasTextureFilterMode
}

export type AtlasCell = {
	/** 1-based column (left → right). */
	col: number
	/** 1-based UV row (bottom → top). */
	row: number
}

export type TextureAtlasCellOptions = Omit<GetUVCellOptions, 'xTotal' | 'yTotal'>

export type TextureAtlasNamedCell = TextureAtlasCellOptions

/**
 * Nine-slice margins as fractions of the texture (0–1), matching SDK
 * `uiBackground.textureSlices`. Used by `ButtonImage` with
 * `textureMode: 'nine-slices'`.
 */
export type AtlasTextureSlices = {
	top   : number
	bottom: number
	left  : number
	right : number
}

/**
 * Per-glyph inset for `char()`. A number is uniform inset on both axes
 * (`inset` / `insetX` / `insetY`); an object uses the same fields as `cell()`.
 */
export type TextureAtlasCharInset =
	| number
	| Omit<TextureAtlasCellOptions, 'xStart' | 'xEnd' | 'yStart' | 'yEnd'>

export type TextureAtlasOptions<
	TNamed extends Record<string, TextureAtlasNamedCell> = Record<string, never>,
> = {
	/** Texture path used in `uiBackground.texture.src` / Icon `src`. */
	source  : string
	/** Column count in the atlas grid. */
	columns : number
	/** Row count in the atlas grid. */
	rows    : number
	/**
	 * Optional nine-slice margins for `uiBackground.textureSlices`.
	 * When set, `ButtonImage` uses native `textureMode: 'nine-slices'`.
	 */
	textureSlices? : AtlasTextureSlices
	/**
	 * Default uniform inset (both axes) for `cell` / `row` / `column` / `char`
	 * when the call does not pass its own inset. Overridden per-axis by
	 * `insetX` / `insetY` when those are set (same rules as `getUVCell`).
	 */
	inset?  : number
	/** Default X-axis inset; falls back to `inset` when omitted. */
	insetX? : number
	/** Default Y-axis inset; falls back to `inset` when omitted. */
	insetY? : number
	/**
	 * Texture wrap mode for the whole sheet. Defaults to `'clamp'` so UV samples
	 * near cell edges do not bleed into neighbouring atlas cells.
	 */
	wrapMode?   : AtlasTextureWrapMode
	/**
	 * Optional resampling mode for the whole sheet (`'point'` | `'bi-linear'` |
	 * `'tri-linear'`). When omitted, the SDK default (bi-linear) applies.
	 */
	filterMode? : AtlasTextureFilterMode
	/**
	 * Optional character layout (top → bottom as seen in the PNG).
	 * Enables `char()`.
	 */
	layout? : AtlasLayout
	/** Glyph aliases resolved before layout lookup (e.g. `*` → `x`). */
	aliases?: Record<string, string>
	/**
	 * Optional per-glyph inset overrides for `char()`. Applied after the atlas
	 * default and call-site options so sparse cells (e.g. `,`) can crop tighter
	 * than `IconNumber`'s theme `horizontalInset`.
	 *
	 * @example
	 * charInsets: { ',': 0.35, ':': { insetX: 0.3 } }
	 */
	charInsets?: Record<string, TextureAtlasCharInset>
	/**
	 * Named regions (1-based cell options). Stored on the instance as
	 * `atlas.named.<name>`; precomputed quads as `atlas.uv.<name>`.
	 */
	named?  : TNamed
}


// MARK: findAtlasCell
/**
 * Locates a character in a top→bottom atlas layout string grid.
 * Returns 1-based column and 1-based UV row (bottom → top).
 *
 * @param layout - Row strings as seen in the PNG (top row first)
 * @param char   - Glyph to find
 * @returns `{ col, row }` (1-based) or `null` when missing
 */
export function findAtlasCell(
	layout: AtlasLayout,
	char  : string,
): AtlasCell | null {
	for (let i = 0; i < layout.length; i++) {
		const col = layout[i].indexOf(char)
		if (col === -1) continue
		return {
			col: col + 1,
			row: layout.length - i,
		}
	}
	return null
}


// MARK: TextureAtlas
/**
 * Describes a texture atlas grid: source path, dimensions, optional glyph
 * layout, and named UV shortcuts. Use `cell` / `row` / `column` / `char`
 * instead of passing `xTotal` / `yTotal` at every call site.
 *
 * Cell / row / column indexes are **1-based** (first cell is `1`, not `0`).
 */
export class TextureAtlas<
	TNamed extends Record<string, TextureAtlasNamedCell> = Record<string, never>,
> {
	readonly source     : string
	readonly columns    : number
	readonly rows       : number
	readonly wrapMode   : AtlasTextureWrapMode
	readonly filterMode?: AtlasTextureFilterMode
	readonly layout?    : AtlasLayout
	/** Optional nine-slice margins for native `textureMode: 'nine-slices'`. */
	readonly textureSlices?: AtlasTextureSlices
	/**
	 * Named cell options as declared in the constructor (`xStart` / `yStart` / …).
	 * Pass to `uvCell` / `.cell()` — e.g. `atlas.named.yellowOrange`.
	 */
	readonly named  : { readonly [K in keyof TNamed]: TNamed[K] }
	/**
	 * Precomputed UV quads for each named region.
	 * Pass to `uvs` props — e.g. `atlas.uv.coin`.
	 */
	readonly uv     : { readonly [K in keyof TNamed]: number[] }

	private readonly defaultInset : number
	private readonly defaultInsetX?: number
	private readonly defaultInsetY?: number
	private readonly aliases      : Record<string, string>
	private readonly charInsets   : Record<string, TextureAtlasCharInset>
	/** Stable UV quads for `char()` — new arrays every frame leak ReactEcs entities. */
	private readonly charCache    = new Map<string, number[]>()


	constructor(options: TextureAtlasOptions<TNamed>) {
		this.source        = options.source
		this.columns       = options.columns
		this.rows          = options.rows
		this.textureSlices = options.textureSlices
		this.wrapMode      = options.wrapMode ?? 'clamp'
		this.filterMode    = options.filterMode
		this.layout        = options.layout
		this.defaultInset  = options.inset ?? 0
		this.defaultInsetX = options.insetX
		this.defaultInsetY = options.insetY
		this.aliases       = options.aliases ?? {}
		this.charInsets    = options.charInsets ?? {}

		const named = options.named ?? ({} as TNamed)
		const uv    = {} as { [K in keyof TNamed]: number[] }

		for (const key of Object.keys(named) as (keyof TNamed)[]) {
			uv[key] = this.cell(named[key])
		}

		this.named = named
		this.uv    = uv
	}


	// MARK: texture
	/**
	 * `uiBackground.texture` object for this atlas (`src` + `wrapMode` + optional
	 * `filterMode`). Prefer this over `{ src: atlas.source }` so wrap/filter apply.
	 * Partial overrides merge cleanly via `mergeUiBackground`.
	 */
	get texture(): AtlasTexture {
		return {
			src     : this.source,
			wrapMode: this.wrapMode,
			...(this.filterMode !== undefined ? { filterMode: this.filterMode } : {}),
		}
	}


	// MARK: resolveCharInset
	/**
	 * Normalizes a `charInsets` entry. Numbers expand to uniform
	 * `inset` / `insetX` / `insetY` so they override call-site axis insets.
	 */
	private resolveCharInset(
		glyph: string,
	): Omit<TextureAtlasCellOptions, 'xStart' | 'xEnd' | 'yStart' | 'yEnd'> {
		const entry = this.charInsets[glyph]
		if (entry === undefined) {
			return {}
		}
		if (typeof entry === 'number') {
			return {
				inset : entry,
				insetX: entry,
				insetY: entry,
			}
		}
		return entry
	}


	// MARK: charInsetX
	/**
	 * Effective horizontal inset for a glyph after aliases + `charInsets`.
	 * Matches the X crop `char()` will apply when called with `insetX: baseInsetX`.
	 *
	 * @param char       - Character or digit to look up
	 * @param baseInsetX - Call-site / theme inset used when the glyph has no override
	 */
	charInsetX(
		char       : string | number,
		baseInsetX : number = 0,
	): number {
		const glyph      = this.aliases[String(char)] ?? String(char)
		const glyphInset = this.resolveCharInset(glyph)
		const merged     = {
			insetX: baseInsetX,
			...glyphInset,
		}
		return merged.insetX ?? merged.inset ?? this.defaultInsetX ?? this.defaultInset
	}


	// MARK: atlasInsetDefaults
	/**
	 * Atlas-level inset defaults for `getUVCell`. Axis defaults are omitted
	 * when unset so a call-site uniform `inset` still applies to both axes.
	 */
	private atlasInsetDefaults(): Pick<TextureAtlasCellOptions, 'inset' | 'insetX' | 'insetY'> {
		return {
			inset: this.defaultInset,
			...(this.defaultInsetX !== undefined ? { insetX: this.defaultInsetX } : {}),
			...(this.defaultInsetY !== undefined ? { insetY: this.defaultInsetY } : {}),
		}
	}


	// MARK: cell
	/**
	 * UV quad for a cell (or inclusive cell range). Uses this atlas's
	 * `columns` / `rows` so callers omit `xTotal` / `yTotal`.
	 *
	 * Coordinates are **1-based inclusive** — first cell is
	 * `{ xStart: 1, yStart: 1 }`.
	 *
	 * Inset merge: atlas `inset` / `insetX` / `insetY` → call-site `options`
	 * (same axis rules as `getUVCell`: `insetX ?? inset`, `insetY ?? inset`).
	 *
	 * @param options - Cell selection / inset (no `xTotal` / `yTotal`)
	 * @returns Flat UV quad
	 */
	cell(options: TextureAtlasCellOptions = {}): number[] {
		const uniformOverride = options.inset !== undefined
		return getUVCell({
			...this.atlasInsetDefaults(),
			...options,
			// Uniform call-site `inset` clears atlas axis defaults for unset axes
			// so `insetX ?? inset` / `insetY ?? inset` in getUVCell apply evenly.
			...(uniformOverride && options.insetX === undefined ? { insetX: undefined } : {}),
			...(uniformOverride && options.insetY === undefined ? { insetY: undefined } : {}),
			xTotal: this.columns,
			yTotal: this.rows,
		})
	}


	// MARK: row
	/**
	 * UV quad for a full-width row.
	 *
	 * @param row     - 1-based UV row (bottom → top; bottom row is `1`)
	 * @param options - Optional inset overrides
	 * @returns Flat UV quad spanning every column on that row
	 */
	row(
		row    : number,
		options: Omit<TextureAtlasCellOptions, 'xStart' | 'xEnd' | 'yStart' | 'yEnd'> = {},
	): number[] {
		return this.cell({
			...options,
			xStart: 1,
			xEnd  : this.columns,
			yStart: row,
		})
	}


	// MARK: column
	/**
	 * UV quad for a full-height column.
	 *
	 * @param column  - 1-based column (left → right; first column is `1`)
	 * @param options - Optional inset overrides
	 * @returns Flat UV quad spanning every row in that column
	 */
	column(
		column : number,
		options: Omit<TextureAtlasCellOptions, 'xStart' | 'xEnd' | 'yStart' | 'yEnd'> = {},
	): number[] {
		return this.cell({
			...options,
			xStart: column,
			yStart: 1,
			yEnd  : this.rows,
		})
	}


	// MARK: char
	/**
	 * Whether `char` resolves via `layout` (after aliases).
	 *
	 * @param char - Character or digit to look up
	 */
	hasChar(char: string | number): boolean {
		if (!this.layout) {
			return false
		}
		const glyph = this.aliases[String(char)] ?? String(char)
		return findAtlasCell(this.layout, glyph) !== null
	}


	/**
	 * UV quad for one glyph from `layout`. No-ops with an error log when the
	 * atlas has no layout or the glyph is missing.
	 *
	 * Merge order for insets: atlas `inset` → call-site `options` →
	 * `charInsets[glyph]` (per-glyph wins).
	 *
	 * @param char    - Character or digit to look up
	 * @param options - Optional inset overrides
	 * @returns Flat UV quad for that glyph, or `[]` on failure
	 */
	char(
		char   : string | number,
		options: Omit<TextureAtlasCellOptions, 'xStart' | 'yStart' | 'xEnd' | 'yEnd'> = {},
	): number[] {
		if (!this.layout) {
			console.error('TextureAtlas.char: atlas has no layout', this.source)
			return []
		}

		const glyph      = this.aliases[String(char)] ?? String(char)
		const glyphInset = this.resolveCharInset(glyph)
		const merged     = {
			...options,
			...glyphInset,
		}
		const cacheKey = [
			glyph,
			merged.inset       ?? '',
			merged.insetX      ?? '',
			merged.insetY      ?? '',
			merged.insetLeft   ?? '',
			merged.insetRight  ?? '',
			merged.insetTop    ?? '',
			merged.insetBottom ?? '',
		].join('|')

		const cached = this.charCache.get(cacheKey)
		if (cached) return cached

		const cell = findAtlasCell(this.layout, glyph)
		if (!cell) {
			console.error('TextureAtlas.char: character not in layout', glyph, this.source)
			return []
		}

		const uvs = this.cell({
			...merged,
			xStart: cell.col,
			yStart: cell.row,
		})
		this.charCache.set(cacheKey, uvs)
		return uvs
	}
}
