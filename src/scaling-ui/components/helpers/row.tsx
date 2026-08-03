import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getColSelfTransform } from '../../utils'

import { UiBox, type UiBoxProps } from '../base'

import { applyRowChildSpacing } from './childSpacing'


type RowProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	cols?       : number
	colsDesktop?: number
	colsMobile? : number
	/**
	 * Gap between children. Defaults to `theme.spacing`. Pass `0` to disable.
	 * Gutters are spacer entities; `cols` children use `flexGrow` so percentages
	 * are not required (Yoga has no `calc()`).
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
	const col  = getColSelfTransform(cols, colsDesktop, colsMobile)
	const edge = uiTransform?.flexDirection === 'row-reverse' ? 'left' : 'right'
	const gap  = spacing ?? getTheme().spacing

	return (
		<UiBox
			{...props}
			uiTransform={{
				height        : 'auto',
				width         : col.width,
				display       : 'flex',
				flexGrow      : col.flexGrow,
				flexShrink    : col.flexShrink,
				flexBasis     : col.flexBasis,
				flexDirection : 'row',
				alignItems    : 'center',
				// flex-start so spacer gutters stay adjacent (space-between fights them)
				justifyContent: 'flex-start',
				...uiTransform,
			}}
		>
			{applyRowChildSpacing(children, gap, edge)}
		</UiBox>
	)
}
