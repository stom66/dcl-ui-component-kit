import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { PositionUnit, UiTransformProps } from '@dcl/sdk/react-ecs'

import { getTheme } from '../../styles'

import { UiBox, type UiBoxProps } from '../base'

import { type FillFrom, resolveDefaultBorderRadius, resolveFillFrom, resolveProceduralFillInset, syncDisplayValue, valueToPercent, Z_INDEX_BACKGROUND, Z_INDEX_BORDER, Z_INDEX_CONTENT, Z_INDEX_FILL } from './progressBar.shared'


export type ProgressBarProps = Omit<
	UiBoxProps,
	'uiTransform' | 'backgroundColor' | 'borderColor' | 'borderWidth' | 'borderRadius'
> & {
	/** Unique id for the per-instance PropsController / lerp state. */
	id             : string
	/** Current progress value (lerped toward on change). */
	value          : number
	/** Lower bound of the value range. Defaults to `0`. */
	minValue?      : number
	/** Upper bound of the value range. Defaults to `100`. */
	maxValue?      : number
	/** Edge the fill grows from. Defaults to `'left'`. */
	fillFrom?      : FillFrom
	width?         : PositionUnit | 'auto'
	height?        : PositionUnit | 'auto'
	/** Fill (middle) layer color. Defaults to theme primary. */
	fillColor?     : Color4
	/** Track (back) layer color. Defaults to theme dark. */
	backgroundColor?: Color4
	/** Border (front) layer color. Defaults to theme secondary. */
	borderColor?   : Color4
	borderWidth?   : number
	/**
	 * Corner radius. Defaults to half the shortest measurable axis
	 * (pill shape). Pass explicitly to override.
	 */
	borderRadius?  : number
	/** Seconds to lerp when `value` changes. Defaults to theme animation value. */
	lerpDuration?  : number
	uiTransform?   : UiTransformProps
}


// MARK: ProgressBar
/**
 * Color progress bar: background (back) → fill (middle) → border (front).
 * Defaults: fill = primary, track = dark, border = secondary, radius = half shortest axis.
 * Pass `fillFrom` to choose the fill origin (`left` / `right` / `top` / `bottom`).
 * Value changes lerp via a per-`id` PropsController.
 */
export function ProgressBar({
	id,
	value,
	minValue         = 0,
	maxValue         = 100,
	fillFrom         = 'left',
	width            = '100%',
	height           = 24,
	fillColor,
	backgroundColor,
	borderColor,
	borderWidth,
	borderRadius,
	lerpDuration,
	uiTransform,
	uiBackground,
	children,
	...props
}: ProgressBarProps) {
	const theme    = getTheme()
	const fill     = fillColor      ?? theme.colors.primary
	const track    = backgroundColor ?? theme.colors.dark
	const border   = borderColor    ?? theme.colors.secondary
	const bWidth   = borderWidth    ?? theme.border.width
	const bRadius  = borderRadius   ?? resolveDefaultBorderRadius(width, height)
	const duration = lerpDuration   ?? theme.animation.progressBarLerpDurationDefault
	const inset    = resolveProceduralFillInset(bWidth)
	const fillRadius = Math.max(0, bRadius - inset)

	const display  = syncDisplayValue(id, value, minValue, maxValue, duration)
	const percent  = valueToPercent(display, minValue, maxValue)
	const layout   = resolveFillFrom(fillFrom, percent)

	return (
		<UiBox
			{...props}
			uiTransform={{
				width         : width,
				height        : height,
				...(height !== 'auto' ? { minHeight: height } : {}),
				display       : 'flex',
				flexDirection : layout.flexDirection,
				alignItems    : layout.alignItems,
				justifyContent: 'flex-start',
				flexGrow      : 0,
				flexShrink    : 0,
				overflow      : 'hidden',
				borderRadius  : bRadius,
				...uiTransform,
			}}
			uiBackground={uiBackground}
		>
			{/* Background (back) */}
			<UiBox
				key             = {`${id}_bg`}
				backgroundColor = {track}
				uiTransform={{
					positionType: 'absolute',
					position    : { top: 0, right: 0, bottom: 0, left: 0 },
					borderRadius: bRadius,
					zIndex      : Z_INDEX_BACKGROUND,
				}}
			/>

			{/* Fill (middle) — inset by border width so it stays inside the stroke */}
			<UiBox
				key = {`${id}_fill_host`}
				uiTransform={{
					positionType  : 'absolute',
					position      : {
						top   : inset,
						right : inset,
						bottom: inset,
						left  : inset,
					},
					display       : 'flex',
					flexDirection : layout.flexDirection,
					alignItems    : layout.alignItems,
					justifyContent: 'flex-start',
					overflow      : 'hidden',
					borderRadius  : fillRadius,
					zIndex        : Z_INDEX_FILL,
				}}
			>
				<UiBox
					key             = {`${id}_fill`}
					backgroundColor = {fill}
					uiTransform={{
						width       : layout.fillWidth,
						height      : layout.fillHeight,
						borderRadius: fillRadius,
						flexGrow    : 0,
						flexShrink  : 0,
					}}
				/>
			</UiBox>

			{/* Border (front) */}
			<UiBox
				key          = {`${id}_border`}
				borderColor  = {border}
				borderWidth  = {bWidth}
				borderRadius = {bRadius}
				uiTransform={{
					positionType: 'absolute',
					position    : { top: 0, right: 0, bottom: 0, left: 0 },
					zIndex      : Z_INDEX_BORDER,
				}}
			/>

			{children != null && (
				<UiBox
					key = {`${id}_content`}
					uiTransform={{
						positionType  : 'absolute',
						position      : { top: 0, right: 0, bottom: 0, left: 0 },
						display       : 'flex',
						alignItems    : 'center',
						justifyContent: 'center',
						zIndex        : Z_INDEX_CONTENT,
					}}
				>
					{children}
				</UiBox>
			)}
		</UiBox>
	)
}
