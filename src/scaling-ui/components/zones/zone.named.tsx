import { Zone, type ZoneProps } from './zone.default'
import { ZoneType } from './zone.presets'


type NamedZoneProps = Omit<ZoneProps, 'type'>


// MARK: ZoneFullScreen
/** Full-canvas zone preset. */
export function ZoneFullScreen(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.FullScreen })
}


// MARK: ZoneBarTop
/** Top bar zone preset. */
export function ZoneBarTop(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.BarTop })
}


// MARK: ZoneBarBottom
/** Bottom bar zone preset. */
export function ZoneBarBottom(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.BarBottom })
}


// MARK: ZoneBarLeft
/** Left bar zone preset. */
export function ZoneBarLeft(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.BarLeft })
}


// MARK: ZoneBarRight
/** Right bar zone preset. */
export function ZoneBarRight(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.BarRight })
}


// MARK: ZoneBottomRight
/** Bottom-right corner zone preset. */
export function ZoneBottomRight(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.BottomRight })
}


// MARK: ZoneDefault
/** @deprecated Prefer Zone with type={ZoneType.Default} */
export function ZoneDefault(props: NamedZoneProps) {
	return Zone({ ...props, type: ZoneType.Default })
}
