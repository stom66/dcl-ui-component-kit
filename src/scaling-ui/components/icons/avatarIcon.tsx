import ReactEcs, { PositionUnit, TextureMode } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'
import { UiBox, type UiBoxProps } from '../base'


/** Fallback wallet used when `userId` is omitted (useful in local demos / preview). */
//export const DEFAULT_AVATAR_USER_ID = '0xCEC7e38e088A87D77F2B60Fcae6840D00E018155' // stom
export const DEFAULT_AVATAR_USER_ID = '0x1E93E534C5E26B01Ed242410b43AE23dD0fAA52b' // ile


export type AvatarIconProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/**
	 * Player wallet / avatar id. Lowercased before use.
	 * Defaults to `DEFAULT_AVATAR_USER_ID` for demos.
	 */
	userId?     : string
	textureMode?: TextureMode | undefined
	width?      : PositionUnit | 'auto' | undefined
	height?     : PositionUnit | 'auto' | undefined
}


// MARK: AvatarIcon
/**
 * Player portrait via Decentraland `uiBackground.avatarTexture`.
 * Defaults to a square cell sized from `theme.icons.defaultSize`.
 * Pass a single axis and keep `aspectRatio` (default `1`) to derive the other.
 */
export function AvatarIcon({
	children,
	userId      = DEFAULT_AVATAR_USER_ID,
	textureMode,
	width,
	height,
	aspectRatio = 1,
	uiBackground,
	uiTransform,
	...props
}: AvatarIconProps) {
	const theme          = getTheme()
	const size           = theme.icons.minSize
	const defaultSize    = theme.icons.defaultSize
	const resolvedUserId = userId.toLowerCase()

	const hasWidth  = width  !== undefined && width  !== 'auto'
	const hasHeight = height !== undefined && height !== 'auto'

	const resolvedWidth  = !hasWidth && !hasHeight ? defaultSize : (hasWidth  ? width  : undefined)
	const resolvedHeight = !hasWidth && !hasHeight ? defaultSize : (hasHeight ? height : undefined)

	return (
		<UiBox
			{...props}
			aspectRatio = {aspectRatio}
			width       = {resolvedWidth}
			height      = {resolvedHeight}
			uiTransform = {{
				flexGrow  : 0,
				flexShrink: 0,
				overflow  : 'visible',
				...(!hasWidth  ? { minWidth : size } : {}),
				...(!hasHeight ? { minHeight: size } : {}),
				...uiTransform,
			}}
			uiBackground = {{
				avatarTexture: { userId: resolvedUserId },
				textureMode  : textureMode ?? 'stretch',
				...uiBackground,
			}}
		>
			{children}
		</UiBox>
	)
}
