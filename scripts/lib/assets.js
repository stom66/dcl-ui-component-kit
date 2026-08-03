const fs = require('fs')
const path = require('path')

const PACKAGE_ROOT = path.resolve(__dirname, '..', '..')
const ASSET_REL = path.join('assets', 'images', 'ui-component-kit')
const LOG_PREFIX = 'ui-component-kit:'


// MARK: resolveConsumerRoot
/**
 * Directory of the project that ran `npm install` (or cwd when invoked manually).
 */
function resolveConsumerRoot() {
	return process.env.INIT_CWD || process.cwd()
}


// MARK: isInstalledAsDependency
/** True when this package lives under a consumer's node_modules. */
function isInstalledAsDependency() {
	return PACKAGE_ROOT.includes(`${path.sep}node_modules${path.sep}`)
}


// MARK: shouldSkipAssetCopy
/** Opt-out via env or consumer package.json config. */
function shouldSkipAssetCopy(consumerRoot) {
	if (process.env.UI_COMPONENT_KIT_SKIP_ASSETS === '1') return 'UI_COMPONENT_KIT_SKIP_ASSETS=1'

	try {
		const pkgPath = path.join(consumerRoot, 'package.json')
		if (!fs.existsSync(pkgPath)) return null
		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
		const cfg = pkg.config && pkg.config['dcl-ui-component-kit']
		if (cfg && cfg.skipAssets) return 'package.json config.dcl-ui-component-kit.skipAssets'
	} catch (err) {
		console.error(`${LOG_PREFIX} shouldSkipAssetCopy: failed to read consumer package.json`, err)
	}

	return null
}


// MARK: copyStockAssets
/**
 * Copies stock textures into the consumer scene's assets/images/ui-component-kit.
 * @returns {{ ok: boolean, reason?: string, dest?: string }}
 */
function copyStockAssets(options = {}) {
	const forceConsumer = options.forceConsumer === true
	const consumerRoot  = options.consumerRoot || resolveConsumerRoot()

	if (!forceConsumer && !isInstalledAsDependency()) {
		return { ok: false, reason: 'skip (installing package itself, not a dependency)' }
	}

	const skipReason = shouldSkipAssetCopy(consumerRoot)
	if (skipReason) {
		return { ok: false, reason: `skip (${skipReason})` }
	}

	const src  = path.join(PACKAGE_ROOT, ASSET_REL)
	const dest = path.join(consumerRoot, ASSET_REL)

	if (!fs.existsSync(src)) {
		console.error(`${LOG_PREFIX} copyStockAssets: source missing: ${src}`)
		return { ok: false, reason: 'source assets missing in package' }
	}

	fs.mkdirSync(path.dirname(dest), { recursive: true })
	fs.cpSync(src, dest, { recursive: true })

	return { ok: true, dest }
}


module.exports = {
	ASSET_REL,
	LOG_PREFIX,
	PACKAGE_ROOT,
	copyStockAssets,
	isInstalledAsDependency,
	resolveConsumerRoot,
	shouldSkipAssetCopy,
}
