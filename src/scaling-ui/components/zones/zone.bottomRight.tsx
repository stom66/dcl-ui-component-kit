import { VisibilityController } from 'src/scaling-ui/components/zones/class.VisibilityController'

import { ZoneDefault } from './zone.default'

const visibilityController = new VisibilityController(0, -1920)

type ZoneBarRightProps = Parameters<typeof ZoneDefault>[0]

export function ZoneBarRight({
	isHidden,
	canBeHidden,
	children,
	uiTransform,
	visibilityController: customVisibilityController,
	...props
}: ZoneBarRightProps) {
	return ZoneDefault({
		...props,
		children,
		isHidden,
		canBeHidden,
		visibilityController: customVisibilityController || visibilityController,
		visibilityPosition  : 'right',
		uiTransform: {
			height  : "100%", 
			width   : "25%", 
			position: { right: 0, top: 0 },
			...uiTransform
		}
	})
}
