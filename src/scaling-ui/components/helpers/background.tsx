import ReactEcs from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { UiBox, type UiBoxProps } from '../base'


type BackgroundProps = UiBoxProps & {
	children?  : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** Optional texture path applied via `uiBackground.texture`. */
	textureSrc?: string
}


// MARK: Background
/**
 * Full-size chrome wrapper: fills its parent edge-to-edge with a theme body fill
 * and theme border width/radius by default.
 *
 * Uses absolute insets (not `width`/`height` `100%`) so borders stay inside the
 * parent, and `overflow: 'hidden'` so fill/content clips to the border radius.
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
	uiTransform,
	uiBackground,
	...props
}: BackgroundProps) {
	const theme = getTheme()
	const fill  = backgroundColor ?? theme.colors.body

	return (
		<UiBox
			{...props}
			backgroundColor = {fill}
			borderColor     = {borderColor}
			borderRadius    = {borderRadius ?? theme.border.radiusDefault}
			borderWidth     = {borderWidth  ?? theme.border.width}
			uiTransform={{
				positionType  : 'absolute',
				position      : { top: 0, right: 0, bottom: 0, left: 0 },
				display       : 'flex',
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: 'center',
				padding       : 0,
				overflow      : 'hidden',
				...uiTransform,
			}}
			uiBackground={{
				color: fill,
				...(textureSrc !== undefined
					? {
						texture    : { src: textureSrc },
						textureMode: 'stretch' as const,
					}
					: {}),
				...uiBackground,
			}}
		>
			{children}
		</UiBox>
	)
}
