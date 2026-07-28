import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getUVsForAtlasNumber } from '../../utils'
import { UiBox } from '../base'
import { Icon } from './icon'

type IconNumberProps = Omit<Parameters<typeof Icon>[0], 'iconSrc' | 'textureMode' | 'uvs'> & {
	value    : number | "/" | "+" | "-" | "×" | "*" | "x" | "=" | "." | string
	width?   : PositionUnit | "auto" | undefined
	height?  : PositionUnit | "auto" | undefined
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: IconNumber
/**
 * Renders a numeric string from `atlas-numbers.png`.
 * Digit aspect follows `theme.icons.numbers.horizontalInset` so UV crop does not stretch glyphs.
 */
export const IconNumber = ({
	children,
	value   = 0,
	width   = "auto",
	height  = "auto",
	uiTransform,
	...props
}: IconNumberProps) => {
	const theme           = getTheme()
	const size            = theme.icons.size
	const horizontalInset = theme.icons.numbers.horizontalInset
	const digitAspect     = 1 - 2 * horizontalInset

	const glyphs = value.toString()
	const len    = glyphs.length

	const digitHeight = height === "auto" ? size : height
	const digitWidth  = width === "auto" && height === "auto"
		? size * digitAspect
		: width === "auto"
			? `${100 / len}%`
			: undefined

	const icons: ReactEcs.JSX.Element[] = []

	for (let i = 0; i < len; i++) {
		icons.push(
			<Icon
				{...props}
				key         = {i}
				width       = {digitWidth ?? `${100 / len}%`}
				height      = {digitHeight}
				uiTransform = {{
					...(typeof digitWidth === 'number' ? { minWidth: digitWidth } : {}),
					...(typeof digitHeight === 'number' ? { minHeight: digitHeight } : {}),
					...uiTransform,
				}}
				iconSrc     = {'assets/images/scaling-ui/atlas-numbers.png'}
				textureMode = {'stretch'}
				uvs         = {getUVsForAtlasNumber(glyphs[i])}
			/>
		)
	}

	return (
		<UiBox
			{...props}
			uiTransform = {{
				width        : width,
				height       : height === "auto" ? size : height,
				display      : 'flex',
				flexDirection: 'row',
				alignItems   : 'center',
				flexGrow     : 0,
				flexShrink   : 0,
				...uiTransform,
			}}
		>
			{icons}
			{children}
		</UiBox>
	)
}
