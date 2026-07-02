import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'


// MARK: RootCanvas
/**
 * Renders a full-size UI canvas container.
 */
export function ZoneRoot({
	children,
	uiTransform
}: {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	uiTransform?: any
}) {
	return (
		<UiEntity
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
		</UiEntity>
	)
}
