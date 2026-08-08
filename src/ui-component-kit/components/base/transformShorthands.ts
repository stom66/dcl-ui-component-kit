import type { UiTransformProps } from '@dcl/sdk/react-ecs'


/**
 * Layout props lifted out of `uiTransform` onto kit components (`UiBox`, `Row`,
 * `Column`, `Background`, …). Prefer these over nesting when a single field
 * is enough. Nested `uiTransform` remains the escape hatch; shorthands win.
 *
 * Not lifted (owned elsewhere):
 * - `width` / `height` — already `UiBox` shorthands
 * - `borderColor` / `borderRadius` / `borderWidth` — already `UiBox` shorthands
 * - `flexDirection` — owned by `Row` / `Column` defaults
 */
export type UiTransformShorthandProps = Omit<
	UiTransformProps,
	| 'width'
	| 'height'
	| 'borderColor'
	| 'borderRadius'
	| 'borderWidth'
	| 'flexDirection'
>


const TRANSFORM_SHORTHAND_KEYS = [
	'display',
	'flex',
	'justifyContent',
	'positionType',
	'alignItems',
	'alignSelf',
	'alignContent',
	'position',
	'padding',
	'margin',
	'minWidth',
	'maxWidth',
	'minHeight',
	'maxHeight',
	'flexWrap',
	'flexBasis',
	'flexGrow',
	'flexShrink',
	'overflow',
	'pointerFilter',
	'opacity',
	'zIndex',
] as const satisfies readonly (keyof UiTransformShorthandProps)[]


// MARK: pickTransformShorthands
/**
 * Splits top-level transform shorthands from a props bag so they never reach
 * `UiEntity` as unknown ECS component names.
 */
export function pickTransformShorthands<T extends UiTransformShorthandProps>(
	props: T,
): { shorthands: UiTransformShorthandProps; rest: Omit<T, keyof UiTransformShorthandProps> } {
	const shorthands: UiTransformShorthandProps = {}
	const rest                                 = { ...props } as Record<string, unknown>

	for (const key of TRANSFORM_SHORTHAND_KEYS) {
		const value = props[key]
		if (value !== undefined) {
			;(shorthands as Record<string, unknown>)[key] = value
		}
		delete rest[key]
	}

	return {
		shorthands,
		rest: rest as Omit<T, keyof UiTransformShorthandProps>,
	}
}


// MARK: mergeTransformShorthands
/**
 * Merges `defaults ← uiTransform ← shorthands`. Undefined shorthand keys are
 * skipped so they do not wipe earlier values.
 */
export function mergeTransformShorthands(
	defaults  : UiTransformProps | undefined,
	uiTransform: UiTransformProps | undefined,
	shorthands: UiTransformShorthandProps,
): UiTransformProps {
	const lifted: UiTransformProps = {}
	for (const key of TRANSFORM_SHORTHAND_KEYS) {
		const value = shorthands[key]
		if (value !== undefined) {
			;(lifted as Record<string, unknown>)[key] = value
		}
	}

	return {
		...defaults,
		...uiTransform,
		...lifted,
	}
}
