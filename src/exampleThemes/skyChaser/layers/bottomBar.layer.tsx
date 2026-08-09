import { Color4 } from '@dcl/sdk/math'
import ReactEcs from '@dcl/sdk/react-ecs'
import { ButtonImage, Column, getTheme, IconNumber, Label, Layer, ProgressBarImage, Row, ZoneType } from '../../../ui-component-kit'
import { timers } from '../../../ui-component-kit/utils/timers'
import { skyChaserProgressBarTextures, startButtonAtlas } from '../atlases'
import { skyChaserGameData } from '../gameData'


// MARK: startGame
/** Marks the round as running and resets the countdown. */
function startGame() {
	const duration = skyChaserGameData.get('timerDuration')
	skyChaserGameData.update({
		gameInProgress: true,
		timerRemaining: duration,
	})
}


// MARK: stopGame
/** Clears the in-progress flag and restores the timer to full duration. */
function stopGame() {
	skyChaserGameData.update({
		gameInProgress: false,
		timerRemaining: skyChaserGameData.get('timerDuration'),
	})
}


// MARK: BottomBarLayer
/**
 * Bottom HUD: Start Game button when idle, image progress bar + timer while
 * a round is in progress. Progress bar spans half the bottom zone (`cols={6}`).
 */
export class BottomBarLayer extends Layer {
	constructor() {
		super({
			id  : 'sky-chaser-bottom-bar',
			zone: ZoneType.Bottom,
			uiTransform: {
				alignItems    : 'center',
				justifyContent: 'center',
			},
		})

		timers.setInterval(() => {
			if (!skyChaserGameData.get('gameInProgress')) return

			const remaining = skyChaserGameData.get('timerRemaining')
			if (remaining <= 1) {
				stopGame()
				return
			}

			skyChaserGameData.set('timerRemaining', remaining - 0.1)
		}, 100)
	}


	// MARK: body
	protected body() {
		const theme          = getTheme()
		const gameInProgress = skyChaserGameData.get('gameInProgress')
		const timerRemaining = skyChaserGameData.get('timerRemaining')
		const timerDuration  = skyChaserGameData.get('timerDuration')

		return (
			<Row
				height         = "100%"
				alignItems     = "center"
				justifyContent = "center"
			>
				{gameInProgress ? (
					<Column
						cols           = {6}
						height         = "auto"
						alignItems     = "stretch"
						justifyContent = "center"
					>
						<ProgressBarImage
							key      = "sky_chaser_bottom_timer"
							id       = "sky_chaser_bottom_timer"
							value    = {timerRemaining}
							minValue = {0}
							maxValue = {timerDuration}
							height   = {48}
							textures = {skyChaserProgressBarTextures}
						>
							<IconNumber
								value  = {String(timerRemaining).padStart(2, '0')}
								height = {28}
							/>
						</ProgressBarImage>
					</Column>
				) : (
					<ButtonImage
						id            = "sky_chaser_start"
						textureSrc    = {startButtonAtlas.source}
						uvColumn      = {1}
						uvColumnCount = {startButtonAtlas.columns}
						uvRowCount    = {startButtonAtlas.rows}
						width         = {200}
						height        = {64}
						callback      = {() => startGame()}
						uiTransform   = {{
							positionType: 'relative',
							position    : { top: 0, left: 0 },
						}}
					>
						<Label
							value     = "Start Game"
							backgroundColor     = {Color4.create(0, 0, 0, 0)}
							height    = "100%"
							padding   = {0}
							fontSize  = {theme.typography.size.default}
							textAlign = "middle-center"
							uiText    = {{ color: theme.colors.light }}
						/>
					</ButtonImage>
				)}
			</Row>
		)
	}
}

export const bottomBarLayer = new BottomBarLayer()
