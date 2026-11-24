import ReactEcs, { Dropdown, Input } from '@dcl/sdk/react-ecs'

import { alpha, Background, ButtonText, Column, Divider, getTheme, H2, Label, Layer, ProgressBar, PropsController, Row, showToast, Text, Toggle, ZoneType } from '../../../../ui-component-kit'

import { FaIcon, type FaIconName } from './demo.layouts.shared'


type SettingsTab = 'audio' | 'graphics' | 'gameplay'

const TABS: { id: SettingsTab, label: string, icon: FaIconName }[] = [
	{ id: 'audio',    label: 'Audio',    icon: 'volumeHigh' },
	{ id: 'graphics', label: 'Graphics', icon: 'image'      },
	{ id: 'gameplay', label: 'Gameplay', icon: 'gamepad'    },
]

/** Scene-side particle budget — e.g. scale emitter rates or skip spawning. */
const PARTICLE_LEVELS = ['Off', 'Low', 'Medium', 'High']

const HUD_LAYOUTS = ['Standard', 'Compact', 'Minimal']

/**
 * Every option here is something a scene can control itself through the SDK
 * (its own AudioSources, emitters, UI and game logic) — nothing that needs
 * engine or client settings.
 */
const DEFAULTS: Record<string, unknown> = {
	tab          : 'audio' as SettingsTab,
	master       : 80,
	music        : 60,
	sfx          : 90,
	environment  : 70,
	subtitles    : true,
	announcer    : true,
	particles    : true,
	particleCount: 2,
	darkMode     : true,
	showFps      : false,
	displayName  : '',
	hudLayout    : 0,
	showHints    : true,
	damageNumbers: true,
}

const STEP          = 10
const ROW_HEIGHT    = 36
const STEPPER_SIZE  = 32


// MARK: DemoSettingsMenuLayer
/**
 * Tabbed settings screen: tab bar, stepper + bar sliders, toggles, a segmented
 * picker, SDK Input / Dropdown fields, and Reset / Apply footer actions.
 */
export class DemoSettingsMenuLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-settings-menu',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '44vw',
				height: 'auto',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({ ...DEFAULTS })
	}


	// MARK: helpers
	private get<T>(key: string): T {
		return this.props?.get(key) as T
	}

	private set(key: string, value: unknown) {
		if (!this.props) {
			console.error('DemoSettingsMenuLayer.set: props controller missing')
			return
		}
		this.props.set(key, value)
	}

	private step(key: string, delta: number) {
		const next = Math.max(0, Math.min(100, this.get<number>(key) + delta))
		this.set(key, next)
	}

	private resetDefaults() {
		const tab = this.get<SettingsTab>('tab')
		for (const [key, value] of Object.entries(DEFAULTS)) {
			if (key === 'tab') continue
			this.set(key, value)
		}
		this.set('tab', tab)
	}


	// MARK: body
	protected body() {
		const theme = getTheme()
		const tab   = this.get<SettingsTab>('tab')

		return [
			<Background key="chrome" />,
			<Column
				key            = "body"
				cols           = {12}
				spacing        = {6}
				alignItems     = "stretch"
				justifyContent = "flex-start"
				padding        = {{ top: 16, right: 20, bottom: 16, left: 20 }}
			>
				<Row alignItems="center" spacing={10}>
					<FaIcon name="gear" size={28} color={theme.colors.primary} />
					<H2 value="Settings" width="auto" />
				</Row>

				{this.renderTabs(tab)}

				<Column
					key             = "tab_content"
					alignItems      = "stretch"
					spacing         = {4}
					backgroundColor = {alpha(theme.colors.dark, 0.4)}
					borderRadius    = {theme.border.radiusDefault}
					padding         = {{ top: 12, right: 14, bottom: 12, left: 14 }}
				>
					{tab === 'audio'    ? this.renderAudio()    : null}
					{tab === 'graphics' ? this.renderGraphics() : null}
					{tab === 'gameplay' ? this.renderGameplay() : null}
				</Column>

				<Divider margin={{ top: 6, bottom: 6 }} />

				<Row justifyContent="space-between" alignItems="center">
					<ButtonText
						id              = "demo_settings_reset"
						textLabel       = "Reset defaults"
						cols            = {4}
						backgroundColor = {theme.colors.secondary}
						callback        = {() => this.resetDefaults()}
					/>
					<ButtonText
						id              = "demo_settings_apply"
						textLabel       = "Apply"
						cols            = {3}
						backgroundColor = {theme.colors.success}
						callback        = {() => showToast({
							position     : 'top',
							duration     : 2,
							isDismissable: true,
							width        : 200,
							height       : 48,
							content      : () => <Label value="Settings saved" backgroundColor={theme.colors.success} />,
						})}
					/>
				</Row>
			</Column>,
		]
	}


	// MARK: renderTabs
	private renderTabs(active: SettingsTab) {
		const theme = getTheme()

		return (
			<Row key="tabs" spacing={6}>
				{TABS.map((tab) => {
					const isActive = tab.id === active
					// ButtonText keeps its first backgroundColor per id — swap ids for the active fill.
					const id = `demo_settings_tab_${tab.id}${isActive ? '_active' : ''}`
					return (
						<ButtonText
							key             = {id}
							id              = {id}
							cols            = {4}
							backgroundColor = {isActive ? theme.colors.primary : theme.colors.secondary}
							callback        = {() => this.set('tab', tab.id)}
							uiTransform     = {{ flexDirection: 'row' }}
							uiText          = {{ value: '' }}
						>
							<FaIcon name={tab.icon} size={18} color={theme.colors.light} margin={{ right: 8 }} />
							<Text value={tab.label} width="auto" alignSelf="center" textWrap="nowrap" fontColor={theme.colors.light} />
						</ButtonText>
					)
				})}
			</Row>
		)
	}


	// MARK: settingRow
	/** Label (cols 4) + control (cols 8). */
	private settingRow(key: string, label: string, control: ReactEcs.JSX.Element) {
		return (
			<Row key={`row_${key}`} alignItems="center" height={ROW_HEIGHT} margin={{ bottom: 4 }}>
				<Column cols={4} alignItems="flex-start" justifyContent="center">
					<Text value={label} textWrap="nowrap" />
				</Column>
				<Column cols={8} alignItems="stretch" justifyContent="center">
					<Row alignItems="center" justifyContent="flex-end" spacing={8}>
						{control}
					</Row>
				</Column>
			</Row>
		)
	}


	// MARK: sliderRow
	/** − [ bar ] + stepper bound to a 0–100 prop. */
	private sliderRow(key: string, label: string) {
		const theme = getTheme()
		const value = this.get<number>(key)

		return this.settingRow(key, label, (
			<Row alignItems="center" spacing={8}>
				<ButtonText
					id        = {`demo_settings_${key}_minus`}
					textLabel = "−"
					width     = {STEPPER_SIZE}
					height    = {STEPPER_SIZE}
					backgroundColor = {theme.colors.secondary}
					callback  = {() => this.step(key, -STEP)}
				/>
				<ProgressBar
					id           = {`demo_settings_${key}_bar`}
					value        = {value}
					height       = {STEPPER_SIZE}
					width        = {0}
					borderRadius = {theme.border.radiusSmall}
					uiTransform  = {{ flexGrow: 1 }}
				/>
				<ButtonText
					id        = {`demo_settings_${key}_plus`}
					textLabel = "+"
					width     = {STEPPER_SIZE}
					height    = {STEPPER_SIZE}
					backgroundColor = {theme.colors.secondary}
					callback  = {() => this.step(key, STEP)}
				/>
				<Text value={`${value}%`} width={48} textWrap="nowrap" textAlign="middle-right" font={theme.typography.family.code} />
			</Row>
		))
	}


	// MARK: toggleRow
	private toggleRow(key: string, label: string) {
		return this.settingRow(key, label, (
			<Toggle
				id       = {`demo_settings_${key}`}
				value    = {this.get<boolean>(key)}
				onChange = {(next) => this.set(key, next)}
			/>
		))
	}


	// MARK: segmentedRow
	/** Row of ButtonTexts acting as a single-choice picker bound to an index prop. */
	private segmentedRow(key: string, label: string, options: string[]) {
		const theme    = getTheme()
		const selected = this.get<number>(key)

		return this.settingRow(key, label, (
			<Row alignItems="center" spacing={4}>
				{options.map((option, i) => {
					const isActive = i === selected
					// ButtonText keeps its first backgroundColor per id — swap ids for the active fill.
					const id       = `demo_settings_${key}_${i}${isActive ? '_active' : ''}`
					return (
						<ButtonText
							key             = {id}
							id              = {id}
							textLabel       = {option}
							cols            = {12 / options.length}
							height          = {STEPPER_SIZE}
							fontSize        = {theme.typography.size.small}
							backgroundColor = {isActive ? theme.colors.primary : theme.colors.secondary}
							callback        = {() => this.set(key, i)}
						/>
					)
				})}
			</Row>
		))
	}


	// MARK: renderAudio
	/** Volumes would scale the scene's own AudioSource groups. */
	private renderAudio() {
		return [
			this.sliderRow('master',      'Master volume'),
			this.sliderRow('music',       'Music'),
			this.sliderRow('sfx',         'Sound effects'),
			this.sliderRow('environment', 'Environment'),
			this.toggleRow('subtitles', 'Subtitles'),
			this.toggleRow('announcer', 'Announcer callouts'),
		]
	}


	// MARK: renderGraphics
	/** Scene-side visuals only: particle emitters, UI theme, debug overlay. */
	private renderGraphics() {
		return [
			this.toggleRow('particles', 'Particles'),
			this.segmentedRow('particleCount', 'Particle count', PARTICLE_LEVELS),
			this.toggleRow('darkMode', 'UI dark mode'),
			this.toggleRow('showFps',  'Show FPS counter'),
		]
	}


	// MARK: renderGameplay
	/** Text input, dropdown and toggles for options the scene owns. */
	private renderGameplay() {
		const theme   = getTheme()
		const fieldBg = { color: alpha(theme.colors.dark, 0.8) }

		return [
			this.settingRow('displayName', 'Display name', (
				<Input
					key              = "demo_settings_display_name"
					placeholder      = "Shown above your head…"
					fontSize         = {theme.typography.size.default}
					color            = {theme.colors.light}
					placeholderColor = {theme.colors.tertiary}
					uiTransform      = {{ width: '100%', height: STEPPER_SIZE, borderRadius: theme.border.radiusSmall }}
					uiBackground     = {fieldBg}
					onChange         = {(value) => this.set('displayName', value)}
				/>
			)),
			this.settingRow('hudLayout', 'HUD layout', (
				<Dropdown
					key           = "demo_settings_hud_layout"
					options       = {HUD_LAYOUTS}
					selectedIndex = {this.get<number>('hudLayout')}
					fontSize      = {theme.typography.size.default}
					color         = {theme.colors.light}
					uiTransform   = {{ width: '100%', height: STEPPER_SIZE, borderRadius: theme.border.radiusSmall }}
					uiBackground  = {fieldBg}
					onChange      = {(index) => this.set('hudLayout', index)}
				/>
			)),
			this.toggleRow('showHints',     'Show hints'),
			this.toggleRow('damageNumbers', 'Damage numbers'),
		]
	}
}

export const demoSettingsMenuLayer = new DemoSettingsMenuLayer()
