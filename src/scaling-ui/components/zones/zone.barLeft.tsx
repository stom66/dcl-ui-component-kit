import { VisibilityController } from 'src/scaling-ui/components/zones/class.VisibilityController'

import { ZoneDefault } from './zone.default'

const visibilityController = new VisibilityController(0, -1920)

type ZoneBarLeftProps = Parameters<typeof ZoneDefault>[0]

export function ZoneBarLeft({
	isHidden,
	canBeHidden,
	children,
	uiTransform,
	visibilityController: customVisibilityController,
	...props
}: ZoneBarLeftProps) {
	return ZoneDefault({
		...props,
		children,
		isHidden,
		canBeHidden,
		visibilityController: customVisibilityController || visibilityController,
		visibilityPosition  : 'left',
		uiTransform: {
			height  : "100%", 
			width   : "25%", 
			position: { left: 0, top: 0 },
			...uiTransform
		}
	})
}
