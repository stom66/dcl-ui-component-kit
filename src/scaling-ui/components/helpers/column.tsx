import ReactEcs, { PositionUnit } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { getColSizing } from '../../utils'

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
	const width = getColSizing(cols, colsDesktop, colsMobile) as PositionUnit | 'auto'
	const edge  = uiTransform?.flexDirection === 'column-reverse' ? 'top' : 'bottom'
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
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: 'space-between',
				...uiTransform,
			}}
		>
			{applySpacingToChildren(children, gap, edge)}
		</UiBox>
	)
}
