import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, TextureMode } from '@dcl/sdk/react-ecs'

import { atlasIconsFontAwesome } from '../../atlases'
import { getTheme } from '../../styles'
import { mergeUiBackground, UiBox, type UiBoxProps } from '../base'
import { IconBackgroundWrap } from './icon.backgroundWrap'

export type IconProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/**
	 * Tint multiply for the icon texture (applied as `uiBackground.color` on
	 * the glyph). This is the only way to recolour the texture — do not use
	 * `backgroundColor` for tinting.
	 */
	iconColor?  : Color4
	/**
	 * Chip / panel fill behind the glyph. When set, the icon is wrapped in an
	 * extra `UiBox` that owns the fill (and border / padding chrome).
	 */
	backgroundColor?: Color4
	/** Texture path. Defaults to the bundled Font Awesome atlas. */
	src?        : string
	textureMode?: TextureMode | undefined
	uvs?        : number[]
	width?      : PositionUnit | "auto" | undefined
	height?     : PositionUnit | "auto" | undefined
}


// MARK: Icon
/**
 * Texture icon. Defaults to a square cell sized from `theme.icons.size` when
 * `width` / `height` are `"auto"` (virtual UI pixels, scaled by the client).
 * `src` defaults to `atlasIconsFontAwesome.source` and inherits that atlas's
 * `wrapMode` / `filterMode` (override via `uiBackground.texture` — deep-merged).
 *
 * Tint with `iconColor` only. `backgroundColor` paints a chip behind the glyph
 * (wrapper `UiBox`) — it never multiplies the texture.
 */
export const Icon = ({
	children,
	iconColor,
	backgroundColor,
	borderColor,
	borderRadius,
	borderWidth,
	padding,
	margin,
	src         = atlasIconsFontAwesome.source,
	textureMode,
	uvs,
	width   = "auto",
	height  = "auto",
	uiBackground,
	uiTransform,
	onMouseDown,
	onMouseUp,
	onMouseEnter,
	onMouseLeave,
	...props
}: IconProps) => {
	const size = getTheme().icons.minSize
	const texture = src === atlasIconsFontAwesome.source
		? atlasIconsFontAwesome.texture
		: { src, wrapMode: 'clamp' as const }

	const wrapChip = backgroundColor !== undefined

	const glyph = (
		<UiBox
			{...props}
			{...(wrapChip
				? {}
				: {
					borderColor,
					borderRadius,
					borderWidth,
					padding,
					margin,
					onMouseDown,
					onMouseUp,
					onMouseEnter,
					onMouseLeave,
				}
			)}
			uiTransform={{
				width     : wrapChip ? '100%' : width,
				height    : wrapChip ? '100%' : height,
				flexGrow  : 0,
				flexShrink: 0,
				overflow  : "visible",
				...(!wrapChip && width  === "auto" ? { minWidth : size } : {}),
				...(!wrapChip && height === "auto" ? { minHeight: size } : {}),
				...(wrapChip ? {} : uiTransform),
			}}
			uiBackground={mergeUiBackground({
				texture,
				textureMode: textureMode ?? "stretch",
				uvs        : uvs ?? [],
				...(iconColor ? { color: iconColor } : {}),
			}, uiBackground)}
		>
			{children}
		</UiBox>
	)

	if (!wrapChip) {
		return glyph
	}

	return (
		<IconBackgroundWrap
			backgroundColor = {backgroundColor}
			borderColor     = {borderColor}
			borderRadius    = {borderRadius}
			borderWidth     = {borderWidth}
			padding         = {padding}
			margin          = {margin}
			width           = {width}
			height          = {height}
			minSize         = {size}
			onMouseDown     = {onMouseDown}
			onMouseUp       = {onMouseUp}
			onMouseEnter    = {onMouseEnter}
			onMouseLeave    = {onMouseLeave}
			uiTransform     = {uiTransform}
			children        = {glyph}
		/>
	)
}
