import ReactEcs, {} from '@dcl/sdk/react-ecs'
import { Row } from './row'

export function RowReverse({
	children,
	uiTransform
}: {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiTransform?: any
}) {
	return Row({
		children,
		uiTransform: {flexDirection: "row-reverse", ...uiTransform}
	})
}
