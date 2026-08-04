/**
 * DCL/Yoga layout helpers for uiText blocks.
 *
 * `height: 'auto'` does not reserve space when a height-capped `Column` shrinks
 * its children (`flexShrink` defaults to 1). Text components must set
 * `flexShrink: 0` and a `minHeight` floor so siblings do not overlap.
 */


// MARK: textMinHeight
/** One-line floor for a uiText block (font size + a little leading). */
export function textMinHeight(fontSize: number): number {
	return Math.ceil(fontSize * 1.15)
}
