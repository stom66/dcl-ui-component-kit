import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { vhToPixels } from 'src/scaling-ui/utils'
import { randomColor } from 'src/scaling-ui/utils/colors'

import { ButtonImageClose } from '../buttons'
import { VisibilityController } from './class.VisibilityController'


const color      = randomColor()
const controller = new VisibilityController(0, -1080)

let hasInitializedVisibility = false
let currentIsHidden          = false


export function ZoneDefault({
	isHidden    = false,
	canBeHidden = false,
	children    = [],
	uiTransform = {},
}: {
	canBeHidden?: boolean
	isHidden?   : boolean
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiTransform?: any
}) {
	if (canBeHidden) {
		if (!hasInitializedVisibility) {
			currentIsHidden = isHidden
			isHidden ? controller.hide(0) : controller.show(0)

			hasInitializedVisibility = true
		}

		if (children && !Array.isArray(children)) children = [children]

		children = [
			<ButtonImageClose
				key='close'
				callback={() => {
					currentIsHidden = !currentIsHidden
					currentIsHidden ? controller.hide() : controller.show()
				}}
			/>,
			...(children || [])
		]
	}

	return (
		<UiEntity
			uiTransform={{
				height        : vhToPixels(50),
				width         : vhToPixels(75),
				display       : "flex",
				flexGrow      : 0,
				flexShrink    : 0,
				flexDirection : "column",
				alignItems    : "center",
				justifyContent: "center",
				positionType  : canBeHidden ? "relative" : undefined,
				position      : canBeHidden ? { bottom : controller.position, left: 0 } : undefined,
				...uiTransform
			}}

			uiBackground={{
				color: color,
			}}
		>
			{children}
		</UiEntity>
	)
}
