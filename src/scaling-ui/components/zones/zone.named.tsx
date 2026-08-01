import { Zone, type ZoneProps } from './zone.default'
import { ZoneType } from './zone.presets'


type NamedZoneProps = Omit<ZoneProps, 'type'>


// MARK: ZoneFullScreen
/** Full-canvas zone preset. */
export function ZoneFullScreen(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.FullScreen })
}


// MARK: ZoneTop
/** Top edge zone preset. */
export function ZoneTop(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.Top })
}


// MARK: ZoneTopLeft
/** Top-left corner zone preset. */
export function ZoneTopLeft(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.TopLeft })
}


// MARK: ZoneTopRight
/** Top-right corner zone preset. */
export function ZoneTopRight(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.TopRight })
}


// MARK: ZoneBottom
/** Bottom edge zone preset. */
export function ZoneBottom(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.Bottom })
}


// MARK: ZoneBottomRight
/** Bottom-right corner zone preset. */
export function ZoneBottomRight(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.BottomRight })
}


// MARK: ZoneBottomLeft
/** Bottom-left corner zone preset. */
export function ZoneBottomLeft(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.BottomLeft })
}


// MARK: ZoneLeft
/** Left edge zone preset. */
export function ZoneLeft(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.Left })
}


// MARK: ZoneRight
/** Right edge zone preset. */
export function ZoneRight(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.Right })
}


// MARK: ZoneDefault
/** @deprecated Prefer Zone with type={ZoneType.Default} */
export function ZoneDefault(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.Default })
}
