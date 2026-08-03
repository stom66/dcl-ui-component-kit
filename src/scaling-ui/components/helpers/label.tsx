import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'
import { getTheme } from '../../styles'
import { getColSelfTransform } from '../../utils'


type LabelProps = Omit<UiBoxProps, 'uiText'> & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	value?      : string
	color?      : Color4
	cols?       : number
	colsDesktop?: number
	colsMobile? : number
	uiText?     : Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Label
/**
 * Text label with a primary background fill and optional child content.
 *
 * `uiTransform` / `uiBackground` / `uiText` are optional and merge over defaults.
 * `value` overrides `uiText.value`. `color` / `backgroundColor` / `uiBackground.color`
 * override the default primary fill. Padding defaults to half of `radiusDefault` on all sides.
 */
export function Label({
	children,
	value,
	uiTransform,
	uiBackground,
	uiText,
	color,
	cols,
	colsDesktop,
	colsMobile,
	...props
}: LabelProps) {
	const theme         = getTheme()
	const col           = getColSelfTransform(cols, colsDesktop, colsMobile)
	const resolvedValue = value ?? uiText?.value ?? ''
	const padding       = theme.border.radiusSmall

	return (
		<UiBox
			{...props}
			uiTransform={{
				height        : "auto",
				width         : col.width,
				display       : "flex",
				flexGrow      : col.flexGrow,
				flexShrink    : col.flexShrink,
				flexBasis     : col.flexBasis,
				flexDirection : "row",
				alignItems    : "center",
				justifyContent: "space-between",
				borderRadius  : theme.border.radiusSmall,
				borderWidth   : 0,
				padding       : {
					top   : 0,
					right : padding,
					bottom: 0,
					left  : padding,
				},
				...uiTransform
			}}
			uiBackground={{
				color: theme.colors.primary,
				...uiBackground,
				...(color !== undefined ? { color } : {}),
			}}
			uiText={{
				fontSize : scaleFontSize(theme.typography.size.default),
				font     : theme.typography.family.default,
				color    : theme.colors.light,
				textAlign: 'middle-center',
				...uiText,
				value: resolvedValue,
			}}
		>
			{children}
		</UiBox>
	)
}
