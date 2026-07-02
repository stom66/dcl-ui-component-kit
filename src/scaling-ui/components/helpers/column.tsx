import ReactEcs, { UiEntity} from '@dcl/sdk/react-ecs'

export function Column({
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
				flexDirection : "column",
				alignItems    : "center",
				justifyContent: "space-between",
				...uiTransform
			}}
		>
			{children}
		</UiEntity>
	)
}
