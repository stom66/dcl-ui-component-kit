import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

export function Row({
	children,
	uiTransform
}: {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiTransform?: any
}) {
	return (
		<UiEntity
			uiTransform={{
				height        : "auto",
				width         : "auto",
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
		</UiEntity>
	)
}
