#!/usr/bin/env python3
"""
Build the kit's Game Icons fonts + name lookup from a game-icons/icons checkout.

Source: https://github.com/game-icons/icons (the SVGs behind https://game-icons.net),
licensed CC BY 3.0 (a few contributors CC0). Credit is required — this script
writes assets/fonts/LICENSE-game-icons.md from the upstream license.txt.

Outputs (all regenerated on every run):
  assets/fonts/duck-game-icons.ttf                every icon in one font (copied to scenes by copy-assets)
  assets/fonts/LICENSE-game-icons.md              CC BY 3.0 credits per contributor
  src/ui-component-kit/fonts/gameIcons.icons.ts   searchable name list + build stamp

Glyph pipeline (tuned to match convert-fa-fonts.py for Unity's FontEngine):
  - drop the black 512×512 background square, keep the white icon path
  - flip SVG y-down into font y-up; 1024 upem (SVG units ×2) for precision
  - cubic → quadratic (cu2qu), outer contours clockwise (TrueType convention)
  - removeOverlaps when skia-pathops is installed (strongly recommended)
  - only core tables (no GSUB/GPOS)
  - one visible ASCII glyph ('.'): the asset-bundle converter (abgen) pre-fills each
    font's atlas from ASCII/Latin-1 and REFUSES a font with no outline for any of
    those characters — the scene then silently keeps the built-in font (icons = tofu)
  - checked against the converter's other limits before saving (see check_converter_limits)

Requires: pip install fonttools skia-pathops

Usage:
  git clone --depth 1 https://github.com/game-icons/icons scripts/game-icons-sources
  python scripts/build-game-icons.py
  python scripts/build-game-icons.py path/to/icons-checkout
  python scripts/build-game-icons.py --only crossed-swords,health-potion   # pilot build
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import subprocess
import sys
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.areaPen import AreaPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont, newTable

try:
	from fontTools.ttLib.removeOverlaps import removeOverlaps
except ImportError:  # skia-pathops missing
	removeOverlaps = None


# MARK: constants
CODEPOINT_START = 0xE000        # BMP Private Use Area: U+E000–U+F8FF (6,400 slots)
CODEPOINT_END   = 0xF8FF
UPEM            = 1024
SCALE           = UPEM / 512    # game-icons viewBox is 512×512
# Vertical metrics mirror duck-font-awesome-*.ttf (459 / -75 @ 512 upem) so
# GameIcon and FontAwesome centre identically with textAlign middle-center.
ASCENT          = round(459 * SCALE)
DESCENT         = round(-75 * SCALE)
BASELINE_SHIFT  = 448           # SVG y=0 → font y=448 (512-unit space), like FA glyphs
MAX_ERR         = 0.5 * SCALE   # cu2qu tolerance in font units (~0.05% of the em)

FONT_FILE       = 'duck-game-icons.ttf'
FONT_SRC        = f'assets/fonts/{FONT_FILE}'
FAMILY          = 'DuckGameIcons'
# Folders in the upstream repo that are not part of the game-icons.net set.
SKIP_AUTHOR_DIRS = {'badges'}
# abgen (Explorer asset-bundle converter) limits — crate/src/fontgen in decentraland/abgen.
ABGEN_MAX_FONT_BYTES   = 16 * 1024 * 1024
ABGEN_MAX_GLYPH_POINTS = 8192
ABGEN_MAX_FONT_POINTS  = 4_000_000
# ASCII 0x20–0x7E plus the Latin-1 extras abgen pre-fills; the font must draw at least one.
ABGEN_PREFILL_SAMPLE   = '.'
# Which author keeps the bare name when two contributors use the same filename.
# Everyone else's copy is addressed as `author/name`.
AUTHOR_PRIORITY  = ('lorc', 'delapouite')

SVG_RE = re.compile(
	r'^<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
	r'<path d="M0 0h512v512H0z"/>'
	r'<path fill="#fff" d="(?P<d>[^"]+)"/></svg>\s*$'
)


# MARK: Icon
class Icon:
	"""One upstream SVG: author folder + file stem + icon path data."""

	def __init__(self, author: str, name: str, d: str):
		self.author = author
		self.name   = name
		self.d      = d
		self.id     = name   # canonical id; `author/name` for non-preferred duplicates


# MARK: collect_icons
def collect_icons(src: Path) -> list[Icon]:
	"""Read every author/*.svg under the checkout, skipping non-icon folders."""
	icons: list[Icon] = []
	for author_dir in sorted(p for p in src.iterdir() if p.is_dir()):
		author = author_dir.name
		if author.startswith(('.', '_')) or author in SKIP_AUTHOR_DIRS:
			continue
		for svg in sorted(author_dir.glob('*.svg')):
			text  = svg.read_text(encoding='utf-8')
			match = SVG_RE.match(text)
			if not match:
				print(f'build-game-icons: skip {author}/{svg.name} (unexpected SVG layout)', file=sys.stderr)
				continue
			icons.append(Icon(author, svg.stem, match.group('d')))
	return icons


# MARK: assign_ids
def assign_ids(icons: list[Icon]) -> list[Icon]:
	"""
	Give duplicate names a stable `author/name` id (preferred author keeps the bare
	name) and sort so duplicates sit next to each other. Index in the returned list
	is the glyph index: codepoint = CODEPOINT_START + index.
	"""
	def rank(author: str) -> tuple[int, str]:
		if author in AUTHOR_PRIORITY:
			return (AUTHOR_PRIORITY.index(author), author)
		return (len(AUTHOR_PRIORITY), author)

	icons.sort(key=lambda i: (i.name, rank(i.author)))
	seen: set[str] = set()
	for icon in icons:
		if icon.name in seen:
			icon.id = f'{icon.author}/{icon.name}'
		seen.add(icon.name)
	return icons


# MARK: build_glyph
def build_glyph(d: str):
	"""SVG path data → TrueType glyph (flipped, quadratic, outer contours clockwise)."""
	rec = RecordingPen()
	# x' = x·S ; y' = (448 − y)·S
	parse_path(d, TransformPen(rec, (SCALE, 0, 0, -SCALE, 0, BASELINE_SHIFT * SCALE)))
	# SVG fills close open subpaths implicitly; fonts need every contour closed.
	rec.value = [('closePath', ()) if op == 'endPath' else (op, args) for op, args in rec.value]

	# Split into contours to find the dominant (outer) winding.
	contours: list[list] = []
	for op in rec.value:
		if op[0] == 'moveTo':
			contours.append([])
		if contours:
			contours[-1].append(op)
	largest = 0.0
	for contour in contours:
		area_pen = AreaPen()
		for op, args in contour:
			getattr(area_pen, op)(*args)
		if contour[-1][0] not in ('closePath', 'endPath'):
			area_pen.closePath()
		if abs(area_pen.value) > abs(largest):
			largest = area_pen.value
	# AreaPen: positive = counter-clockwise. TrueType wants outer contours clockwise.
	reverse = largest > 0

	tt_pen = TTGlyphPen(None)
	rec.replay(Cu2QuPen(tt_pen, MAX_ERR, reverse_direction=reverse))
	return tt_pen.glyph()


# MARK: empty_glyph
def empty_glyph():
	return TTGlyphPen(None).glyph()


# MARK: period_glyph
def period_glyph():
	"""A small clockwise square on the baseline, mapped to '.' so abgen has an ASCII outline to pre-fill."""
	pen = TTGlyphPen(None)
	size = round(64 * SCALE)
	x0   = (UPEM - size) // 2
	pen.moveTo((x0, 0))
	pen.lineTo((x0, size))
	pen.lineTo((x0 + size, size))
	pen.lineTo((x0 + size, 0))
	pen.closePath()
	return pen.glyph()


# MARK: check_converter_limits
def check_converter_limits(path: Path) -> None:
	"""
	Fail the build when abgen would refuse the font. A refused font gets no asset bundle,
	so the Explorer keeps its built-in face and every icon renders as tofu, with no error
	in the scene.
	"""
	data = path.read_bytes()
	assert len(data) <= ABGEN_MAX_FONT_BYTES, f'{path.name} is {len(data)} bytes, over abgen\'s 16 MB cap'
	assert data[:4] == b'\x00\x01\x00\x00', 'abgen takes TrueType (glyf) fonts only'
	font = TTFont(str(path))
	glyf = font['glyf']
	cmap = font.getBestCmap()
	total = 0
	for name in font.getGlyphOrder():
		glyph = glyf[name]
		points = len(glyph.coordinates) if glyph.numberOfContours > 0 else 0
		assert points <= ABGEN_MAX_GLYPH_POINTS, f'{name} has {points} points, over abgen\'s {ABGEN_MAX_GLYPH_POINTS}'
		total += points
	assert total <= ABGEN_MAX_FONT_POINTS, f'{total} outline points, over abgen\'s {ABGEN_MAX_FONT_POINTS}'
	prefill = [cmap[ord(c)] for c in ABGEN_PREFILL_SAMPLE if ord(c) in cmap]
	assert any(glyf[g].numberOfContours > 0 for g in prefill), \
		'no outline for any ASCII character — abgen refuses the font (icons render as tofu)'


# MARK: glyph_lsb
def glyph_lsb(glyph) -> int:
	coords = getattr(glyph, 'coordinates', None)
	if not coords:
		return 0
	return min(x for x, _ in coords)


# MARK: build_font
def build_font(members: list[tuple[int, Icon]], dest: Path, upstream: dict) -> dict:
	"""Write the icon TTF. Returns stats."""
	family = FAMILY
	order  = ['.notdef', 'space', 'period']
	cmap   = {0x20: 'space', 0x2E: 'period'}
	glyphs = {'.notdef': empty_glyph(), 'space': empty_glyph(), 'period': period_glyph()}
	for index, icon in members:
		cp   = CODEPOINT_START + index
		name = f'uni{cp:04X}'
		order.append(name)
		cmap[cp]     = name
		try:
			glyphs[name] = build_glyph(icon.d)
		except Exception as err:
			raise RuntimeError(f'{icon.author}/{icon.name}: {err!r}') from err

	fb = FontBuilder(UPEM, isTTF=True)
	fb.setupGlyphOrder(order)
	fb.setupCharacterMap(cmap)
	fb.setupGlyf(glyphs)
	fb.setupHorizontalMetrics({g: (UPEM, glyph_lsb(glyphs[g])) for g in order})
	fb.setupHorizontalHeader(ascent=ASCENT, descent=DESCENT)
	fb.setupNameTable({
		'copyright'   : 'Icons from game-icons.net (CC BY 3.0) — see LICENSE.md for each contributor.',
		'familyName'  : family,
		'styleName'   : 'Regular',
		'uniqueFontIdentifier': f'{family}:{upstream["commit"][:7]}',
		'fullName'    : f'{family} Regular',
		'psName'      : f'{family}-Regular',
		'version'     : f'Version 1.000; game-icons {upstream["commit"][:7]}',
		'licenseDescription': 'Creative Commons Attribution 3.0 (CC BY 3.0); some contributors CC0.',
		'licenseInfoURL'    : 'https://creativecommons.org/licenses/by/3.0/',
	})
	fb.setupOS2(
		sTypoAscender  = ASCENT,
		sTypoDescender = DESCENT,
		sTypoLineGap   = 0,
		usWinAscent    = ASCENT,
		usWinDescent   = -DESCENT,
		fsType         = 0,
		ulUnicodeRange2= 1 << (60 - 32),   # bit 60: Private Use Area
	)
	fb.setupPost()

	font = fb.font
	gasp = newTable('gasp')
	gasp.version   = 1
	gasp.gaspRange = {0xFFFF: 0x000F}
	font['gasp'] = gasp

	overlaps_removed = False
	if removeOverlaps is not None:
		removeOverlaps(font)
		hmtx = font['hmtx']
		for gname, glyph in font['glyf'].glyphs.items():
			if hasattr(glyph, 'xMin'):
				hmtx[gname] = (hmtx[gname][0], glyph.xMin)
		overlaps_removed = True

	font.save(str(dest))
	check_converter_limits(dest)
	return {'glyphs': len(members), 'bytes': dest.stat().st_size, 'overlaps_removed': overlaps_removed}


# MARK: upstream_info
def upstream_info(src: Path) -> dict:
	"""Commit + commit date of the checkout, when it is a git repo."""
	def git(*args: str) -> str:
		try:
			return subprocess.check_output(['git', '-C', str(src), *args], text=True, stderr=subprocess.DEVNULL).strip()
		except (OSError, subprocess.CalledProcessError):
			return ''
	return {
		'repo'  : 'https://github.com/game-icons/icons',
		'commit': git('rev-parse', 'HEAD') or 'unknown',
		'date'  : git('log', '-1', '--format=%cs') or 'unknown',
	}


# MARK: kebab_to_camel
def kebab_to_camel(name: str) -> str:
	parts = name.split('-')
	return parts[0] + ''.join(p[:1].upper() + p[1:] for p in parts[1:] if p)


# MARK: write_ts
def write_ts(path: Path, icons: list[Icon], authors: list[str], build: dict) -> None:
	"""Emit the searchable id list + build stamp consumed by gameIcons.resolve.ts."""
	author_index = {a: i for i, a in enumerate(authors)}
	lines = [
		'/* eslint-disable */',
		'/**',
		' * GENERATED by scripts/build-game-icons.py — do not edit by hand.',
		f' * Source: {build["upstream"]["repo"]} @ {build["upstream"]["commit"][:7]} ({build["upstream"]["date"]})',
		' * Licence: CC BY 3.0 (some contributors CC0) — credits in assets/fonts/LICENSE-game-icons.md.',
		' *',
		' * Search this file for an icon name (one per line, author in the comment), or',
		' * browse https://game-icons.net. Pass the name to <GameIcon icon="…" />.',
		' * Names that two contributors share are `author/name` for all but the preferred author.',
		' */',
		'',
		'/** When and from what this file + assets/fonts/duck-game-icons.ttf were built. */',
		'export const GAME_ICONS_BUILD = {',
		f'\tbuiltAt       : \'{build["builtAt"]}\',',
		f'\tupstreamRepo  : \'{build["upstream"]["repo"]}\',',
		f'\tupstreamCommit: \'{build["upstream"]["commit"]}\',',
		f'\tupstreamDate  : \'{build["upstream"]["date"]}\',',
		f'\ticonCount     : {len(icons)},',
		f'\tcodepointStart: 0x{CODEPOINT_START:X},',
		f'\tfontSrc       : \'{FONT_SRC}\',',
		'} as const',
		'',
		'/** Contributor folders on game-icons/icons (index used by GAME_ICON_AUTHOR_INDEX). */',
		'export const GAME_ICON_AUTHORS = [',
		*[f"\t'{a}'," for a in authors],
		'] as const',
		'',
		'export type GameIconAuthor = typeof GAME_ICON_AUTHORS[number]',
		'',
		'/**',
		' * Canonical icon ids. Array index = glyph index: codepoint = codepointStart + index.',
		' */',
		'export const GAME_ICON_IDS = [',
		*[f"\t'{icon.id}', // {icon.author}" for icon in icons],
		'] as const',
		'',
		'export type GameIconId = typeof GAME_ICON_IDS[number]',
		'',
		'/** Author per GAME_ICON_IDS entry (index into GAME_ICON_AUTHORS). */',
		'export const GAME_ICON_AUTHOR_INDEX: readonly number[] = [',
	]
	idx = [str(author_index[i.author]) for i in icons]
	for start in range(0, len(idx), 40):
		lines.append('\t' + ', '.join(idx[start:start + 40]) + ',')
	lines += [']', '']
	path.write_text('\n'.join(lines), encoding='utf-8', newline='\n')


# MARK: write_license
def write_license(path: Path, src: Path, build: dict) -> None:
	upstream_license = (src / 'license.txt').read_text(encoding='utf-8').strip() if (src / 'license.txt').is_file() else ''
	text = f"""# Game Icons — licence and credits

`duck-game-icons.ttf` is built from the SVG icons of
[game-icons.net]({build['upstream']['repo']}) (commit `{build['upstream']['commit'][:7]}`, {build['upstream']['date']}).

They are licensed under **Creative Commons Attribution 3.0** (https://creativecommons.org/licenses/by/3.0/),
except contributors marked CC0 below. Converting them to a font does not change that licence.
Keep this file next to the font.

**If your scene uses these icons you must credit the authors**, for example in an in-scene
credits panel or your scene description:

> Icons made by Lorc, Delapouite and contributors. Available on https://game-icons.net (CC BY 3.0)

The `author` of every icon is listed next to its name in
`src/ui-component-kit/fonts/gameIcons.icons.ts`, and `resolveGameIcon(name).author` returns it at runtime.

## Upstream licence (license.txt)

```
{upstream_license}
```
"""
	path.write_text(text, encoding='utf-8', newline='\n')


# MARK: main
def main(argv: list[str]) -> int:
	repo = Path(__file__).resolve().parents[1]
	parser = argparse.ArgumentParser(description='Build the Game Icons TTF + name lookup for the UI Component Kit.')
	parser.add_argument('source', nargs='?', default=str(repo / 'scripts' / 'game-icons-sources'),
		help='game-icons/icons checkout (default: scripts/game-icons-sources)')
	parser.add_argument('--only', default='', help='comma-separated ids — pilot build of just these icons')
	parser.add_argument('--repo', default=str(repo), help=argparse.SUPPRESS)
	args = parser.parse_args(argv[1:])

	src  = Path(args.source)
	root = Path(args.repo)
	if not src.is_dir():
		print(f'build-game-icons: source folder not found: {src}\n'
		      f'  git clone --depth 1 https://github.com/game-icons/icons scripts/game-icons-sources', file=sys.stderr)
		return 1
	if removeOverlaps is None:
		print('build-game-icons: WARNING skia-pathops not installed — skipping removeOverlaps. '
		      'Unity can drop overlapping glyphs as tofu; pip install skia-pathops and rebuild before publishing.',
		      file=sys.stderr)

	icons = assign_ids(collect_icons(src))
	if args.only:
		wanted = {s.strip() for s in args.only.split(',') if s.strip()}
		icons  = [i for i in icons if i.id in wanted or i.name in wanted]
		missing = wanted - {i.id for i in icons} - {i.name for i in icons}
		if missing:
			print(f'build-game-icons: --only names not found: {sorted(missing)}', file=sys.stderr)
	if CODEPOINT_START + len(icons) - 1 > CODEPOINT_END:
		print('build-game-icons: more icons than BMP PUA slots — move to plane 15 (U+F0000)', file=sys.stderr)
		return 1

	out_dir = root / 'assets' / 'fonts'
	out_dir.mkdir(parents=True, exist_ok=True)
	ts_path = root / 'src' / 'ui-component-kit' / 'fonts' / 'gameIcons.icons.ts'
	ts_path.parent.mkdir(parents=True, exist_ok=True)

	authors  = sorted({i.author for i in icons}, key=lambda a: (a not in AUTHOR_PRIORITY, AUTHOR_PRIORITY.index(a) if a in AUTHOR_PRIORITY else 0, a))
	upstream = upstream_info(src)
	build = {
		'builtAt' : dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%d'),
		'upstream': upstream,
	}

	failed: list[str] = []
	dest = out_dir / FONT_FILE
	try:
		stats = build_font(list(enumerate(icons)), dest, upstream)
	except Exception as err:
		failed.append(f'{dest.name}: {err}')
		stats = {'bytes': 0}

	write_license(out_dir / 'LICENSE-game-icons.md', src, build)
	write_ts(ts_path, icons, authors, build)

	print(f'build-game-icons: {len(icons)} icons → {FONT_FILE} '
	      f'({stats["bytes"] / 1024 / 1024:.2f} MB, '
	      f'removeOverlaps={"yes" if removeOverlaps else "NO"}) from {upstream["commit"][:7]} ({upstream["date"]})')
	if failed:
		for f in failed:
			print(f'build-game-icons: FAILED {f}', file=sys.stderr)
		return 1
	return 0


if __name__ == '__main__':
	raise SystemExit(main(sys.argv))
