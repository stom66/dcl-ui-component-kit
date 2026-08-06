import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'
import { getTheme } from '../../styles'
import { getColSelfTransform, type ColSpanInput } from '../../utils'
import { textMinHeight } from '../text/textLayout'


type LabelProps = Omit<UiBoxProps, 'uiText'> & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	value?      : string
	color?      : Color4
	cols?       : ColSpanInput
	colsDesktop?: ColSpanInput
	colsMobile? : ColSpanInput
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
	const col           = getColSelfTransform(cols, colsDesktop, colsMobile)!
	const resolvedValue = value ?? uiText?.value ?? ''
	const padding       = theme.border.radiusSmall
	const fontSize      = scaleFontSize(theme.typography.size.default)

	return (
		<UiBox
			{...props}
			uiTransform={{
				height        : "auto",
				minHeight     : textMinHeight(fontSize),
				width         : col.width,
				display       : "flex",
				flexGrow      : col.flexGrow,
				flexShrink    : 0,
				flexBasis     : col.flexBasis,
				maxWidth      : col.maxWidth,
				flexDirection : "row",
				alignSelf     : "flex-start",
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
				fontSize,
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
