import ReactEcs from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from 'src/scaling-ui/components/base'
import { vhToPixels } from 'src/scaling-ui/utils'
import { randomColor } from 'src/scaling-ui/utils/colors'

import { ButtonImageClose } from '../buttons'
import { VisibilityController } from './class.VisibilityController'


const color      = randomColor()
const controller = new VisibilityController(0, -1080)

type VisibilityPosition = 'bottom' | 'left' | 'right' | 'top'

type ZoneDefaultProps = UiBoxProps & {
	canBeHidden?         : boolean
	isHidden?            : boolean
	children?            : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	visibilityController?: VisibilityController
	visibilityPosition?  : VisibilityPosition
}


export function ZoneDefault({
	isHidden             = false,
	canBeHidden          = false,
	children             = [],
	uiTransform          = {},
	uiBackground,
	visibilityController = controller,
	visibilityPosition   = 'bottom',
	...props
}: ZoneDefaultProps) {
	if (canBeHidden) {
		visibilityController.initialize(isHidden)

		if (children && !Array.isArray(children)) children = [children]

		children = [
			<ButtonImageClose
				key='close'
				callback={() => {
					visibilityController.toggle()
				}}
			/>,
			...(children || [])
		]
	}

	const uiPosition = uiTransform.position && typeof uiTransform.position === 'object'
		? uiTransform.position
		: {}

	return (
		<UiBox
			{...props}
			uiTransform={{
				height        : vhToPixels(50),
				width         : vhToPixels(75),
				display       : "flex",
				flexGrow      : 0,
				flexShrink    : 0,
				flexDirection : "column",
				alignItems    : "center",
				justifyContent: "center",
				...uiTransform,
				positionType  : canBeHidden ? "relative" : uiTransform.positionType,
				position      : canBeHidden
					? { ...uiPosition, [visibilityPosition]: visibilityController.position }
					: uiTransform.position
			}}

			uiBackground={{
				color: color,
				...uiBackground
			}}
		>
			{children}
		</UiBox>
	)
}
