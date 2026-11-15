import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getColSelfTransform, type ColSpanInput } from '../../utils'

import { type KitEntityProps, resolveKitEntityProps } from '../base'

import { applySpacingToChildren } from './childSpacing'


type ColumnProps = KitEntityProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	cols?       : ColSpanInput
	colsDesktop?: ColSpanInput
	colsMobile? : ColSpanInput
	/** Gap between children. Defaults to `theme.spacing`. Pass `0` to disable. */
	spacing?    : number
}


// MARK: Column
/**
 * Vertical flex stack. Pass `cols="auto"` to fill leftover row space; omit `cols` for no grid sizing.
 * Prefer layout shorthands (`alignItems`, `justifyContent`, `padding`, `margin`, …)
 * over nesting `uiTransform`.
 */
export function Column({
	children,
	uiTransform,
	cols,
	colsDesktop,
	colsMobile,
	spacing,
	...props
}: ColumnProps) {
	// Omitted cols → no grid sizing. `cols="auto"` → fill leftover row space.
	const col   = getColSelfTransform(cols, colsDesktop, colsMobile, 'none')
	const edge  = uiTransform?.flexDirection === 'column-reverse' ? 'top' : 'bottom'
	const gap   = spacing ?? getTheme().spacing

	return (
		<UiEntity
			{...resolveKitEntityProps({
				...props,
				uiTransform: {
					height        : 'auto',
					display       : 'flex',
					flexDirection : 'column',
					alignItems    : 'center',
					// flex-start so spacer gutters stay adjacent (space-between fights them)
					justifyContent: 'flex-start',
					...(col !== undefined ? {
						width     : col.width,
						flexGrow  : col.flexGrow,
						flexShrink: col.flexShrink,
						...(col.flexBasis !== undefined ? { flexBasis: col.flexBasis } : {}),
						...(col.maxWidth  !== undefined ? { maxWidth : col.maxWidth  } : {}),
					} : {}),
					...uiTransform,
				},
			})}
		>
			{applySpacingToChildren(children, gap, edge)}
		</UiEntity>
	)
}
