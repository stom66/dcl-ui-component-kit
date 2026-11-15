import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { type KitEntityProps, resolveKitEntityProps } from '../base'

type ZoneRootProps = KitEntityProps & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: ZoneRoot
/**
 * Full-size flex canvas helper for compositions outside SetupUiComponentKit.
 * Prefer SetupUiComponentKit's layer stack for normal layers. Layers should
 * not wrap themselves in ZoneRoot.
 */
export function ZoneRoot({
	children,
	uiTransform,
	...props
}: ZoneRootProps) {
	return (
		<UiEntity
			{...resolveKitEntityProps({
				...props,
				uiTransform: {
					height        : '100%',
					width         : '100%',
					positionType  : 'absolute',
					display       : 'flex',
					flexShrink    : 0,
					flexDirection : 'column',
					alignItems    : 'center',
					justifyContent: 'center',
					...uiTransform
				},
			})}
		>
			{children}
		</UiEntity>
	)
}
