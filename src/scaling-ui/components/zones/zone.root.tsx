import ReactEcs from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from 'src/scaling-ui/components/base'

type ZoneRootProps = UiBoxProps & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: RootCanvas
/**
 * Renders a full-size UI canvas container.
 */
export function ZoneRoot({
	children,
	uiTransform,
	...props
}: ZoneRootProps) {
	return (
		<UiBox
			{...props}
			uiTransform={{
				height        : "100%",
				width         : "100%",
				display       : "flex",
				flexShrink    : 0,
				flexDirection : "column",
				alignItems    : "center",
				justifyContent: "center",
				...uiTransform
			}}
		>
			{children}
		</UiBox>
	)
}
