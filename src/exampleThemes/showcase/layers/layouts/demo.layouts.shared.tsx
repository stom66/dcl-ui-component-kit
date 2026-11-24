import { engine } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { type PositionUnit } from '@dcl/sdk/react-ecs'

import { alpha, atlasIconsFontAwesome, Column, getTheme, Icon, Label, Text } from '../../../../ui-component-kit'


export type FaIconName = keyof typeof atlasIconsFontAwesome.uv


// MARK: demoClock
/**
 * Seconds since the scene started. Layout demos derive their animated
 * timers from this so nothing needs its own interval.
 */
let elapsedSeconds = 0
engine.addSystem((dt: number) => {
	elapsedSeconds += dt
})

export function demoClock(): number {
	return elapsedSeconds
}


// MARK: formatClock
/** `m:ss` (or `m:ss.cc` with `centiseconds`). Negative input clamps to 0. */
export function formatClock(seconds: number, centiseconds = false): string {
	const safe  = Math.max(0, seconds)
	const mins  = Math.floor(safe / 60)
	const secs  = Math.floor(safe % 60)
	const base  = `${mins}:${secs.toString().padStart(2, '0')}`
	if (!centiseconds) return base
	const cs = Math.floor((safe * 100) % 100)
	return `${base}.${cs.toString().padStart(2, '0')}`
}


// MARK: FaIcon
/** Font Awesome atlas icon shorthand. */
export function FaIcon({
	name,
	size  = 24,
	color,
	margin,
}: {
	key?   : string
	name   : FaIconName
	size?  : number
	color? : Color4
	margin?: { top?: number, right?: number, bottom?: number, left?: number }
}) {
	return (
		<Icon
			src       = {atlasIconsFontAwesome.source}
			uvs       = {atlasIconsFontAwesome.uv[name]}
			width     = {size}
			height    = {size}
			iconColor = {color}
			margin    = {margin}
		/>
	)
}


// MARK: SectionLabel
/** Full-width section caption chip used between demo blocks. */
export function SectionLabel({ value, color }: { value: string, color?: Color4 }) {
	const theme = getTheme()
	return (
		<Label
			cols            = {12}
			value           = {value}
			backgroundColor = {color ?? theme.colors.secondary}
			margin          = {{ top: 8, bottom: 6 }}
		/>
	)
}


// MARK: Card
/** Rounded translucent card used to group a widget inside a demo panel. */
export function Card({
	children,
	cols,
	width,
	height,
	padding = 10,
	backgroundColor,
	alignItems = 'center',
}: {
	key?            : string
	children?       : ReactEcs.JSX.Element | (ReactEcs.JSX.Element | null)[] | null
	cols?           : number
	width?          : PositionUnit | 'auto'
	height?         : PositionUnit | 'auto'
	padding?        : number
	backgroundColor?: Color4
	alignItems?     : 'center' | 'flex-start' | 'flex-end' | 'stretch'
}) {
	const theme = getTheme()
	return (
		<Column
			cols            = {cols}
			width           = {width}
			height          = {height ?? 'auto'}
			alignItems      = {alignItems}
			justifyContent  = "center"
			backgroundColor = {backgroundColor ?? alpha(theme.colors.dark, 0.55)}
			borderRadius    = {theme.border.radiusDefault}
			padding         = {{ top: padding, right: padding, bottom: padding, left: padding }}
		>
			{children as ReactEcs.JSX.Element[]}
		</Column>
	)
}


// MARK: BigText
/** Large single-line readout (clocks, scores). `size` is theme-base px. */
export function BigText({
	value,
	size,
	color,
	monospace = false,
}: {
	key?      : string
	value     : string
	size      : number
	color?    : Color4
	monospace?: boolean
}) {
	const theme = getTheme()
	return (
		<Text
			value     = {value}
			fontSize  = {size}
			fontColor = {color ?? theme.colors.light}
			font      = {monospace ? theme.typography.family.code : theme.typography.family.h1}
			width     = "auto"
			alignSelf = "center"
			textAlign = "middle-center"
			textWrap  = "nowrap"
		/>
	)
}
