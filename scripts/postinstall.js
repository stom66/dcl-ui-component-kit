const { copyStockAssets, LOG_PREFIX } = require('./lib/assets')


// MARK: main
const result = copyStockAssets()

if (result.ok) {
	console.log(`${LOG_PREFIX} copied stock textures → ${result.dest}`)
} else if (result.reason) {
	console.log(`${LOG_PREFIX} ${result.reason}`)
}
