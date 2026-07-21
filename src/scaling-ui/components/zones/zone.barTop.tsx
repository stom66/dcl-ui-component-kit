import { VisibilityController } from 'src/scaling-ui/components/zones/class.VisibilityController'

import { ZoneDefault } from './zone.default'

const visibilityController = new VisibilityController(0, -1080)

type ZoneBarTopProps = Parameters<typeof ZoneDefault>[0]

export function ZoneBarTop({
	isHidden,
	canBeHidden,
	children,
	uiTransform,
	visibilityController: customVisibilityController,
	...props
}: ZoneBarTopProps) {
	return ZoneDefault({
		...props,
		children,
		isHidden,
		canBeHidden,
		visibilityController: customVisibilityController || visibilityController,
		visibilityPosition  : 'top',
		uiTransform: {
			height: "23%", 
			width : "50%", 
			...uiTransform
		}
	})
}
