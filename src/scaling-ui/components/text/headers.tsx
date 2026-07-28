import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { scaleFontSize } from '@dcl/sdk/react-ecs'

import { UiBox, type UiBoxProps } from '../base'
import { getTheme } from '../../styles'


type HeaderProps = Omit<UiBoxProps, 'uiText'> & {
	children?: ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	title    : string
	uiText  ?: Partial<NonNullable<UiBoxProps['uiText']>>
}


// MARK: H1
export const H1 = ({
	children,
	title,
	uiText,
	uiTransform,
	...props
}: HeaderProps) => {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width  : '100%',
				height : 'auto',
				...uiTransform
			}}
			uiText={{
				value    : title,
				fontSize : scaleFontSize(theme.typography.size.h1),
				color    : theme.colors.dark,
				textAlign: 'middle-left',
				...uiText
			}}
		>
			{children}
		</UiBox>
	)
}

// MARK: H2
export const H2 = ({
	children,
	title,
	uiText,
	uiTransform,
	...props
}: HeaderProps) => {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width  : '100%',
				height : 'auto',
				...uiTransform
			}}
			uiText={{
				value    : title,
				fontSize : scaleFontSize(theme.typography.size.h2),
				color    : theme.colors.dark,
				textAlign: 'middle-left',
				...uiText
			}}
		>
			{children}
		</UiBox>
	)
}

// MARK: H3
export const H3 = ({
	children,
	title,
	uiText,
	uiTransform,
	...props
}: HeaderProps) => {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width  : '100%',
				height : 'auto',
				...uiTransform
			}}
			uiText={{
				value    : title,
				fontSize : scaleFontSize(theme.typography.size.h3),
				color    : theme.colors.dark,
				textAlign: 'middle-left',
				...uiText
			}}
		>
			{children}
		</UiBox>
	)
}

// MARK: H4
export const H4 = ({
	children,
	title,
	uiText,
	uiTransform,
	...props
}: HeaderProps) => {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width  : '100%',
				height : 'auto',
				...uiTransform
			}}
			uiText={{
				value    : title,
				fontSize : scaleFontSize(theme.typography.size.h4),
				color    : theme.colors.dark,
				textAlign: 'middle-left',
				...uiText
			}}
		>
			{children}
		</UiBox>
	)
}

// MARK: H5
export const H5 = ({
	children,
	title,
	uiText,
	uiTransform,
	...props
}: HeaderProps) => {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width  : '100%',
				height : 'auto',
				...uiTransform
			}}
			uiText={{
				value    : title,
				fontSize : scaleFontSize(theme.typography.size.h5),
				color    : theme.colors.dark,
				textAlign: 'middle-left',
				...uiText
			}}
		>
			{children}
		</UiBox>
	)
}

// MARK: H6
export const H6 = ({
	children,
	title,
	uiText,
	uiTransform,
	...props
}: HeaderProps) => {
	const theme = getTheme()

	return (
		<UiBox
			{...props}
			uiTransform={{
				width  : '100%',
				height : 'auto',
				...uiTransform
			}}
			uiText={{
				value    : title,
				fontSize : scaleFontSize(theme.typography.size.h6),
				color    : theme.colors.dark,
				textAlign: 'middle-left',
				...uiText
			}}
		>
			{children}
		</UiBox>
	)
}
