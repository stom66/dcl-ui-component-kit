const fs = require('fs')
const path = require('path')
const readline = require('readline')

const { LOG_PREFIX, resolveConsumerRoot } = require('./assets')

const PACKAGE_NAME = '@stom66/dcl-ui-component-kit'


// MARK: toCamelCase
/** sky-chaser / Sky Chaser / sky_chaser → skyChaser */
function toCamelCase(input) {
	const parts = String(input)
		.trim()
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)

	if (parts.length === 0) return ''

	return parts
		.map((part, i) => {
			const lower = part.toLowerCase()
			if (i === 0) return lower
			return lower.charAt(0).toUpperCase() + lower.slice(1)
		})
		.join('')
}


// MARK: promptThemeName
function promptThemeName() {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
	return new Promise((resolve) => {
		rl.question('Theme name (e.g. skyChaser): ', (answer) => {
			rl.close()
			resolve(answer)
		})
	})
}


// MARK: promptYesNo
function promptYesNo(question, defaultYes = true) {
	const hint = defaultYes ? 'Y/n' : 'y/N'
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
	return new Promise((resolve) => {
		rl.question(`${question} (${hint}): `, (answer) => {
			rl.close()
			const trimmed = String(answer || '').trim().toLowerCase()
			if (!trimmed) return resolve(defaultYes)
			resolve(trimmed === 'y' || trimmed === 'yes')
		})
	})
}


// MARK: templateFiles
function templateFiles(name) {
	const assetDir = `assets/images/themes/${name}`

	return {
		[`src/themes/${name}/theme.ts`]: `import type { ThemeCustomize } from '${PACKAGE_NAME}'


// MARK: theme
/**
 * ${name} theme overrides.
 * Only define values that differ from the UI Component Kit default theme.
 */
export const theme: ThemeCustomize = {
	// colors: {
	// 	primary: Color4.fromHexString('#…'),
	// },
}
`,

		[`src/themes/${name}/atlases.ts`]: `// import { TextureAtlas } from '${PACKAGE_NAME}'
// import type { ProgressBarImageTextures } from '${PACKAGE_NAME}'


// ---------------------------------------------------------------------------
// ${name} textures
//
// Export PNGs into \`${assetDir}/\` and declare atlases / texture sets here.
// Start from the Affinity template shipped with UI Component Kit
// (\`design/ui-component-kit-assets.af\` in the package repo).
//
// Example:
//
// export const ${name}IconsAtlas = new TextureAtlas({
// 	source : '${assetDir}/atlas-icons.png',
// 	columns: 4,
// 	rows   : 4,
// 	named  : {
// 		// star: { xStart: 1, yStart: 1 },
// 	},
// })
// ---------------------------------------------------------------------------
`,

		[`src/themes/${name}/layers/example.layer.tsx`]: `import ReactEcs from '@dcl/sdk/react-ecs'

import { Background, Column, Layer, Text, ZoneType, getTheme } from '${PACKAGE_NAME}'


// MARK: ExampleLayer
/**
 * Minimal sample layer — edit or delete.
 */
export class ExampleLayer extends Layer {
	constructor() {
		super({
			id         : '${name}-example',
			zone       : ZoneType.Default,
			uiTransform: {
				width         : '40vw',
				height        : '20vw',
				alignItems    : 'center',
				justifyContent: 'center',
			},
		})
	}

	body() {
		return (
			<Background backgroundColor={getTheme().colors.primary} borderRadius={8}>
				<Column cols={12} uiTransform={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
					<Text value="${name}" fontSize={24} />
				</Column>
			</Background>
		)
	}
}

export const exampleLayer = new ExampleLayer()
`,

		[`src/themes/${name}/layers/index.ts`]: `import type { Layer } from '${PACKAGE_NAME}'
import { toastHostLayer } from '${PACKAGE_NAME}'

import { exampleLayer } from './example.layer'


/**
 * ${name} layer list.
 * Add layer instances here. Keep \`toastHostLayer\` if you use toasts.
 */
export const layers: Layer[] = [
	exampleLayer,
	toastHostLayer,
]
`,

		[`src/themes/${name}/index.ts`]: `import { layers } from './layers'
import { theme } from './theme'

export { theme } from './theme'
export { layers } from './layers'


/**
 * ${name} theme bundle.
 */
export const ${name} = {
	theme,
	layers,
}
`,

		[`${assetDir}/.gitkeep`]: '',
	}
}


// MARK: wiringSnippet
function wiringSnippet(name) {
	return `import { ${name} } from './themes/${name}'
import { SetupUiComponentKit } from '${PACKAGE_NAME}'

export function main() {
	SetupUiComponentKit({
		theme : ${name}.theme,
		layers: ${name}.layers,
	})
}
`
}


// MARK: writeThemeFiles
function writeThemeFiles(consumerRoot, name, force) {
	const files = templateFiles(name)
	const themeRoot = path.join(consumerRoot, 'src', 'themes', name)

	if (fs.existsSync(themeRoot) && !force) {
		console.error(`${LOG_PREFIX} init-theme: ${themeRoot} already exists (pass --force to overwrite)`)
		return false
	}

	for (const [rel, contents] of Object.entries(files)) {
		const abs = path.join(consumerRoot, rel)
		fs.mkdirSync(path.dirname(abs), { recursive: true })
		fs.writeFileSync(abs, contents, 'utf8')
		console.log(`${LOG_PREFIX} wrote ${rel}`)
	}

	return true
}


// MARK: initTheme
async function initTheme(argv) {
	const force = argv.includes('--force')
	const nameArg = argv.find((a) => !a.startsWith('-'))
	const consumerRoot = resolveConsumerRoot()

	let rawName = nameArg
	if (!rawName) {
		rawName = await promptThemeName()
	}

	const name = toCamelCase(rawName)
	if (!name || !/^[a-z][a-zA-Z0-9]*$/.test(name)) {
		console.error(`${LOG_PREFIX} init-theme: invalid theme name "${rawName}" → use letters/numbers, e.g. skyChaser`)
		process.exitCode = 1
		return
	}

	const ok = writeThemeFiles(consumerRoot, name, force)
	if (!ok) {
		process.exitCode = 1
		return
	}

	const snippet = wiringSnippet(name)
	console.log(`\n${LOG_PREFIX} wire it up in src/index.ts:\n`)
	console.log(snippet)

	const indexPath = path.join(consumerRoot, 'src', 'index.ts')
	if (fs.existsSync(indexPath)) {
		const shouldPatch = await promptYesNo(`Append SetupUiComponentKit wiring to ${path.relative(consumerRoot, indexPath)}?`, false)
		if (shouldPatch) {
			const existing = fs.readFileSync(indexPath, 'utf8')
			const banner = `\n\n// --- added by ${PACKAGE_NAME} init-theme ---\n`
			fs.writeFileSync(indexPath, existing.trimEnd() + banner + snippet, 'utf8')
			console.log(`${LOG_PREFIX} appended wiring to src/index.ts (review / replace your existing main if needed)`)
		}
	} else {
		console.log(`${LOG_PREFIX} no src/index.ts found — create one using the snippet above`)
	}

	console.log(`${LOG_PREFIX} drop custom PNGs in assets/images/themes/${name}/`)
}


module.exports = {
	PACKAGE_NAME,
	initTheme,
	toCamelCase,
	wiringSnippet,
}
