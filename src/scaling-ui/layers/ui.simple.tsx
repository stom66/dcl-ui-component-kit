import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { getCanvasInfo, vhToPixels, vwToPixels } from '../utils/'
import { theme } from '../styles'

import { ButtonImageClose, Row, ZoneDefault, ZoneFullScreen, ZoneRoot } from '../components/'
import { Icon, IconNumber } from '../components'




// MARK: Main GameUI
export function SimpleUI() {
	return (
		<ZoneRoot>
			<ZoneDefault
				canBeHidden = {true}
			>

				<Row>
					<IconNumber value = {1} />
					<IconNumber value = {2} />
					<IconNumber value = {3} />
					<IconNumber value = {4} />
					<IconNumber value = {5} />
					<IconNumber value = {6} />
					<IconNumber value = {7} />
					<IconNumber value = {8} />
					<IconNumber value = {9} />
					
					<IconNumber value = {"+"} />
					<IconNumber value = {"/"} />
					<IconNumber value = {"*"} />
					<IconNumber value = {"-"} />
					<IconNumber value = {"."} />
					<IconNumber value = {"="} />
				</Row>
				{/* <Icon
					height  = {512}
					width   = {512}
					iconSrc = "assets/images/test-grid-64px.png"
				/> */}
			</ZoneDefault>
		</ZoneRoot>
	)
}
