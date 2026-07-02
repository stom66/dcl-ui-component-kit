import ReactEcs, { Button, PositionUnit, TextureMode, UiEntity} from '@dcl/sdk/react-ecs'
import { Color4 } from "@dcl/sdk/math"

export const Icon = ({
	children,
	iconSrc,
	textureMode,
	uvs,
	width   = "auto",
	height  = "auto",
	uiTransform
}: { 
	children?   : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	iconSrc     : string
	textureMode?: TextureMode | undefined
	uvs?        : number[]
	width?      : PositionUnit | "auto" | undefined
	height?     : PositionUnit | "auto" | undefined
	uiTransform?: any
}) => {
	return (
		<UiEntity
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
				uvs        : uvs ?? []
			}}
		>
			{children}
		</UiEntity>
	)
}
