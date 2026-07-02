import ReactEcs, { Button, UiEntity} from '@dcl/sdk/react-ecs'
import { ZoneDefault } from './zone.default'

export function ZoneFullScreen({
	children,
	uiTransform
}: {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiTransform?: any
}) {
	return ZoneDefault({
		children,
		uiTransform: {
			height: "100%", 
			width : "100%", 
			...uiTransform
		}
	})
}
