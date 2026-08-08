const fs = require('fs')
const path = require('path')

const ORDER = ['top', 'right', 'bottom', 'left']
const roots = ['src/ui-component-kit', 'src/exampleThemes']

function walk(dir, out = []) {
	for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, ent.name)
		if (ent.isDirectory()) walk(p, out)
		else if (/\.(ts|tsx)$/.test(ent.name)) out.push(p)
	}
	return out
}

function checkBody(body) {
	const keys = [...body.matchAll(/\b(top|right|bottom|left)\s*:/g)].map((m) => m[1])
	if (keys.length < 2) return true
	// Only flag if body is edge-only-ish (no other key: patterns)
	if (/\b(?!top|right|bottom|left)[A-Za-z_][\w]*\s*:/.test(body)) return true
	const sorted = [...keys].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
	return keys.join() === sorted.join()
}

const bad = []
for (const file of roots.flatMap((r) => walk(r))) {
	const src = fs.readFileSync(file, 'utf8')
	for (const m of src.matchAll(/\b(margin|padding|position)(\s*[=:]\s*)\{\{?([^{}]*)\}/g)) {
		const body = m[3]
		if (!checkBody(body)) {
			bad.push(`${file}: ${m[0].slice(0, 80).replace(/\s+/g, ' ')}`)
		}
	}
}

if (bad.length === 0) console.log('All margin/padding/position edge objects are TRBL')
else {
	console.log(`Found ${bad.length} out-of-order edge objects:`)
	bad.forEach((l) => console.log(' -', l))
	process.exitCode = 1
}
