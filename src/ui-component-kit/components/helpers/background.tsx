import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { mergeUiBackground, UiBox, type UiBoxProps } from '../base'


type BackgroundProps = UiBoxProps & {
	children?  : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Optional texture path applied via `uiBackground.texture`. */
	textureSrc?: string
	/**
	 * When true, sizes to children instead of filling the parent.
	 * Required for Layer / Zone `height: 'auto'` — absolute fill is out of flow
	 * and would collapse the parent to ~0.
	 */
	fitContent?: boolean
}


// MARK: Background
/**
 * Full-size chrome wrapper: fills its parent edge-to-edge with a theme body fill
 * and theme border width/radius by default.
 *
 * Default layout uses absolute insets (not `width`/`height` `100%`) so borders
 * stay inside a sized parent, and `overflow: 'hidden'` so fill/content clips to
 * the border radius.
 *
 * Pass `fitContent` when the parent Zone / Layer uses `height: 'auto'` (or
 * otherwise sizes to children). Absolute fill is out of flex flow and would
 * leave the parent with no in-flow height.
 *
 * Shorthands: `backgroundColor`, `borderColor`, `borderWidth`, `borderRadius`,
 * `textureSrc`. Override size, padding, or flex via `uiTransform`.
 */
export function Background({
	children,
	backgroundColor,
	borderColor,
	borderRadius,
	borderWidth,
	textureSrc,
	fitContent,
	uiTransform,
	uiBackground,
	...props
}: BackgroundProps) {
	const theme = getTheme()
	const fill  = backgroundColor ?? theme.colors.body

	const layout = fitContent
		? {
			width         : '100%' as const,
			height        : 'auto' as const,
			display       : 'flex' as const,
			flexDirection : 'column' as const,
			alignItems    : 'center' as const,
			justifyContent: 'flex-start' as const,
			padding       : 0,
			overflow      : 'hidden' as const,
		}
		: {
			positionType  : 'absolute' as const,
			position      : { top: 0, right: 0, bottom: 0, left: 0 },
			display       : 'flex' as const,
			flexDirection : 'column' as const,
			alignItems    : 'center' as const,
			justifyContent: 'center' as const,
			padding       : 0,
			overflow      : 'hidden' as const,
		}

	return (
		<UiBox
			{...props}
			backgroundColor = {fill}
			borderColor     = {borderColor}
			borderRadius    = {borderRadius ?? theme.border.radiusDefault}
			borderWidth     = {borderWidth  ?? theme.border.width}
			uiTransform={{
				...layout,
				...uiTransform,
			}}
			uiBackground={mergeUiBackground({
				color: fill,
				...(textureSrc !== undefined
					? {
						texture    : { src: textureSrc, wrapMode: 'clamp' as const },
						textureMode: 'stretch' as const,
					}
					: {}),
			}, uiBackground)}
		>
			{children}
		</UiBox>
	)
}
