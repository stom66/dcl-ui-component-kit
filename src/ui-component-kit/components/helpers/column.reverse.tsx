import { Column } from './column'

type ColumnReverseProps = Parameters<typeof Column>[0]

export function ColumnReverse({
	cols,
	colsDesktop,
	colsMobile,
	children,
	uiTransform,
	...props
}: ColumnReverseProps) {
	return Column({
		...props,
		children,
		uiTransform: {flexDirection: "column-reverse", ...uiTransform},
		cols,
		colsDesktop,
		colsMobile,
	})
}
