const { copyStockAssets, LOG_PREFIX } = require('./lib/assets')


// MARK: main
/**
 * Best-effort asset copy when npm allows this package's install scripts.
 * npm 11.16+ may warn about allow-scripts; npm 12+ may skip this entirely.
 * Consumers should still run: npx @stom66/dcl-ui-component-kit copy-assets
 */
const result = copyStockAssets()

if (result.ok) {
	console.log(`${LOG_PREFIX} copied stock textures → ${result.dest}`)
} else if (result.reason) {
	console.log(`${LOG_PREFIX} ${result.reason}`)
	if (!String(result.reason).startsWith('skip (')) {
		console.log(`${LOG_PREFIX} run: npx @stom66/dcl-ui-component-kit copy-assets`)
	}
} else {
	console.log(`${LOG_PREFIX} postinstall did not copy assets — run: npx @stom66/dcl-ui-component-kit copy-assets`)
}
