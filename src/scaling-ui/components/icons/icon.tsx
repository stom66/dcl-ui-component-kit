import ReactEcs, { PositionUnit, TextureMode } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'

type IconProps = UiBoxProps & {
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	iconSrc     : string
	textureMode?: TextureMode | undefined
	uvs?        : number[]
	width?      : PositionUnit | "auto" | undefined
	height?     : PositionUnit | "auto" | undefined
}

export const Icon = ({
	children,
	iconSrc,
	textureMode,
	uvs,
	width   = "auto",
	height  = "auto",
	uiBackground,
	uiTransform,
	...props
}: IconProps) => {
	return (
		<UiBox
			{...props}
			uiTransform={{
				width     : width,
				height    : height,
				flexGrow  : 0,
				flexShrink: 0,
				minWidth  : "32",
				minHeight : "32",
				...uiTransform
			}}
			uiBackground={{
				texture    : { src: iconSrc, },
				textureMode: textureMode ?? "stretch",
				uvs        : uvs ?? [],
				...uiBackground
			}}
		>
			{children}
		</UiBox>
	)
}
