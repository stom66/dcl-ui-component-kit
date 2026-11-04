#!/usr/bin/env python3
"""
Build duck-font-awesome-*.ttf for the UI Component Kit from Font Awesome Free 7.

Tuned for Unity Explorer `fontSrc` loading:
  - Prefer desktop OTFs (CFF → TrueType glyf)
  - Drop GSUB/GPOS/GDEF after conversion (match working FA web TTF table set;
    icons use cmap PUA codepoints, not ligatures)
  - removeOverlaps after cu2qu (needs skia-pathops) so Unity SDF atlas
    generation does not drop messy cutout glyphs
  - Recalculate maxp / glyph bounds; add a simple gasp table
  - Rename families for SIL OFL Reserved Font Name compliance

Requires: pip install fonttools cu2qu brotli skia-pathops

Usage:
  # Drop desktop OTFs / fa-solid-900.ttf into scripts/fa-desktop-sources/ (gitignored):
  python scripts/convert-fa-fonts.py

  # Or point at a webfonts / otfs folder:
  python scripts/convert-fa-fonts.py path/to/otfs
"""

from __future__ import annotations

import sys
from pathlib import Path

from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont, newTable

try:
	from fontTools.ttLib.removeOverlaps import removeOverlaps
except ImportError:  # pragma: no cover — pathops optional at runtime
	removeOverlaps = None


# Absolute cu2qu tolerance in font units (FA upem is 512 → ~0.1% of EM).
MAX_ERR = 0.5

# Tables kept on the shipped TTF (same core set as FA Free web .ttf).
KEEP_TABLES = frozenset({
	'GlyphOrder',
	'OS/2',
	'cmap',
	'glyf',
	'head',
	'hhea',
	'hmtx',
	'loca',
	'maxp',
	'name',
	'post',
	'gasp',
})

# MARK: FONTS
# Solid: prefer native FA6 TrueType when present — Unity FontEngine / SDF atlas
# drops some FA7 CFF→glyf cutout glyphs (medal, compass, …) as tofu while peers
# render fine. Regular / brands stay FA7 OTF→TTF. Icon catalog remains FA7.
# Drop `fa-solid-900.ttf` into scripts/fa-desktop-sources/ (gitignored) or pass its folder.
FONTS = (
	(
		(
			'fa-solid-900.ttf',
			'Font Awesome 7 Free-Solid-900.otf',
			'fa-solid-900.woff2',
		),
		'duck-font-awesome-solid.ttf',
		'DuckFa7FreeSolid',
		'Solid',
	),
	(
		(
			'Font Awesome 7 Free-Regular-400.otf',
			'fa-regular-400.woff2',
			'fa-regular-400.ttf',
		),
		'duck-font-awesome-regular.ttf',
		'DuckFa7FreeRegular',
		'Regular',
	),
	(
		(
			'Font Awesome 7 Brands-Regular-400.otf',
			'fa-brands-400.woff2',
			'fa-brands-400.ttf',
		),
		'duck-font-awesome-brands.ttf',
		'DuckFa7Brands',
		'Regular',
	),
)


# MARK: glyphs_to_quadratic
def glyphs_to_quadratic(glyphs, max_err=MAX_ERR, reverse_direction=True):
	"""Convert CFF cubic glyphs to TrueType quadratic glyphs."""
	quad_glyphs = {}
	for gname in glyphs.keys():
		glyph  = glyphs[gname]
		tt_pen = TTGlyphPen(glyphs)
		cu_pen = Cu2QuPen(tt_pen, max_err, reverse_direction=reverse_direction)
		glyph.draw(cu_pen)
		quad_glyphs[gname] = tt_pen.glyph()
	return quad_glyphs


# MARK: update_hmtx
def update_hmtx(tt_font, glyf):
	"""Sync hmtx LSB with glyf xMin after conversion."""
	hmtx = tt_font['hmtx']
	for glyph_name, glyph in glyf.glyphs.items():
		if hasattr(glyph, 'xMin'):
			hmtx[glyph_name] = (hmtx[glyph_name][0], glyph.xMin)


# MARK: add_gasp
def add_gasp(tt_font: TTFont) -> None:
	"""Add a permissive gasp table for grayscale / gridfit at all sizes."""
	gasp = newTable('gasp')
	gasp.version = 1
	# rangeMaxPPEM → flags: 0x000F = gridfit + gray + symmetric smoothing/gridfit
	gasp.gaspRange = {0xFFFF: 0x000F}
	tt_font['gasp'] = gasp


# MARK: prune_tables
def prune_tables(tt_font: TTFont) -> list[str]:
	"""Remove tables outside the Unity-friendly core set. Returns removed names."""
	removed = []
	for tag in list(tt_font.keys()):
		if tag not in KEEP_TABLES:
			del tt_font[tag]
			removed.append(tag)
	return removed


# MARK: ensure_truetype
def ensure_truetype(tt_font: TTFont) -> bool:
	"""
	Ensure TrueType glyf outlines. Returns True when outlines were converted
	(CFF → glyf); False when the source was already TrueType.
	"""
	tt_font.flavor = None
	if 'CFF ' not in tt_font:
		return False

	assert tt_font.sfntVersion == 'OTTO'

	glyph_order = tt_font.getGlyphOrder()
	tt_font['loca'] = newTable('loca')
	tt_font['glyf'] = glyf = newTable('glyf')
	glyf.glyphOrder = glyph_order
	glyf.glyphs = glyphs_to_quadratic(tt_font.getGlyphSet())
	del tt_font['CFF ']
	if 'VORG' in tt_font:
		del tt_font['VORG']
	glyf.compile(tt_font)
	update_hmtx(tt_font, glyf)

	# Rebuild maxp as TrueType v1.0 — compile() fills maxPoints / maxContours / …
	tt_font['maxp'] = maxp = newTable('maxp')
	maxp.tableVersion = 0x00010000
	maxp.numGlyphs = len(glyph_order)
	maxp.maxZones = 1
	maxp.maxTwilightPoints = 0
	maxp.maxStorage = 0
	maxp.maxFunctionDefs = 0
	maxp.maxInstructionDefs = 0
	maxp.maxStackElements = 0
	maxp.maxSizeOfInstructions = 0
	maxp.maxComponentElements = 0
	maxp.maxComponentDepth = 0
	maxp.compile(tt_font)

	post = tt_font['post']
	post.formatType = 2.0
	post.extraNames = []
	post.mapping = {}
	post.glyphOrder = glyph_order
	try:
		post.compile(tt_font)
	except OverflowError:
		post.formatType = 3
		print('convert-fa-fonts: dropping glyph names (post overflow)', file=sys.stderr)

	tt_font.sfntVersion = '\000\001\000\000'

	return True


# MARK: simplify_overlaps
def simplify_overlaps(tt_font: TTFont) -> bool:
	"""
	Run removeOverlaps on TrueType outlines. Required for native FA TTFs as well
	as CFF→glyf output — Unity FontEngine / SDFAA can drop self-overlapping
	glyphs (e.g. gift U+F06B) as tofu even when cmap + contours look fine.
	Returns True when overlaps were simplified.
	"""
	if 'glyf' not in tt_font:
		return False
	if removeOverlaps is None:
		print(
			'convert-fa-fonts: skia-pathops not installed; skip removeOverlaps '
			'(pip install skia-pathops)',
			file=sys.stderr,
		)
		return False
	removeOverlaps(tt_font)
	update_hmtx(tt_font, tt_font['glyf'])
	return True


# MARK: rename_font
def rename_font(tt_font, family: str, style: str) -> None:
	"""Replace name table records to satisfy OFL Reserved Font Name rules."""
	full_name = f'{family} {style}'
	name = tt_font['name']
	replacements = {
		1 : family,
		2 : style,
		3 : f'{family}:0',
		4 : full_name,
		6 : family,
		16: family,
		17: style,
	}
	for name_id, value in replacements.items():
		name.setName(value, name_id, 3, 1, 0x409)
		name.setName(value, name_id, 1, 0, 0)


# MARK: find_source
def find_source(search_dirs: list[Path], candidates: tuple[str, ...]) -> Path | None:
	"""Return the first existing candidate path under search_dirs."""
	for directory in search_dirs:
		for name in candidates:
			path = directory / name
			if path.is_file():
				return path
	return None


# MARK: convert_one
def convert_one(
	src: Path,
	dest: Path,
	family: str,
	style: str,
) -> None:
	"""Build one Unity-friendly renamed TTF from a FA Free source file."""
	font = TTFont(str(src), recalcBBoxes=True)
	converted = ensure_truetype(font)
	# Always simplify — native FA solid skips cu2qu but still ships overlaps (gift).
	simplified = simplify_overlaps(font)
	removed = prune_tables(font)
	add_gasp(font)
	rename_font(font, family, style)
	# Force bounds / checksums to match glyf after conversion
	font.recalcTimestamp = True
	font.save(str(dest))

	check = TTFont(str(dest))
	cmap = check.getBestCmap() or {}
	mode = 'CFF->glyf' if converted else 'already-glyf'
	if simplified:
		mode += '+removeOverlaps'
	note = ''
	if dest.name == 'duck-font-awesome-solid.ttf' and src.suffix.lower() == '.ttf':
		note = ' [native TT — preferred for Unity solid]'
	elif dest.name == 'duck-font-awesome-solid.ttf' and converted:
		note = ' [CFF→glyf — some cutout icons may tofu in Unity; add fa-solid-900.ttf]'
	print(
		f'convert-fa-fonts: {src.name} -> {dest.name} '
		f'({family}, {mode}, glyphs={check["maxp"].numGlyphs}, '
		f'cmap={len(cmap)}, dropped={removed or ["none"]}){note}'
	)
	assert 'glyf' in check and 'CFF ' not in check
	assert check.sfntVersion == '\x00\x01\x00\x00'


# MARK: main
def main(argv: list[str]) -> int:
	"""Convert FA Free fonts into assets/fonts/duck-font-awesome-*.ttf."""
	repo = Path(__file__).resolve().parents[1]
	out_dir = repo / 'assets' / 'fonts'
	src_dir = repo / 'scripts' / 'fa-desktop-sources'
	out_dir.mkdir(parents=True, exist_ok=True)

	# Prefer dedicated sources dir — never leave OTFs under assets/fonts (scene content).
	search: list[Path] = [src_dir, out_dir]
	if len(argv) >= 2:
		search.insert(0, Path(argv[1]))

	ok = True
	for candidates, dest_name, family, style in FONTS:
		src = find_source(search, candidates)
		if src is None:
			print(
				f'convert-fa-fonts: missing source for {dest_name} '
				f'(tried {", ".join(candidates)} in {[str(d) for d in search]})',
				file=sys.stderr,
			)
			ok = False
			continue
		try:
			convert_one(src, out_dir / dest_name, family, style)
		except Exception as err:
			print(f'convert-fa-fonts: failed {src.name}: {err}', file=sys.stderr)
			ok = False

	return 0 if ok else 1


if __name__ == '__main__':
	raise SystemExit(main(sys.argv))
