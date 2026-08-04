import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { UiBox, type UiBoxProps } from '../base'
import { textMinHeight } from './textLayout'


type TextProps = Omit<UiBoxProps, 'uiText'> & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Body copy. Prefer this over JSX text children (DCL `uiText` needs `value`). */
	value?  : string
	/** Font color. Defaults to `theme.colors.light`. Overrides `uiText.color`. */
	color?  : Color4
	uiText? : Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: Text
/**
 * Default body text block. Pass copy via `value` (or `uiText.value`); nest element children as needed.
 *
 * Layout notes (DCL / Yoga):
 * - `alignSelf: 'flex-start'` so `height: 'auto'` can measure text (not `stretch`)
 * - `flexShrink: 0` so a height-capped parent `Column` cannot crush the box to 0
 * - `minHeight` one-line floor only — wrap height comes from `height: 'auto'`
 * - `width: '100%'` for wrap width inside sized columns (prefer nesting under
 *   `Column`/`cols`, not as a direct `Row` `cols` child with `width: 0`)
 */
export const Text = ({
	children,
	value,
	color,
	uiText,
	uiTransform,
	...props
}: TextProps) => {
	const theme    = getTheme()
	const fontSize = scaleFontSize(theme.typography.size.default)

	return (
		<UiBox
			{...props}
			uiTransform={{
				width     : '100%',
				height    : 'auto',
				minHeight : textMinHeight(fontSize),
				alignSelf : 'flex-start',
				flexShrink: 0,
				...uiTransform,
			}}
			uiText={{
				fontSize,
				font     : theme.typography.family.default,
				color    : theme.colors.light,
				textAlign: 'middle-left',
				...uiText,
				...(color !== undefined ? { color } : {}),
				value: value ?? uiText?.value ?? '',
			}}
		>
			{children}
		</UiBox>
	)
}
