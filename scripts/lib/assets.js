const fs = require('fs')
const path = require('path')

const PACKAGE_ROOT = path.resolve(__dirname, '..', '..')
const ASSET_REL = path.join('assets', 'images', 'ui-component-kit')
const FONTS_REL = path.join('assets', 'fonts')
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


// MARK: copyDirIfPresent
/**
 * Copies a package-relative directory into the consumer project when the source exists.
 * @returns {{ ok: boolean, reason?: string, dest?: string, skipped?: boolean }}
 */
function copyDirIfPresent(relPath, consumerRoot) {
	const src  = path.join(PACKAGE_ROOT, relPath)
	const dest = path.join(consumerRoot, relPath)

	if (!fs.existsSync(src)) {
		return { ok: false, skipped: true, reason: `source missing: ${src}` }
	}

	fs.mkdirSync(path.dirname(dest), { recursive: true })
	fs.cpSync(src, dest, { recursive: true })
	return { ok: true, dest }
}


// MARK: copyStockAssets
/**
 * Copies stock textures (and Font Awesome TTFs) into the consumer scene.
 * Images → `assets/images/ui-component-kit/`
 * Fonts  → `assets/fonts/` (TTFs + LICENSE-OFL.txt; OTFs are local sources only)
 * @returns {{ ok: boolean, reason?: string, dest?: string, fontsDest?: string }}
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

	const images = copyDirIfPresent(ASSET_REL, consumerRoot)
	if (!images.ok && !images.skipped) {
		console.error(`${LOG_PREFIX} copyStockAssets: source missing: ${path.join(PACKAGE_ROOT, ASSET_REL)}`)
		return { ok: false, reason: 'source assets missing in package' }
	}
	if (images.skipped) {
		console.error(`${LOG_PREFIX} copyStockAssets: source missing: ${path.join(PACKAGE_ROOT, ASSET_REL)}`)
		return { ok: false, reason: 'source assets missing in package' }
	}

	const fonts = copyDirIfPresent(FONTS_REL, consumerRoot)
	if (fonts.ok) {
		// Drop OTFs from the consumer copy — kit ships converted TTFs only.
		try {
			for (const entry of fs.readdirSync(fonts.dest)) {
				if (entry.toLowerCase().endsWith('.otf')) {
					fs.unlinkSync(path.join(fonts.dest, entry))
				}
			}
		} catch (err) {
			console.error(`${LOG_PREFIX} copyStockAssets: failed pruning OTFs from fonts copy`, err)
		}
	} else if (!fonts.skipped) {
		console.error(`${LOG_PREFIX} copyStockAssets: fonts copy failed`, fonts.reason)
	}

	return { ok: true, dest: images.dest, fontsDest: fonts.ok ? fonts.dest : undefined }
}


module.exports = {
	ASSET_REL,
	FONTS_REL,
	LOG_PREFIX,
	PACKAGE_ROOT,
	copyStockAssets,
	isInstalledAsDependency,
	resolveConsumerRoot,
	shouldSkipAssetCopy,
}
