import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { resolveKitEntityProps, type KitEntityProps } from './kitEntityProps'


/** @deprecated Use `KitEntityProps`. */
export type UiBoxProps = KitEntityProps


// MARK: UiBox
/**
 * @deprecated Use the SDK `UiEntity` for plain boxes, or `Column` / `Row` for
 * layout containers. Kept so existing scenes keep working — see
 * `docs/upgrade-caveats.md` for the migration table.
 *
 * Thin shim: `<UiEntity {...resolveKitEntityProps(props)}>`.
 */
export function UiBox({ children, ...props }: UiBoxProps) {
	return (
		<UiEntity {...resolveKitEntityProps(props)}>
			{children}
		</UiEntity>
	)
}
