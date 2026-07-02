import ReactEcs, { Button, UiEntity} from '@dcl/sdk/react-ecs'
import { Color4 } from "@dcl/sdk/math"

export const Header = ({ title }: { title: string }) => {
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
