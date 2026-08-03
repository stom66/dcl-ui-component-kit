import ReactEcs, { PositionUnit, TextureMode } from '@dcl/sdk/react-ecs'

import { atlasIconsFontAwesome } from '../../atlases'
import { getTheme } from '../../styles'
import { mergeUiBackground, UiBox, type UiBoxProps } from '../base'

type IconProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
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
 */
export const Icon = ({
	children,
	src         = atlasIconsFontAwesome.source,
	textureMode,
	uvs,
	width   = "auto",
	height  = "auto",
	uiBackground,
	uiTransform,
	...props
}: IconProps) => {
	const size = getTheme().icons.minSize
	const texture = src === atlasIconsFontAwesome.source
		? atlasIconsFontAwesome.texture
		: { src, wrapMode: 'clamp' as const }

	return (
		<UiBox
			{...props}
			uiTransform={{
				width     : width,
				height    : height,
				flexGrow  : 0,
				flexShrink: 0,
				overflow  : "visible",
				...(width  === "auto" ? { minWidth : size } : {}),
				...(height === "auto" ? { minHeight: size } : {}),
				...uiTransform
			}}
			uiBackground={mergeUiBackground({
				texture,
				textureMode: textureMode ?? "stretch",
				uvs        : uvs ?? [],
			}, uiBackground)}
		>
			{children}
		</UiBox>
	)
}
