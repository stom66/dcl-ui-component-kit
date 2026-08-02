import { getUVCell, type GetUVCellOptions } from '../utils/uvs'


export type AtlasLayout = string[]

export type AtlasCell = {
	/** 1-based column (left → right). */
	col: number
	/** 1-based UV row (bottom → top). */
	row: number
}

export type TextureAtlasCellOptions = Omit<GetUVCellOptions, 'xTotal' | 'yTotal'>

export type TextureAtlasNamedCell = TextureAtlasCellOptions

export type TextureAtlasOptions<
	TNamed extends Record<string, TextureAtlasNamedCell> = Record<string, never>,
> = {
	/** Texture path used in `uiBackground.texture.src` / `iconSrc`. */
	source  : string
	/** Column count in the atlas grid. */
	columns : number
	/** Row count in the atlas grid. */
	rows    : number
	/**
	 * Default inset applied to `cell` / `row` / `column` / `char` when the
	 * call does not pass its own inset.
	 */
	inset?  : number
	/**
	 * Optional character layout (top → bottom as seen in the PNG).
	 * Enables `char()`.
	 */
	layout? : AtlasLayout
	/** Glyph aliases resolved before layout lookup (e.g. `*` → `x`). */
	aliases?: Record<string, string>
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
	readonly source : string
	readonly columns: number
	readonly rows   : number
	readonly layout?: AtlasLayout
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

	private readonly defaultInset: number
	private readonly aliases     : Record<string, string>


	constructor(options: TextureAtlasOptions<TNamed>) {
		this.source       = options.source
		this.columns      = options.columns
		this.rows         = options.rows
		this.layout       = options.layout
		this.defaultInset = options.inset ?? 0
		this.aliases      = options.aliases ?? {}

		const named = options.named ?? ({} as TNamed)
		const uv    = {} as { [K in keyof TNamed]: number[] }

		for (const key of Object.keys(named) as (keyof TNamed)[]) {
			uv[key] = this.cell(named[key])
		}

		this.named = named
		this.uv    = uv
	}


	// MARK: cell
	/**
	 * UV quad for a cell (or inclusive cell range). Uses this atlas's
	 * `columns` / `rows` so callers omit `xTotal` / `yTotal`.
	 *
	 * Coordinates are **1-based inclusive** — first cell is
	 * `{ xStart: 1, yStart: 1 }`.
	 *
	 * @param options - Cell selection / inset (no `xTotal` / `yTotal`)
	 * @returns Flat UV quad
	 */
	cell(options: TextureAtlasCellOptions = {}): number[] {
		return getUVCell({
			inset: this.defaultInset,
			...options,
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

		const glyph = this.aliases[String(char)] ?? String(char)
		const cell  = findAtlasCell(this.layout, glyph)
		if (!cell) {
			console.error('TextureAtlas.char: character not in layout', glyph, this.source)
			return []
		}

		return this.cell({
			...options,
			xStart: cell.col,
			yStart: cell.row,
		})
	}
}
