import ReactEcs, { PositionUnit, UiEntity, UiTransformProps} from '@dcl/sdk/react-ecs'
import { Color4 } from "@dcl/sdk/math"

import { theme, alpha, lighten, darken } from '../../index'



// MARK: SectionHeader
export const SectionHeader = ({ title }: { title: string }) => {
	return (
		<UiEntity
		uiTransform={{
			width: '100%',
			height: 'auto',
			padding: { top: 10, bottom: 5 }
		}}
		uiText={{
			value: title,
			fontSize: 20,
			color: Color4.create(1, 0.8, 0.3, 1),
			textAlign: 'middle-left'
		}}
		/>
	)
}
