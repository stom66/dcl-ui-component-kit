import ReactEcs, { Button, UiEntity} from '@dcl/sdk/react-ecs'
import { ZoneDefault } from './zone.default'

export function ZoneBarLeft({
	children,
	uiTransform
}: {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiTransform?: any
}) {
	return ZoneDefault({
		children,
		uiTransform: {
			height  : "100%", 
			width   : "25%", 
			position: { left: 0, top: 0 },
			...uiTransform
		}
	})
}
