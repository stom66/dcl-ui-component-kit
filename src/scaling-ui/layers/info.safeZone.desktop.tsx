import ReactEcs, { Button, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'


// MARK: Main GameUI
const alpha = 1

export function MainUI() {
	return (
		<UiEntity
			key={`ui_SafeZonesDesktop`}
			uiTransform={{
				width         : '100%',
				height        : '100%',
				positionType  : "absolute",
			}}
			uiBackground={{ 
				color: Color4.create(0, 1, 0, alpha)
			}}
		>

			{/* Left-side Toolbar */}
			<UiEntity
				uiTransform={{
					width: '2.5%',
					height: '100%',
					positionType: "absolute",
					position: { left: 0, top: 0 },
				}}
				uiBackground={{ 
					color: Color4.create(1, 0, 0, alpha)
				}}
			/>

			{/* Scene Details */}
			<UiEntity
				uiTransform={{
					width: '17%',
					height: '11%',
					positionType: "absolute",
					position: { left: 0, top: 0 },
				}}
				uiBackground={{ 
					color: Color4.create(1, 0, 0, alpha)
				}}
			/>

			{/* Chat box */}
			<UiEntity
				uiTransform={{
					width: '34vw',
					height: '34vw',
					positionType: "absolute",
					position: { left: 0, bottom: 0 },
				}}
				uiBackground={{ 
					color: Color4.create(1, 0, 0, alpha)
				}}
			/>


			{/* Debugging Panels */}

			{/* Debug + Console Buttons */}
			<UiEntity
				uiTransform={{
					width: '3%',
					height: '8.5%',
					positionType: "absolute",
					position: { right: 0, top: 0 },
				}}
				uiBackground={{ 
					color: Color4.create(0.8, 0, 0.4, alpha)
				}}
			/>

			
			{/* Debug Panel */}
			<UiEntity
				uiTransform={{
					width: '16.5%',
					height: '49%',
					positionType: "absolute",
					position: { right: 0, bottom: 0 },
				}}
				uiBackground={{ 
					color: Color4.create(0.8, 0, 0.4, alpha)
				}}
			/>
		</UiEntity>
	)
}
