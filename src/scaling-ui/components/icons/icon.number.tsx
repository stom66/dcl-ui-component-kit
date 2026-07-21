import ReactEcs, { PositionUnit} from '@dcl/sdk/react-ecs'
import { Color4 } from "@dcl/sdk/math"
import { Icon } from './icon'
import { getUVsForAtlasNumber } from 'src/scaling-ui/utils'

type IconNumberProps = Omit<Parameters<typeof Icon>[0], 'iconSrc' | 'textureMode' | 'uvs'> & {
	value    : number | "/" | "+" | "-" | "×" | "*" | "x" | "=" | "."
	width?   : PositionUnit | "auto" | undefined
	height?  : PositionUnit | "auto" | undefined
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}

export const IconNumber = ({
	children,
	value   = 0,
	width   = "auto",
	height  = "auto",
	uiTransform,
	...props
}: IconNumberProps) => {
	return (
		<Icon 
			{...props}
			width       = {width} 
			height      = {height} 
			uiTransform = {uiTransform} 
			iconSrc     = 'assets/images/scaling-ui/atlas-numbers.png'
			textureMode = 'stretch'
			uvs         = { getUVsForAtlasNumber(value) }
		>
			{children}
		</Icon>
	)
}
