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


// MARK: ZoneTopCenter
/** Top-center edge zone preset (50% width). */
export function ZoneTopCenter(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.TopCenter })
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


// MARK: ZoneBottomCenter
/** Bottom-center edge zone preset (50% width). */
export function ZoneBottomCenter(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.BottomCenter })
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


// MARK: ZoneLeftTop
/** Left strip, content aligned to the top (`flex-start`). */
export function ZoneLeftTop(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.LeftTop })
}


// MARK: ZoneLeft
/** Left strip, content vertically centered. */
export function ZoneLeft(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.Left })
}


// MARK: ZoneLeftBottom
/** Left strip, content aligned to the bottom (`flex-end`). */
export function ZoneLeftBottom(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.LeftBottom })
}


// MARK: ZoneRightTop
/** Right strip, content aligned to the top (`flex-start`). */
export function ZoneRightTop(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.RightTop })
}


// MARK: ZoneRight
/** Right strip, content vertically centered. */
export function ZoneRight(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.Right })
}


// MARK: ZoneRightBottom
/** Right strip, content aligned to the bottom (`flex-end`). */
export function ZoneRightBottom(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.RightBottom })
}


// MARK: ZoneDefault
/** @deprecated Prefer Zone with type={ZoneType.Default} */
export function ZoneDefault(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.Default })
}
