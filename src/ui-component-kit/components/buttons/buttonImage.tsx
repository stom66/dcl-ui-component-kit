import { Color4 } from '@dcl/sdk/math'
import { isMobile } from '@dcl/sdk/platform'
import ReactEcs, { PositionUnit, UiTransformProps } from '@dcl/sdk/react-ecs'

import {
	atlasBtnIconsStyled,
	type AtlasTextureSlices,
	type TextureAtlas,
	type TextureAtlasNamedCell,
} from '../../atlases'
import { PropsController } from '../../classes/propsController'
import { scalePositionUnit } from '../../utils/positionUnit'
import { tweenValue } from '../../utils/tweens'
import { getUVCell } from '../../utils/uvs'

import { mergeUiBackground, UiBox, type UiBoxProps } from '../base'


/** 1-based UV rows for button states (bottom → top in the atlas). */
enum ButtonIndex {
	DEFAULT  = 4,
	HOVER    = 3,
	PRESS    = 2,
	DISABLED = 1,
}

const DEFAULT_SCALE = 0.9
const HOVER_SCALE   = 1

const currentIndex  : Map<string, number>  = new Map()
const hoverStates   : Map<string, boolean> = new Map()
const pressedStates : Map<string, boolean> = new Map()

type ButtonImagePropsState = {
	scale: number
}

const buttonProps = new Map<string, PropsController<ButtonImagePropsState>>()

type ButtonImageProps = Omit<UiBoxProps, 'uiTransform'> & {
	id            : string
	/**
	 * 1-based atlas column for this button (first column is `1`).
	 * States are rows within that column.
	 */
	uvColumn      : number
	/**
	 * Preferred atlas instance. Uses `.cell()` (including atlas `inset` /
	 * `insetX` / `insetY`) and `.texture` for wrap / filter. When set,
	 * `textureSrc` / `uvColumnCount` / `uvRowCount` default from the atlas.
	 * When the atlas (or prop) has `textureSlices`, uses native
	 * `textureMode: 'nine-slices'`.
	 */
	atlas        ?: TextureAtlas<Record<string, TextureAtlasNamedCell>>
	/**
	 * Total columns in the atlas. Defaults to `atlas.columns` or
	 * `atlasBtnIconsStyled.columns`. Prefer passing `atlas` for custom sheets.
	 */
	uvColumnCount?: number
	/**
	 * Total rows in the atlas. Defaults to `atlas.rows` or
	 * `atlasBtnIconsStyled.rows`. Prefer passing `atlas` for custom sheets.
	 */
	uvRowCount?  : number
	/**
	 * Optional nine-slice margins (fractions of the texture / UV cell).
	 * Overrides `atlas.textureSlices` when both are set. Passed straight to
	 * `uiBackground.textureSlices` with `textureMode: 'nine-slices'`.
	 */
	textureSlices?: AtlasTextureSlices
	width        ?: PositionUnit | 'auto'
	height       ?: PositionUnit | 'auto'
	/** Atlas texture path. Defaults to `atlas.source` or `atlasBtnIconsStyled.source`. */
	textureSrc   ?: string
	uiTransform  ?: UiTransformProps
	callback     ?: () => void
	children?    : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
}


// MARK: getButtonProps
/** Returns the per-button props controller, creating one if needed. */
function getButtonProps(id: string): PropsController<ButtonImagePropsState> {
	let props = buttonProps.get(id)
	if (!props) {
		props = new PropsController<ButtonImagePropsState>({ scale: DEFAULT_SCALE })
		buttonProps.set(id, props)
	}
	return props
}


// MARK: ButtonImage
/**
 * Renders an image button with per-instance hover and press state.
 * Atlas layout: columns = button variants, rows = states (disabled → default, UV bottom→top).
 * Blank sheets with `textureSlices` use the engine's native nine-slices mode.
 */
export const ButtonImage = ({
	id,
	children,
	uvColumn,
	atlas,
	uvColumnCount,
	uvRowCount,
	textureSlices,
	width         = 64,
	height        = 64,
	textureSrc,
	uiTransform,
	callback,
	onMouseDown,
	onMouseEnter,
	onMouseLeave,
	onMouseUp,
	uiBackground,
	...props
}: ButtonImageProps) => {
	const button = getButtonProps(id)
	const scale  = button.get('scale')
	const row    = currentIndex.get(id) ?? ButtonIndex.DEFAULT

	const resolvedAtlas = atlas
	const columns = uvColumnCount ?? resolvedAtlas?.columns ?? atlasBtnIconsStyled.columns
	const rows    = uvRowCount    ?? resolvedAtlas?.rows    ?? atlasBtnIconsStyled.rows
	const src     = textureSrc    ?? resolvedAtlas?.source  ?? atlasBtnIconsStyled.source

	const sheet =
		resolvedAtlas
		?? (src === atlasBtnIconsStyled.source
			&& columns === atlasBtnIconsStyled.columns
			&& rows    === atlasBtnIconsStyled.rows
			? atlasBtnIconsStyled
			: undefined)

	const uvs = sheet
		? sheet.cell({ xStart: uvColumn, yStart: row })
		: getUVCell({
			xStart: uvColumn,
			yStart: row,
			xTotal: columns,
			yTotal: rows,
		})

	const slices  = textureSlices ?? sheet?.textureSlices
	const texture = sheet
		? sheet.texture
		: { src, wrapMode: 'clamp' as const }

	return (
		<UiBox
			uiTransform={{
				width         : width,
				height        : height,
				overflow      : 'hidden',
				positionType  : 'absolute',
				position      : { top: 20, left: -24 },
				alignItems    : 'center',
				justifyContent: 'center',
				flexShrink    : 0,
				zIndex        : 1000,
				...uiTransform
			}}
		>
			<UiBox
				{...props}
				uiTransform={{
					width       : scalePositionUnit(width, scale),
					height      : scalePositionUnit(height, scale),
					borderWidth : 0,
				}}
				uiBackground={mergeUiBackground({
					texture,
					textureMode  : slices ? 'nine-slices' : 'stretch',
					...(slices ? { textureSlices: slices } : {}),
					uvs,
					color        : Color4.White(),
				}, uiBackground)}
				pointerFilter="block"
				onMouseEnter={() => {
					hoverStates.set(id, true)
					currentIndex.set(id, ButtonIndex.HOVER)
					tweenValue(button.get('scale'), HOVER_SCALE, 0.2, (v) => {
						button.set('scale', v)
					})
					onMouseEnter?.()
				}}
				onMouseLeave={() => {
					hoverStates.set(id, false)
					currentIndex.set(id, ButtonIndex.DEFAULT)
					tweenValue(button.get('scale'), DEFAULT_SCALE, 0.2, (v) => {
						button.set('scale', v)
					})
					onMouseLeave?.()
				}}
				onMouseDown={() => {
					pressedStates.set(id, true)
					hoverStates.set(id, true)
					currentIndex.set(id, ButtonIndex.PRESS)
					onMouseDown?.()
					if (isMobile()) {
						callback?.()
						currentIndex.set(id, ButtonIndex.DEFAULT)
					}
				}}
				onMouseUp={() => {
					if (!isMobile()) {
						callback?.()
						currentIndex.set(id, hoverStates.get(id) === true ? ButtonIndex.HOVER : ButtonIndex.DEFAULT)
					} else {
						currentIndex.set(id, ButtonIndex.DEFAULT)
					}

					onMouseUp?.()
					pressedStates.set(id, false)
				}}
			>
				{children}
			</UiBox>
		</UiBox>
	)
}
