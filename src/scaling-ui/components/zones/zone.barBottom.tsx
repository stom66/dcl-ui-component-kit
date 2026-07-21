import { VisibilityController } from 'src/scaling-ui/components/zones/class.VisibilityController'

import { ZoneDefault } from './zone.default'

const visibilityController = new VisibilityController(0, -1080)

type ZoneBarBottomProps = Parameters<typeof ZoneDefault>[0]

export function ZoneBarBottom({
	isHidden,
	canBeHidden,
	children,
	uiTransform,
	visibilityController: customVisibilityController,
	...props
}: ZoneBarBottomProps) {
	return ZoneDefault({
		...props,
		children,
		isHidden,
		canBeHidden,
		visibilityController: customVisibilityController || visibilityController,
		visibilityPosition  : 'bottom',
		uiTransform: {
			height  : "23%", 
			width   : "50%", 
			position: { bottom: 0, left: 0 },
			...uiTransform
		}
	})
}
