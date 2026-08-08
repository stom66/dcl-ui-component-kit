import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'

import { UiBox, type UiBoxProps } from '../base'

import { applyRowChildSpacing, applyWrapRowGutters } from './childSpacing'


type RowProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/**
	 * Gap between children. Defaults to `theme.spacing`. Pass `0` to disable.
	 * Rows with `cols` children use padded cell wrappers so sticky `%` spans
	 * pack 12-wide without overflow. Content-sized (no `cols`) non-wrap rows
	 * use spacer entities; wrap rows always use padded wrappers.
	 */
	spacing?    : number
}


// MARK: Row
/**
 * Horizontal flex stack; always full parent width. Narrow content with a `Column` child.
 *
 * Prefer layout shorthands (`flexWrap`, `alignItems`, `justifyContent`, `padding`,
 * `margin`, …) over nesting `uiTransform`. Default `flexWrap` is Yoga/`nowrap` —
 * children stay on one line and overflow rather than wrapping; set `flexWrap="wrap"`
 * for inventory-style grids.
 */
export function Row({
	children,
	uiTransform,
	spacing,
	flexWrap,
	...props
}: RowProps) {
	const edge   = uiTransform?.flexDirection === 'row-reverse' ? 'left' : 'right'
	const isWrap = (flexWrap ?? uiTransform?.flexWrap) === 'wrap'
	const gap    = spacing ?? getTheme().spacing
	const body   = isWrap
		? applyWrapRowGutters(children, gap)
		: applyRowChildSpacing(children, gap, edge)

	return (
		<UiBox
			{...props}
			flexWrap={flexWrap}
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
