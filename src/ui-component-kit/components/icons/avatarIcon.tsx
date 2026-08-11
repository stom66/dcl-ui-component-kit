import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, TextureMode } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { mergeUiBackground, UiBox, type UiBoxProps } from '../base'
import { IconBackgroundWrap } from './icon.backgroundWrap'
import { resolveIconRotatedUvs } from './icon.uvs'


/** Fallback wallet used when `userId` is omitted (useful in local demos / preview). */
//export const DEFAULT_AVATAR_USER_ID = '0xCEC7e38e088A87D77F2B60Fcae6840D00E018155' // stom
//export const DEFAULT_AVATAR_USER_ID = '0x8967AD851cCbD4C1a2D57A128D3C606fCAB29bad' // KJ
export const DEFAULT_AVATAR_USER_ID = '0x1E93E534C5E26B01Ed242410b43AE23dD0fAA52b' // ile


export type AvatarIconProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/**
	 * Player wallet / avatar id. Lowercased before use.
	 * Defaults to `DEFAULT_AVATAR_USER_ID` for demos.
	 */
	userId?     : string
	/**
	 * Tint multiply for the avatar texture. Only way to recolour the portrait —
	 * `backgroundColor` paints a chip behind it via a wrapper.
	 */
	iconColor?  : Color4
	/**
	 * Degrees to rotate the portrait UVs around the cell centre.
	 * Same static UV rotate as `Icon.rotate`.
	 */
	rotate?     : number
	textureMode?: TextureMode | undefined
	width?      : PositionUnit | 'auto' | undefined
	height?     : PositionUnit | 'auto' | undefined
}


// MARK: AvatarIcon
/**
 * Player portrait via Decentraland `uiBackground.avatarTexture`.
 * Defaults to a square cell sized from `theme.icons.defaultSize`.
 * Pass a single axis and keep `aspectRatio` (default `1`) to derive the other.
 * Defaults `overflow: 'hidden'` so `borderRadius` clips the portrait.
 *
 * Tint with `iconColor`. `backgroundColor` wraps a chip behind the portrait.
 * `rotate` turns the portrait UVs.
 */
export function AvatarIcon({
	children,
	userId      = DEFAULT_AVATAR_USER_ID,
	iconColor,
	rotate,
	backgroundColor,
	borderColor,
	borderRadius,
	borderWidth,
	padding,
	margin,
	textureMode,
	width,
	height,
	aspectRatio = 1,
	uiBackground,
	uiTransform,
	onMouseDown,
	onMouseUp,
	onMouseEnter,
	onMouseLeave,
	...props
}: AvatarIconProps) {
	const theme          = getTheme()
	const size           = theme.icons.minSize
	const defaultSize    = theme.icons.defaultSize
	const resolvedUserId = userId.toLowerCase()
	const wrapChip       = backgroundColor !== undefined
	const resolvedUvs    = resolveIconRotatedUvs(undefined, rotate)

	const hasWidth  = width  !== undefined && width  !== 'auto'
	const hasHeight = height !== undefined && height !== 'auto'

	const resolvedWidth  = !hasWidth && !hasHeight ? defaultSize : (hasWidth  ? width  : undefined)
	const resolvedHeight = !hasWidth && !hasHeight ? defaultSize : (hasHeight ? height : undefined)

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
			aspectRatio = {wrapChip ? undefined : aspectRatio}
			width       = {wrapChip ? '100%' : resolvedWidth}
			height      = {wrapChip ? '100%' : resolvedHeight}
			uiTransform = {{
				flexGrow  : 0,
				flexShrink: 0,
				overflow  : 'hidden',
				...(!wrapChip && !hasWidth  ? { minWidth : size } : {}),
				...(!wrapChip && !hasHeight ? { minHeight: size } : {}),
				...(wrapChip ? {} : uiTransform),
			}}
			uiBackground = {mergeUiBackground({
				avatarTexture: { userId: resolvedUserId },
				textureMode  : textureMode ?? 'stretch',
				...(resolvedUvs ? { uvs: resolvedUvs } : {}),
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
			width           = {resolvedWidth}
			height          = {resolvedHeight}
			minSize         = {size}
			onMouseDown     = {onMouseDown}
			onMouseUp       = {onMouseUp}
			onMouseEnter    = {onMouseEnter}
			onMouseLeave    = {onMouseLeave}
			uiTransform     = {{
				overflow: 'hidden',
				...uiTransform,
			}}
			children        = {glyph}
		/>
	)
}
