import ReactEcs, { Button, UiEntity} from '@dcl/sdk/react-ecs'
import { ZoneDefault } from './zone.default'

export function ZoneBarBottom({
	isHidden,
	canBeHidden,
	children,
	uiTransform
}: {
	isHidden?   : boolean
	canBeHidden?: boolean
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiTransform?: any
}) {
	return ZoneDefault({
		children,
		isHidden,
		canBeHidden,
		uiTransform: {
			height  : "23%", 
			width   : "50%", 
			position: { bottom: 0, left: 0 },
			...uiTransform
		}
	})
}
