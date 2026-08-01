import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, UiEntity } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { resolveAspectDimensions } from '../../utils/aspect'
import { darken } from '../../utils/colors'


type UiEntityBackground = Parameters<typeof UiEntity>[0]['uiBackground']
type UiEntityTransform  = Parameters<typeof UiEntity>[0]['uiTransform']
type UiEntityProps      = Parameters<typeof UiEntity>[0]

export type ScalingUiProps = {
	backgroundColor?: Color4
	borderColor    ?: Color4
	borderRadius   ?: number
	borderWidth    ?: number
	/**
	 * Width ÷ height. When set, the missing axis is derived from the other
	 * (via `resolveAspectDimensions`). Ignored when both axes are set.
	 */
	aspectRatio    ?: number
	width          ?: PositionUnit | 'auto'
	height         ?: PositionUnit | 'auto'
}

export type UiBoxProps = UiEntityProps & ScalingUiProps & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: resolveFillColor
/** Fill used for border derivation: shorthand, native background color, then theme body. */
function resolveFillColor(
	backgroundColor: Color4 | undefined,
	uiBackground   : UiEntityBackground | undefined
): Color4 {
	return backgroundColor ?? uiBackground?.color ?? getTheme().colors.body
}


// MARK: resolveUiBackground
/**
 * Applies Scaling UI background shortcuts on top of native Decentraland UI background props.
 * No default fill — only applies when `backgroundColor` is set.
 * Copies the color so theme tokens are never shared by reference with ECS components.
 */
export function resolveUiBackground(
	uiBackground   : UiEntityBackground | undefined,
	backgroundColor: Color4 | undefined
): UiEntityBackground | undefined {
	if (backgroundColor === undefined) return uiBackground

	return {
		...uiBackground,
		color: Color4.create(
			backgroundColor.r,
			backgroundColor.g,
			backgroundColor.b,
			backgroundColor.a
		),
	}
}


// MARK: resolveUiTransform
/**
 * Applies Scaling UI transform shortcuts on top of native Decentraland UI transform props.
 * No default padding or border — use `Background` for panel chrome.
 *
 * `backgroundColor` is NOT written onto the transform. It is only read to derive
 * `borderColor` via `darken(fill, 0.2)` when a border is present and no explicit
 * border color was provided.
 */
export function resolveUiTransform(
	uiTransform    : UiEntityTransform | undefined,
	backgroundColor: Color4 | undefined,
	borderColor    : Color4 | undefined,
	borderRadius   : number | undefined,
	borderWidth    : number | undefined,
	uiBackground   : UiEntityBackground | undefined = undefined
): UiEntityTransform | undefined {
	const resolvedBorderWidth = borderWidth ?? uiTransform?.borderWidth
	const wantsBorderColor    = borderColor !== undefined
		|| uiTransform?.borderColor !== undefined
		|| resolvedBorderWidth !== undefined

	const resolvedBorderColor = wantsBorderColor
		? borderColor
			?? uiTransform?.borderColor
			?? darken(resolveFillColor(backgroundColor, uiBackground), 0.2)
		: undefined

	return {
		...uiTransform,
		...(resolvedBorderColor !== undefined ? { borderColor: resolvedBorderColor } : {}),
		...(borderRadius !== undefined ? { borderRadius } : {}),
		...(borderWidth !== undefined ? { borderWidth } : {}),
	}
}


// MARK: resolveBoxSize
/** Merges width/height shorthands with uiTransform and optional aspect-ratio derivation. */
function resolveBoxSize(
	width       : PositionUnit | 'auto' | undefined,
	height      : PositionUnit | 'auto' | undefined,
	aspectRatio : number | undefined,
	uiTransform : UiEntityTransform | undefined,
): { width?: PositionUnit | 'auto'; height?: PositionUnit | 'auto' } {
	const inputWidth  = width  ?? uiTransform?.width  as PositionUnit | 'auto' | undefined
	const inputHeight = height ?? uiTransform?.height as PositionUnit | 'auto' | undefined

	if (aspectRatio === undefined) {
		return { width: inputWidth, height: inputHeight }
	}

	return resolveAspectDimensions({
		width      : inputWidth,
		height     : inputHeight,
		aspectRatio: aspectRatio,
	})
}


// MARK: UiBox
/**
 * Base Scaling UI entity that supports project-level UI shortcuts.
 * No default padding, border, or fill — wrap content in `Background` for panel chrome.
 *
 * Only forwards known UiEntity props. Shorthands like `value` / `cols` must never
 * reach the entity — DCL treats every top-level key as an ECS component name.
 *
 * Pass `aspectRatio` with a single axis (`width` / `height` or via `uiTransform`)
 * to derive the other axis in virtual pixels (`vw`/`vh` are converted).
 */
export function UiBox({
	aspectRatio,
	backgroundColor,
	borderColor,
	borderRadius,
	borderWidth,
	children,
	height,
	onMouseDown,
	onMouseEnter,
	onMouseLeave,
	onMouseUp,
	uiBackground,
	uiText,
	uiTransform,
	width,
}: UiBoxProps) {
	const size = resolveBoxSize(width, height, aspectRatio, uiTransform)

	return (
		<UiEntity
			uiTransform={resolveUiTransform(
				{
					...uiTransform,
					...(size.width  !== undefined ? { width : size.width  } : {}),
					...(size.height !== undefined ? { height: size.height } : {}),
				},
				backgroundColor,
				borderColor,
				borderRadius,
				borderWidth,
				uiBackground
			)}
			uiBackground = {resolveUiBackground(uiBackground, backgroundColor)}
			uiText       = {uiText}
			onMouseDown  = {onMouseDown}
			onMouseUp    = {onMouseUp}
			onMouseEnter = {onMouseEnter}
			onMouseLeave = {onMouseLeave}
		>
			{children}
		</UiEntity>
	)
}
