import { Color4 } from "@dcl/sdk/math"
import { getTheme } from 'src/scaling-ui/styles'

export function darken(
	color : Color4,
	amount: number
): Color4 {
	const sub    = Color4.create(amount, amount, amount, 0)
	const darker = Color4.subtract(color, sub)
	return darker
}

export function lighten(
	color : Color4,
	amount: number
): Color4 {
	const sub    = Color4.create(amount, amount, amount, 0)
	const lighter = Color4.add(color, sub)
	return lighter
}

export function alpha(
	color : Color4,
	amount: number
): Color4 {
	const alpha = Color4.create(color.r, color.g, color.b, amount)
	return alpha
}

export function randomColor(): Color4 {
	const theme        = getTheme()
	const randomColors = [theme.colors.primary, theme.colors.secondary, theme.colors.tertiary, theme.colors.success, theme.colors.danger, theme.colors.warning, theme.colors.info]
	const randomIndex = Math.floor(Math.random() * randomColors.length)

	const lightDarkDefault = Math.floor(Math.random() * 3)
	if (lightDarkDefault === 0) {
		return lighten(randomColors[randomIndex], Math.random())
	} else if (lightDarkDefault === 1) {
		return randomColors[randomIndex]
	} else {
		return darken(randomColors[randomIndex], Math.random())
	}
}
