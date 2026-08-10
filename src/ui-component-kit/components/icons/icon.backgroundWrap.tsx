import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'


export type IconBackgroundWrapProps = Pick<
	UiBoxProps,
	| 'borderColor'
	| 'borderRadius'
	| 'borderWidth'
	| 'padding'
	| 'margin'
	| 'onMouseDown'
	| 'onMouseUp'
	| 'onMouseEnter'
	| 'onMouseLeave'
	| 'uiTransform'
> & {
	/** Chip / panel fill behind the glyph. When set, wraps `children` in a UiBox. */
	backgroundColor: Color4
	width?         : PositionUnit | 'auto' | undefined
	height?        : PositionUnit | 'auto' | undefined
	/** Applied as `minWidth` / `minHeight` when the matching axis is `"auto"`. */
	minSize?       : number
	children       : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: IconBackgroundWrap
/**
 * Chip wrapper for texture icons. Owns `backgroundColor` (and optional border /
 * padding / margin / size) so the glyph entity can keep `iconColor` as its only
 * `uiBackground.color` tint without colliding with a panel fill.
 */
export function IconBackgroundWrap({
	backgroundColor,
	borderColor,
	borderRadius,
	borderWidth,
	padding,
	margin,
	width,
	height,
	minSize,
	onMouseDown,
	onMouseUp,
	onMouseEnter,
	onMouseLeave,
	uiTransform,
	children,
}: IconBackgroundWrapProps) {
	const widthAuto  = width  === undefined || width  === 'auto'
	const heightAuto = height === undefined || height === 'auto'

	return (
		<UiBox
			backgroundColor = {backgroundColor}
			borderColor     = {borderColor}
			borderRadius    = {borderRadius}
			borderWidth     = {borderWidth}
			padding         = {padding}
			margin          = {margin}
			width           = {width}
			height          = {height}
			onMouseDown     = {onMouseDown}
			onMouseUp       = {onMouseUp}
			onMouseEnter    = {onMouseEnter}
			onMouseLeave    = {onMouseLeave}
			uiTransform     = {{
				display       : 'flex',
				alignItems    : 'center',
				justifyContent: 'center',
				flexGrow      : 0,
				flexShrink    : 0,
				overflow      : 'hidden',
				...(widthAuto  && minSize !== undefined ? { minWidth : minSize } : {}),
				...(heightAuto && minSize !== undefined ? { minHeight: minSize } : {}),
				...uiTransform,
			}}
		>
			{children}
		</UiBox>
	)
}
