import ReactEcs, { Button, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'


// MARK: Main GameUI
const alpha = 1

export function SafeZonesMobile() {
	return (
		<UiEntity
			key={`ui_SafeZonesMobile`}
			uiTransform={{
				width         : '100%',
				height        : '100%',
				positionType  : "absolute",
			}}
			uiBackground={{ 
				color: Color4.create(0, 1, 0, alpha)
			}}
		>
			<UiEntity
				uiTransform={{
					width: '25%',
					height: '100%',
					positionType: "absolute",
					position: { left: 0, top: 0 },
				}}
				uiBackground={{ 
					color: Color4.create(1, 0, 0, alpha)
				}}
			/>

			<UiEntity
				uiTransform={{
					width: '25%',
					height: '23%',
					positionType: "absolute",
					position: { right: 0, top: 0 },
				}}
				uiBackground={{ 
					color: Color4.create(1, 0, 0, alpha)
				}}
			/>
			<UiEntity
				uiTransform={{
					width: '25%',
					height: '55%',
					positionType: "absolute",
					position: { right: 0, bottom: 0 },
				}}
				uiBackground={{ 
					color: Color4.create(1, 0, 0, alpha)
				}}
			/>
		</UiEntity>
	)
}
