import ReactEcs, {} from '@dcl/sdk/react-ecs'
import { Column } from './column'

export function ColumnReverse({
	children,
	uiTransform
}: {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiTransform?: any
}) {
	return Column({
		children,
		uiTransform: {flexDirection: "column-reverse", ...uiTransform}
	})
}
