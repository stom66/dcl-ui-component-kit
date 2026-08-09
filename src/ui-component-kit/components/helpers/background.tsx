import { Color4 } from '@dcl/sdk/math'
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
 * Full-size panel chrome: fills its parent edge-to-edge with a theme body fill
 * and theme border width/radius by default.
 *
 * **Sibling chrome only** — do not nest content inside `Background`. Render it
 * as a peer of the real body (`Row` / `Column` / …) so the parent Zone keeps
 * owning flex alignment. Nesting creates a new flex root and discards zone
 * `alignItems` / `justifyContent`.
 *
 * Default layout uses absolute insets (not `width`/`height` `100%`) so borders
 * stay inside a sized parent, and `overflow: 'hidden'` so fill clips to the
 * border radius. Absolute chrome stays out of flex flow; in-flow siblings size
 * auto-height Zones.
 *
 * Pass `fitContent` only for rare self-sized chrome (not Layer panel chrome).
 *
 * Shorthands (prefer over nesting):
 * - Fill: `backgroundColor` → `uiBackground.color`
 * - Border: `borderColor` / `borderWidth` / `borderRadius`
 * - Texture: `textureSrc`
 * - Layout: `padding`, `alignItems`, `justifyContent`, … (UiBox transform shorthands)
 *
 * Override anything else via `uiTransform` / `uiBackground`.
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
	const fill: Color4 = backgroundColor ?? theme.colors.body

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
