import { Row } from './row'

type RowReverseProps = Parameters<typeof Row>[0]

export function RowReverse({
	children,
	uiTransform,
	cols,
	colsDesktop,
	colsMobile,
	...props
}: RowReverseProps) {
	return Row({
		...props,
		children,
		uiTransform: {flexDirection: "row-reverse", ...uiTransform},
		cols,
		colsDesktop,
		colsMobile,
	})
}
