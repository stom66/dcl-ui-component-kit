import ReactEcs, { PositionUnit} from '@dcl/sdk/react-ecs'
import { Color4 } from "@dcl/sdk/math"
import { Icon } from './icon'
import { getUVsForAtlasNumber } from '../../utils'
import { Row } from '../helpers'
import { UiBox } from '../base'

type IconNumberProps = Omit<Parameters<typeof Icon>[0], 'iconSrc' | 'textureMode' | 'uvs'> & {
	value    : number | "/" | "+" | "-" | "×" | "*" | "x" | "=" | "." | string
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
	const icons: any = []
	const len = value.toString().length

	for (let i = 0; i < len; i++) {
		icons.push(	
			<Icon 
				{...props}
				key         = {i}
				width       = {`${100 / len}%`} 
				height      = {height} 
				uiTransform = {uiTransform} 
				iconSrc     = 'assets/images/scaling-ui/atlas-numbers.png'
				textureMode = 'stretch'
				uvs         = { getUVsForAtlasNumber(value.toString()[i]) }
			/>
		)
	}

	return (
		<UiBox
			{...props}
			uiTransform = {{
				width : width,
				height: height,
				...uiTransform,
			}}
		>
			{icons}
			{children}
		</UiBox>
	)
}
