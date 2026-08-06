#!/usr/bin/env node

const { copyStockAssets, LOG_PREFIX, resolveConsumerRoot } = require('./lib/assets')
const { initTheme } = require('./lib/themeScaffold')


// MARK: printHelp
function printHelp() {
	console.log(`DCL UI Component Kit CLI

Usage:
  npx @stom66/dcl-ui-component-kit <command> [options]

Commands:
  copy-assets              Copy stock textures into ./assets/images/ui-component-kit
                           (required after npm install — postinstall may be blocked)
  init-theme [name]        Scaffold a theme folder under src/themes/<name>
  help                     Show this help

Options:
  --force                  Overwrite an existing theme (init-theme only)

npm allow-scripts:
  Dependency postinstall may be blocked (npm 11.16+ warn / npm 12+ deny).
  Prefer:  npx @stom66/dcl-ui-component-kit copy-assets
  Or:      npm approve-scripts @stom66/dcl-ui-component-kit && npm rebuild @stom66/dcl-ui-component-kit

Opt out of postinstall asset copy:
  UI_COMPONENT_KIT_SKIP_ASSETS=1
  or package.json → "config": { "dcl-ui-component-kit": { "skipAssets": true } }
`)
}


// MARK: runCopyAssets
function runCopyAssets() {
	const result = copyStockAssets({
		forceConsumer: true,
		consumerRoot : resolveConsumerRoot(),
	})

	if (result.ok) {
		console.log(`${LOG_PREFIX} copied stock textures → ${result.dest}`)
		return
	}

	console.error(`${LOG_PREFIX} copy-assets failed: ${result.reason || 'unknown error'}`)
	process.exitCode = 1
}


// MARK: main
async function main() {
	const argv = process.argv.slice(2)
	const command = argv[0] || 'help'
	const rest = argv.slice(1)

	switch (command) {
		case 'copy-assets':
			runCopyAssets()
			break
		case 'init-theme':
			await initTheme(rest)
			break
		case 'help':
		case '--help':
		case '-h':
			printHelp()
			break
		default:
			console.error(`${LOG_PREFIX} unknown command "${command}"`)
			printHelp()
			process.exitCode = 1
	}
}

main().catch((err) => {
	console.error(`${LOG_PREFIX} cli:`, err)
	process.exitCode = 1
})
