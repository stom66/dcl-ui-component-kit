import { ZoneDefault } from './zone.default'

type ZoneFullScreenProps = Parameters<typeof ZoneDefault>[0]

export function ZoneFullScreen({
	children,
	uiTransform,
	...props
}: ZoneFullScreenProps) {
	return ZoneDefault({
		...props,
		children,
		uiTransform: {
			height: "100%", 
			width : "100%", 
			...uiTransform
		}
	})
}
