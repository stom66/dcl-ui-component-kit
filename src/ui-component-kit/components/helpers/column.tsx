import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getColSelfTransform } from '../../utils'

import { UiBox, type UiBoxProps } from '../base'

import { applySpacingToChildren } from './childSpacing'


type ColumnProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	cols?       : number
	colsDesktop?: number
	colsMobile? : number
	/** Gap between children. Defaults to `theme.spacing`. Pass `0` to disable. */
	spacing?    : number
}


// MARK: Column
/** Vertical flex stack with optional column-grid width and child `spacing`. */
export function Column({
	children,
	uiTransform,
	cols,
	colsDesktop,
	colsMobile,
	spacing,
	...props
}: ColumnProps) {
	const col   = getColSelfTransform(cols, colsDesktop, colsMobile)
	const edge  = uiTransform?.flexDirection === 'column-reverse' ? 'top' : 'bottom'
	const gap   = spacing ?? getTheme().spacing

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
				flexDirection : 'column',
				alignItems    : 'center',
				// flex-start so spacer gutters stay adjacent (space-between fights them)
				justifyContent: 'flex-start',
				...uiTransform,
			}}
		>
			{applySpacingToChildren(children, gap, edge)}
		</UiBox>
	)
}
