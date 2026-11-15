import ReactEcs from '@dcl/sdk/react-ecs'

import { alpha, AvatarIcon, Background, Code, Column, DEFAULT_AVATAR_USER_ID, FontAwesome, getTheme, H2, Icon, Label, Layer, Row, Text, ZoneType } from '../../../ui-component-kit'
import { exampleIconsAtlas } from '../atlases'

/** Tiny curated FA set — Unity `fontSrc` atlases only fit ~35–50 unique PUA glyphs. */
const SAMPLE_ICONS = [
	'cat', 'star', 'heart', 'gift',
	'fire', 'github',
] as const

const ATLAS_SAMPLE = [
	'catButt', 'pigeonCowboy', 'pigeonWalk', 'dclLogo',
	'pigeonWaiter', 'pigeonBiker', 'pigeonGolfer', 'pigeonTracksuit',
	'pigeonBowler', 'pigeonHoodie', 'pigeonFancy', 'pigeonStreet',
] as const


// MARK: DemoIconsLayer
/**
 * Demo panel for FontAwesome (TTF, small sets), custom atlas `Icon`, and AvatarIcon.
 */
export class DemoIconsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-icons',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '48vw',
				height: 'auto',
			},
		})
	}


	// MARK: body
	protected body() {
		const theme = getTheme()

		return [
			<Background key="chrome" />,
			<Column
				key            = "body"
				cols           = {12}
				spacing        = {10}
				alignItems     = "flex-start"
				justifyContent = "flex-start"
				padding        = {{ top: 14, right: 20, bottom: 16, left: 20 }}
			>
				<H2 key="title" value="Icons" />
				<Text
					key      = "intro"
					value    = "FontAwesome (TTF) is for small curated sets only. Unity Desktop fits roughly ~35–50 unique FA icons per font atlas after Latin prefill — more unique glyphs show as tofu. Prefer Icon + TextureAtlas for large packs. Preview needs npm run start:bundles."
					fontSize = {theme.typography.size.small}
				/>

				<Label key="fa-label" cols={12} value="FontAwesome" margin={{ top: 4 }} />
				<Row key="fa-row" justifyContent="flex-start" alignItems="center" spacing={10} margin={{ top: 4 }}>
					<FontAwesome key="fa-cat" icon="cat" fontSize={44} />
					<FontAwesome key="fa-star" icon="star" fontSize={44} />
					<FontAwesome key="fa-github" icon="github" fontSize={44} />
				</Row>
				<Code key="fa-code" value={'<FontAwesome icon="star" fontSize={44} />'} textWrap="nowrap" />

				<Label key="color-label" cols={12} value="Color" margin={{ top: 8 }} />
				<Row key="fa-color-row" justifyContent="flex-start" alignItems="center" spacing={8} margin={{ top: 4 }}>
					<FontAwesome key="fa-color-primary" icon="star" fontSize={36} fontColor={theme.colors.primary} />
					<FontAwesome key="fa-color-danger" icon="star" fontSize={36} fontColor={theme.colors.danger} />
					<FontAwesome key="fa-color-light" icon="star" fontSize={36} fontColor={theme.colors.light} />
				</Row>
				<Code key="color-code" value={'<FontAwesome icon="star" fontColor={…} />'} textWrap="nowrap" />

				<Label key="samples-label" cols={12} value="Samples (keep unique count low)" margin={{ top: 8 }} />
				<Row key="fa-samples" flexWrap="wrap" justifyContent="flex-start" alignItems="center" spacing={8} margin={{ top: 4 }}>
					{SAMPLE_ICONS.map((icon) => (
						<FontAwesome key={`fa-sample-${icon}`} icon={icon} fontSize={28} />
					))}
				</Row>

				<Label key="atlas-label" cols={12} value="Icon + custom TextureAtlas" margin={{ top: 8 }} />
				<Row key="atlas-samples" flexWrap="wrap" justifyContent="flex-start" alignItems="center" margin={{ top: 4 }}>
					{ATLAS_SAMPLE.map((name) => (
						<Icon
							key    = {`atlas-${name}`}
							src    = {exampleIconsAtlas.source}
							uvs    = {exampleIconsAtlas.uv[name]}
							width  = {40}
							height = {40}
							margin = {{ right: 8, bottom: 4 }}
						/>
					))}
				</Row>
				<Code key="atlas-code" value={'<Icon src={exampleIconsAtlas.source} uvs={…} />'} textWrap="nowrap" />

				<Label key="avatar-label" cols={12} value="AvatarIcon" margin={{ top: 8 }} />
				<Row key="avatars" justifyContent="flex-start" alignItems="center" spacing={8} margin={{ top: 4, bottom: 4 }}>
					<AvatarIcon key="avatar-plain" userId={DEFAULT_AVATAR_USER_ID} width={48} height={48} />
					<AvatarIcon
						key          = "avatar-round"
						userId       = {DEFAULT_AVATAR_USER_ID}
						width        = {48}
						height       = {48}
						borderRadius = {24}
						borderWidth  = {2}
						borderColor  = {alpha(theme.colors.light, 0.8)}
					/>
					<AvatarIcon
						key             = "avatar-chip"
						userId          = {DEFAULT_AVATAR_USER_ID}
						width           = {48}
						height          = {48}
						borderRadius    = {theme.border.radiusDefault}
						borderWidth     = {2}
						borderColor     = {alpha(theme.colors.info, 0.8)}
						backgroundColor = {alpha(theme.colors.info, 0.8)}
					/>
				</Row>
				<Code key="avatar-code" value={'<AvatarIcon userId="…" />'} textWrap="nowrap" />
			</Column>,
		]
	}
}

export const demoIconsLayer = new DemoIconsLayer()
