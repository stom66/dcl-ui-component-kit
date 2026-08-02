import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getColSizing } from '../../utils'

import { UiBox, type UiBoxProps } from '../base'

import { applyRowChildSpacing } from './childSpacing'


type RowProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	cols?       : number
	colsDesktop?: number
	colsMobile? : number
	/**
	 * Gap between children. Defaults to `theme.spacing`. Pass `0` to disable.
	 * When `spacing > 0`, children with `cols` share remaining width via
	 * `flexGrow` (Yoga has no `calc()`, so raw `%` + gutters would overflow).
	 */
	spacing?    : number
}


// MARK: Row
/** Horizontal flex stack with optional column-grid width and child `spacing`. */
export function Row({
	children,
	uiTransform,
	cols,
	colsDesktop,
	colsMobile,
	spacing,
	...props
}: RowProps) {
	const width = getColSizing(cols, colsDesktop, colsMobile) as PositionUnit | 'auto'
	const edge  = uiTransform?.flexDirection === 'row-reverse' ? 'left' : 'right'
	const gap   = spacing ?? getTheme().spacing

	return (
		<UiBox
			{...props}
			uiTransform={{
				height        : 'auto',
				width         : width,
				display       : 'flex',
				flexGrow      : 0,
				flexShrink    : 0,
				flexDirection : 'row',
				alignItems    : 'center',
				justifyContent: 'space-between',
				...uiTransform,
			}}
		>
			{applyRowChildSpacing(children, gap, edge)}
		</UiBox>
	)
}
