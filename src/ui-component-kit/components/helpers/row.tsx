import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'

import { UiBox, type UiBoxProps } from '../base'

import { applyRowChildSpacing, applyWrapRowGutters } from './childSpacing'


type RowProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/**
	 * Gap between children. Defaults to `theme.spacing`. Pass `0` to disable.
	 * Non-wrap rows use spacer entities. Wrap rows use padded cell wrappers so
	 * sticky `%` cols still pack 12-wide without early wrap.
	 */
	spacing?    : number
}


// MARK: Row
/** Horizontal flex stack; always full parent width. Narrow content with a `Column` child. */
export function Row({
	children,
	uiTransform,
	spacing,
	...props
}: RowProps) {
	const edge   = uiTransform?.flexDirection === 'row-reverse' ? 'left' : 'right'
	const isWrap = uiTransform?.flexWrap === 'wrap'
	const gap    = spacing ?? getTheme().spacing
	const body   = isWrap
		? applyWrapRowGutters(children, gap)
		: applyRowChildSpacing(children, gap, edge)

	return (
		<UiBox
			{...props}
			uiTransform={{
				height        : 'auto',
				width         : '100%',
				display       : 'flex',
				flexDirection : 'row',
				alignItems    : 'center',
				// flex-start so spacer gutters stay adjacent (space-between fights them)
				justifyContent: 'flex-start',
				...uiTransform,
			}}
		>
			{body}
		</UiBox>
	)
}
