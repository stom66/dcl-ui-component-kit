import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from 'src/scaling-ui/components/base'
import { getColSizing } from 'src/scaling-ui/utils'

type RowProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	cols?       : number
	colsDesktop?: number
	colsMobile? : number
}

export function Row({
	children,
	uiTransform,
	cols,
	colsDesktop,
	colsMobile,
	...props
}: RowProps) {

	const width = getColSizing(cols, colsDesktop, colsMobile) as PositionUnit | "auto"
	return (
		<UiBox
			{...props}
			uiTransform={{
				height        : "auto",
				width         : width,
				display       : "flex",
				flexGrow      : 0,
				flexShrink    : 0,
				flexDirection : "row",
				alignItems    : "center",
				justifyContent: "space-between",
				...uiTransform
			}}
		>
			{children}
		</UiBox>
	)
}
