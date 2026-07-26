import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { darken } from '../../utils/colors'
import { getTheme } from 'src/scaling-ui/styles'


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

const theme = getTheme()


// MARK: resolveUiBackground
/**
 * Applies Scaling UI background shortcuts on top of native Decentraland UI background props.
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
 */
export function resolveUiTransform(
	uiTransform    : UiEntityTransform | undefined,
	backgroundColor: Color4 | undefined,
	borderColor    : Color4 | undefined,
	borderRadius   : number | undefined,
	borderWidth    : number | undefined
): UiEntityTransform | undefined {
	const resolvedBorderColor = borderColor
		?? (borderWidth !== undefined && backgroundColor !== undefined ? darken(backgroundColor, 0.2) : uiTransform?.borderColor)

	return {
		...uiTransform,
		borderColor : resolvedBorderColor,
		borderRadius: borderRadius ?? uiTransform?.borderRadius ?? theme.border.radiusDefault,
		borderWidth : borderWidth ?? uiTransform?.borderWidth ?? theme.border.width,
	}
}


// MARK: UiBox
/**
 * Base Scaling UI entity that supports project-level UI shortcuts.
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
			uiTransform={resolveUiTransform(uiTransform, backgroundColor, borderColor, borderRadius, borderWidth)}
			uiBackground={resolveUiBackground(uiBackground, backgroundColor)}
		>
			{children}
		</UiEntity>
	)
}
