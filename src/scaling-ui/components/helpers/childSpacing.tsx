import ReactEcs from '@dcl/sdk/react-ecs'


// MARK: applySpacingToChildren
/** Sets margin[edge] = spacing on every child except the last. */
export function applySpacingToChildren(
	children: ReactEcs.JSX.Element | ReactEcs.JSX.Element[] | undefined,
	spacing : number | undefined,
	edge    : 'top' | 'right' | 'bottom' | 'left',
) {
	if (!spacing || children == null) return children

	const list = Array.isArray(children) ? children : [children]

	return list.map((child, i) => {
		if (!child || i === list.length - 1) return child

		const uiTransform = child.props?.uiTransform ?? {}
		const margin      = typeof uiTransform.margin === 'object' ? uiTransform.margin : {}
		return ReactEcs.createElement(child.type, {
			...child.props,
			key        : child.key,
			uiTransform: {
				...uiTransform,
				margin: { ...margin, [edge]: spacing },
			},
		})
	})
}
