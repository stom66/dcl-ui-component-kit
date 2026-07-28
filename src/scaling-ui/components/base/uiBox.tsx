import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { darken } from '../../utils/colors'


type UiEntityBackground = Parameters<typeof UiEntity>[0]['uiBackground']
type UiEntityTransform  = Parameters<typeof UiEntity>[0]['uiTransform']

export type ScalingUiProps = {
	backgroundColor?: Color4
	borderColor    ?: Color4
	borderRadius   ?: number
	borderWidth    ?: number
}

export type UiBoxProps = Parameters<typeof UiEntity>[0] & ScalingUiProps & {
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
 */
export function resolveUiBackground(
	uiBackground   : UiEntityBackground | undefined,
	backgroundColor: Color4 | undefined
): UiEntityBackground | undefined {
	if (backgroundColor === undefined) return uiBackground

	return {
		...uiBackground,
		color: backgroundColor,
	}
}


// MARK: resolveUiTransform
/**
 * Applies Scaling UI transform shortcuts on top of native Decentraland UI transform props.
 * No default padding or border — those belong on Zone roots. Border color darkens the fill
 * when a border width or explicit border color is provided.
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


// MARK: UiBox
/**
 * Base Scaling UI entity that supports project-level UI shortcuts.
 * No default padding, border, or fill — Zone roots own those frame defaults.
 */
export function UiBox({
	backgroundColor,
	borderColor,
	borderRadius,
	borderWidth,
	children,
	uiBackground,
	uiTransform,
	...props
}: UiBoxProps) {
	return (
		<UiEntity
			{...props}
			uiTransform={resolveUiTransform(
				uiTransform,
				backgroundColor,
				borderColor,
				borderRadius,
				borderWidth,
				uiBackground
			)}
			uiBackground={resolveUiBackground(uiBackground, backgroundColor)}
		>
			{children}
		</UiEntity>
	)
}
