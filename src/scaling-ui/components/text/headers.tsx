import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'
import { getTheme } from '../../styles'


type HeaderProps = Omit<UiBoxProps, 'uiText'> & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	value   ?: string
	uiText  ?: Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: H1
export function H1({
	children,
	value,
	uiText,
	uiTransform,
	...props
}: HeaderProps) {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width : '100%',
				height: 'auto',
				...uiTransform
			}}
			uiText={{
				fontSize : scaleFontSize(theme.typography.size.h1),
				font     : theme.typography.family.h1,
				color    : theme.colors.light,
				textAlign: 'middle-left',
				...uiText,
				value: value ?? uiText?.value ?? '',
			}}
		>
			{children}
		</UiBox>
	)
}


// MARK: H2
export function H2({
	children,
	value,
	uiText,
	uiTransform,
	...props
}: HeaderProps) {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width : '100%',
				height: 'auto',
				...uiTransform
			}}
			uiText={{
				fontSize : scaleFontSize(theme.typography.size.h2),
				font     : theme.typography.family.h2,
				color    : theme.colors.light,
				textAlign: 'middle-left',
				...uiText,
				value: value ?? uiText?.value ?? '',
			}}
		>
			{children}
		</UiBox>
	)
}


// MARK: H3
export function H3({
	children,
	value,
	uiText,
	uiTransform,
	...props
}: HeaderProps) {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width : '100%',
				height: 'auto',
				...uiTransform
			}}
			uiText={{
				fontSize : scaleFontSize(theme.typography.size.h3),
				font     : theme.typography.family.h3,
				color    : theme.colors.light,
				textAlign: 'middle-left',
				...uiText,
				value: value ?? uiText?.value ?? '',
			}}
		>
			{children}
		</UiBox>
	)
}


// MARK: H4
export function H4({
	children,
	value,
	uiText,
	uiTransform,
	...props
}: HeaderProps) {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width : '100%',
				height: 'auto',
				...uiTransform
			}}
			uiText={{
				fontSize : scaleFontSize(theme.typography.size.h4),
				font     : theme.typography.family.h4,
				color    : theme.colors.light,
				textAlign: 'middle-left',
				...uiText,
				value: value ?? uiText?.value ?? '',
			}}
		>
			{children}
		</UiBox>
	)
}


// MARK: H5
export function H5({
	children,
	value,
	uiText,
	uiTransform,
	...props
}: HeaderProps) {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width : '100%',
				height: 'auto',
				...uiTransform
			}}
			uiText={{
				fontSize : scaleFontSize(theme.typography.size.h5),
				font     : theme.typography.family.h5,
				color    : theme.colors.light,
				textAlign: 'middle-left',
				...uiText,
				value: value ?? uiText?.value ?? '',
			}}
		>
			{children}
		</UiBox>
	)
}


// MARK: H6
export function H6({
	children,
	value,
	uiText,
	uiTransform,
	...props
}: HeaderProps) {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width : '100%',
				height: 'auto',
				...uiTransform
			}}
			uiText={{
				fontSize : scaleFontSize(theme.typography.size.h6),
				font     : theme.typography.family.h6,
				color    : theme.colors.light,
				textAlign: 'middle-left',
				...uiText,
				value: value ?? uiText?.value ?? '',
			}}
		>
			{children}
		</UiBox>
	)
}
