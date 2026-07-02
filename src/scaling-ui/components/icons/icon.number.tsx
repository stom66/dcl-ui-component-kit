import ReactEcs, { Button, PositionUnit, TextureMode, UiEntity} from '@dcl/sdk/react-ecs'
import { Color4 } from "@dcl/sdk/math"
import { Icon } from './icon'
import { getUVsForAtlasNumber } from 'src/scaling-ui/utils'

export const IconNumber = ({
	children,
	value   = 0,
	width   = "auto",
	height  = "auto",
	uiTransform,
}: { 
	value       : number | "/" | "+" | "-" | "×" | "*" | "x" | "=" | "."
	width?      : PositionUnit | "auto" | undefined
	height?     : PositionUnit | "auto" | undefined
	uiTransform?: any
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}) => {
	return (
		<Icon 
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
