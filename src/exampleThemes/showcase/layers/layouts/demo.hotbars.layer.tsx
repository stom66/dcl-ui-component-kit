import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Dropdown, Input, UiEntity } from '@dcl/sdk/react-ecs'

import { alpha, Background, ButtonText, Column, getTheme, H2, Label, Layer, ProgressBar, ProgressBarRadial, PropsController, Row, showToast, Text, ZoneType } from '../../../../ui-component-kit'

import { Card, demoClock, FaIcon, type FaIconName, SectionLabel } from './demo.layouts.shared'


const SLOT_SIZE        = 60
const ABILITY_SIZE     = 64
const STATUS_BAR_H     = 22
const STATUS_ICON      = 20

type HotbarItem = {
	icon     : FaIconName
	color    : (theme: ReturnType<typeof getTheme>) => Color4
	count?   : number
	cooldown : number
}

const HOTBAR: (HotbarItem | null)[] = [
	{ icon: 'gun',        color: (t) => t.colors.light,   cooldown: 1   },
	{ icon: 'bomb',       color: (t) => t.colors.danger,  cooldown: 4,  count: 3 },
	{ icon: 'kitMedical', color: (t) => t.colors.success, cooldown: 6,  count: 2 },
	{ icon: 'flask',      color: (t) => t.colors.info,    cooldown: 3,  count: 5 },
	{ icon: 'key',        color: (t) => t.colors.primary, cooldown: 0.5 },
	{ icon: 'hammer',     color: (t) => t.colors.tertiary, cooldown: 1.5 },
	null,
	null,
]

type Ability = {
	key     : string
	icon    : FaIconName
	name    : string
	cooldown: number
	color   : (theme: ReturnType<typeof getTheme>) => Color4
}

const ABILITIES: Ability[] = [
	{ key: 'Q', icon: 'bolt',              name: 'Dash',    cooldown: 3,  color: (t) => t.colors.info    },
	{ key: 'E', icon: 'shieldHalved',      name: 'Barrier', cooldown: 8,  color: (t) => t.colors.success },
	{ key: 'R', icon: 'fireFlameCurved',   name: 'Inferno', cooldown: 15, color: (t) => t.colors.danger  },
	{ key: 'F', icon: 'wandMagicSparkles', name: 'Blink',   cooldown: 5,  color: (t) => t.colors.warning },
]

const PROMPTS: { keys: string[], label: string, icon?: FaIconName }[] = [
	{ keys: ['E'],     label: 'Interact'  },
	{ keys: ['F'],     label: 'Pick up'   },
	{ keys: ['Space'], label: 'Jump'      },
	{ keys: ['Shift'], label: 'Sprint'    },
	{ keys: [],        label: 'Shoot', icon: 'arrowPointer' },
]

const REGIONS = ['Europe', 'North America', 'South America', 'Asia', 'Oceania']


// MARK: DemoHotbarsLayer
/**
 * Hotbars and inputs: status bars, a selectable 8-slot item hotbar with stack
 * counts and cooldown sweeps, an ability bar, key prompts, and native SDK
 * Input / Dropdown fields next to a quantity stepper.
 */
export class DemoHotbarsLayer extends Layer {
	constructor() {
		super({
			id             : 'demo-hotbars',
			zone           : ZoneType.Default,
			canBeHidden    : true,
			startHidden    : true,
			showCloseButton: true,
			uiTransform    : {
				width : '50vw',
				height: 'auto',
			},
		})

		this.props = new PropsController<Record<string, unknown>>({
			selected  : 0,
			cooldowns : {} as Record<string, number>,
			quantity  : 1,
			region    : 0,
			playerName: '',
		})
	}


	// MARK: cooldown helpers
	/** Remaining cooldown fraction `[0, 1]` for `key` (0 = ready). */
	private cooldownLeft(key: string, duration: number): number {
		const cooldowns = this.props?.get('cooldowns') as Record<string, number>
		const endsAt    = cooldowns?.[key] ?? 0
		const left      = endsAt - demoClock()
		if (left <= 0 || duration <= 0) return 0
		return Math.min(1, left / duration)
	}

	private startCooldown(key: string, duration: number) {
		if (!this.props) {
			console.error('DemoHotbarsLayer.startCooldown: props controller missing')
			return
		}
		if (this.cooldownLeft(key, duration) > 0) return
		const cooldowns = { ...(this.props.get('cooldowns') as Record<string, number>) }
		cooldowns[key]  = demoClock() + duration
		this.props.set('cooldowns', cooldowns)
	}


	// MARK: body
	protected body() {
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
				<H2 value="Hotbars & Inputs" />
				<Text value="Click a slot to select it; click the selected slot (or an ability) to use it and start its cooldown." />

				<SectionLabel value="Status bars" />
				{this.renderStatusBars()}

				<SectionLabel value="Item hotbar — selection, stack counts, cooldown sweep" />
				{this.renderHotbar()}

				<SectionLabel value="Ability bar — key binds + radial cooldowns" />
				{this.renderAbilities()}

				<SectionLabel value="Input prompts" />
				{this.renderPrompts()}

				<SectionLabel value="Inputs — SDK Input + Dropdown, quantity stepper" />
				{this.renderInputs()}
			</Column>,
		]
	}


	// MARK: renderStatusBars
	private renderStatusBars() {
		const theme  = getTheme()
		const t      = demoClock()
		const health = 55 + Math.sin(t * 0.7) * 35
		const shield = 40 + Math.sin(t * 0.45 + 1) * 40
		const stam   = 50 + Math.sin(t * 1.3 + 2) * 50

		const bar = (key: string, icon: FaIconName, value: number, color: Color4, label: string) => (
			<Column key={key} cols={4} alignItems="stretch" justifyContent="center">
			<Row alignItems="center" spacing={8}>
				<FaIcon name={icon} size={STATUS_ICON} color={color} />
				<ProgressBar
					id           = {`demo_hotbar_${key}`}
					value        = {value}
					height       = {STATUS_BAR_H}
					width        = {0}
					fillColor    = {color}
					lerpDuration = {0}
					uiTransform  = {{ flexGrow: 1 }}
				>
					<Text
						value       = {`${label} ${Math.round(value)}`}
						fontSize    = {theme.typography.size.small}
						fontColor   = {theme.colors.light}
						textAlign   = "middle-center"
						textWrap    = "nowrap"
						uiTransform = {{ width: 'auto', alignSelf: 'center' }}
					/>
				</ProgressBar>
			</Row>
			</Column>
		)

		return (
			<Row key="status" spacing={12}>
				{bar('health',  'heart',        health, theme.colors.danger,  'HP')}
				{bar('shield',  'shieldHalved', shield, theme.colors.info,    'SH')}
				{bar('stamina', 'personRunning', stam,  theme.colors.success, 'ST')}
			</Row>
		)
	}


	// MARK: cooldownOverlay
	/** Dark radial sweep laid over a slot while it is cooling down. */
	private cooldownOverlay(key: string, left: number, size: number, seconds: number) {
		const theme = getTheme()
		if (left <= 0) return null

		return (
			<UiEntity
				key         = {`${key}_cd`}
				uiTransform = {{
					positionType  : 'absolute',
					position      : { top: 0, left: 0 },
					width         : size,
					height        : size,
					alignItems    : 'center',
					justifyContent: 'center',
				}}
			>
				<ProgressBarRadial
					progress        = {left}
					width           = {size}
					fillColor       = {alpha(theme.colors.dark, 0.8)}
					backgroundColor = {alpha(theme.colors.dark, 0)}
					borderRadius    = {theme.border.radiusSmall}
					inset           = {-size * 0.25}
					mirror          = {true}
				>
					<Text
						value       = {(left * seconds).toFixed(1)}
						fontColor   = {theme.colors.light}
						textAlign   = "middle-center"
						textWrap    = "nowrap"
						uiTransform = {{ width: 'auto', alignSelf: 'center' }}
					/>
				</ProgressBarRadial>
			</UiEntity>
		)
	}


	// MARK: renderHotbar
	private renderHotbar() {
		const theme    = getTheme()
		const selected = this.props?.get('selected') as number

		return (
			<Row key="hotbar" justifyContent="center" spacing={6}>
				{HOTBAR.map((item, index) => {
					const key        = `slot_${index}`
					const isSelected = index === selected
					const left       = item ? this.cooldownLeft(key, item.cooldown) : 0

					return (
						<UiEntity
							key          = {key}
							uiTransform  = {{
								width         : SLOT_SIZE,
								height        : SLOT_SIZE,
								flexShrink    : 0,
								alignItems    : 'center',
								justifyContent: 'center',
								borderRadius  : theme.border.radiusSmall,
								borderWidth   : isSelected ? 3 : 1,
								borderColor   : isSelected ? theme.colors.primary : alpha(theme.colors.light, 0.25),
								overflow      : 'hidden',
							}}
							uiBackground = {{ color: alpha(theme.colors.dark, isSelected ? 0.9 : 0.6) }}
							onMouseDown  = {() => {
								if (isSelected && item) {
									this.startCooldown(key, item.cooldown)
								} else {
									this.props?.set('selected', index)
								}
							}}
						>
							{item ? <FaIcon key="icon" name={item.icon} size={SLOT_SIZE * 0.5} color={item.color(theme)} /> : null}

							<Text
								key         = "bind"
								value       = {String(index + 1)}
								fontSize    = {theme.typography.size.small}
								fontColor   = {isSelected ? theme.colors.primary : theme.colors.tertiary}
								textWrap    = "nowrap"
								uiTransform = {{ positionType: 'absolute', position: { top: 2, left: 5 }, width: 'auto' }}
							/>

							{item?.count !== undefined ? (
								<Text
									key         = "count"
									value       = {`x${item.count}`}
									fontSize    = {theme.typography.size.small}
									fontColor   = {theme.colors.light}
									textWrap    = "nowrap"
									textAlign   = "bottom-right"
									uiTransform = {{ positionType: 'absolute', position: { bottom: 2, right: 5 }, width: 'auto' }}
								/>
							) : null}

							{item ? this.cooldownOverlay(key, left, SLOT_SIZE, item.cooldown) : null}
						</UiEntity>
					)
				})}
			</Row>
		)
	}


	// MARK: renderAbilities
	private renderAbilities() {
		const theme = getTheme()

		return (
			<Row key="abilities" justifyContent="center" spacing={14}>
				{ABILITIES.map((ability) => {
					const key   = `ability_${ability.key}`
					const left  = this.cooldownLeft(key, ability.cooldown)
					const ready = left <= 0
					const color = ability.color(theme)

					return (
						<Column key={key} width="auto" alignItems="center" spacing={4}>
							<UiEntity
								uiTransform  = {{
									width         : ABILITY_SIZE,
									height        : ABILITY_SIZE,
									alignItems    : 'center',
									justifyContent: 'center',
									borderRadius  : ABILITY_SIZE / 2,
									borderWidth   : 3,
									borderColor   : ready ? color : theme.colors.secondary,
									overflow      : 'hidden',
								}}
								uiBackground = {{ color: alpha(color, ready ? 0.35 : 0.15) }}
								onMouseDown  = {() => this.startCooldown(key, ability.cooldown)}
							>
								<FaIcon name={ability.icon} size={ABILITY_SIZE * 0.45} color={ready ? theme.colors.light : theme.colors.tertiary} />
								{ready ? null : (
									<UiEntity
										key         = "cd"
										uiTransform = {{ positionType: 'absolute', position: { top: 0, left: 0 }, width: ABILITY_SIZE, height: ABILITY_SIZE }}
									>
										<ProgressBarRadial
											progress        = {left}
											width           = {ABILITY_SIZE}
											fillColor       = {alpha(theme.colors.dark, 0.75)}
											backgroundColor = {alpha(theme.colors.dark, 0)}
											mirror          = {true}
										>
											<Text
												value       = {String(Math.ceil(left * ability.cooldown))}
												fontSize    = {theme.typography.size.h4}
												fontColor   = {theme.colors.light}
												textAlign   = "middle-center"
												textWrap    = "nowrap"
												uiTransform = {{ width: 'auto', alignSelf: 'center' }}
											/>
										</ProgressBarRadial>
									</UiEntity>
								)}
							</UiEntity>
							<Row width="auto" alignItems="center" spacing={4}>
								<Label value={ability.key} backgroundColor={theme.colors.dark} font={theme.typography.family.code} />
								<Text value={ability.name} width="auto" textWrap="nowrap" fontSize={theme.typography.size.small} />
							</Row>
						</Column>
					)
				})}
			</Row>
		)
	}


	// MARK: renderPrompts
	private renderPrompts() {
		const theme = getTheme()

		return (
			<Row key="prompts" justifyContent="center" spacing={10}>
				{PROMPTS.map((prompt) => (
					<Row
						key             = {`prompt_${prompt.label}`}
						width           = "auto"
						alignItems      = "center"
						spacing         = {6}
						backgroundColor = {alpha(theme.colors.dark, 0.6)}
						borderRadius    = {theme.border.radiusDefault}
						padding         = {{ top: 4, right: 10, bottom: 4, left: 4 }}
					>
						{prompt.icon
							? <FaIcon key="icon" name={prompt.icon} size={22} color={theme.colors.light} margin={{ left: 4 }} />
							: prompt.keys.map((key) => (
								<Label
									key             = {`k_${key}`}
									value           = {key}
									backgroundColor = {theme.colors.light}
									fontColor       = {theme.colors.dark}
									font            = {theme.typography.family.code}
								/>
							))}
						<Text value={prompt.label} width="auto" textWrap="nowrap" fontColor={theme.colors.light} />
					</Row>
				))}
			</Row>
		)
	}


	// MARK: renderInputs
	private renderInputs() {
		const theme    = getTheme()
		const quantity = this.props?.get('quantity') as number
		const region   = this.props?.get('region') as number
		const fieldBg  = { color: alpha(theme.colors.dark, 0.8) }
		const fontSize = theme.typography.size.default

		const setQuantity = (next: number) => this.props?.set('quantity', Math.max(1, Math.min(99, next)))

		return (
			<Row key="inputs" alignItems="flex-end" spacing={10}>
				<Column cols={5} alignItems="stretch" spacing={4}>
					<Text value="Player name (Enter to submit)" fontSize={theme.typography.size.small} />
					<Input
						placeholder      = "Type a name…"
						fontSize         = {fontSize}
						color            = {theme.colors.light}
						placeholderColor = {theme.colors.tertiary}
						uiTransform      = {{ width: '100%', height: 40 }}
						uiBackground     = {fieldBg}
						onChange         = {(value) => this.props?.set('playerName', value)}
						onSubmit         = {(value) => showToast({
							position     : 'top',
							duration     : 2,
							isDismissable: true,
							width        : 240,
							height       : 48,
							content      : () => <Label value={`Hello, ${value || 'stranger'}!`} backgroundColor={theme.colors.info} />,
						})}
					/>
				</Column>

				<Column cols={4} alignItems="stretch" spacing={4}>
					<Text value="Region" fontSize={theme.typography.size.small} />
					<Dropdown
						options       = {REGIONS}
						selectedIndex = {region}
						fontSize      = {fontSize}
						color         = {theme.colors.light}
						uiTransform   = {{ width: '100%', height: 40 }}
						uiBackground  = {fieldBg}
						onChange      = {(index) => this.props?.set('region', index)}
					/>
				</Column>

				<Column cols={3} alignItems="stretch" spacing={4}>
					<Text value="Quantity" fontSize={theme.typography.size.small} />
					<Card padding={0} height={40}>
						<Row alignItems="center" justifyContent="space-between" height="100%">
							<ButtonText
								id              = "demo_hotbar_qty_minus"
								textLabel       = "−"
								width           = {36}
								height          = {36}
								backgroundColor = {theme.colors.secondary}
								callback        = {() => setQuantity(quantity - 1)}
							/>
							<Text value={String(quantity)} width="auto" alignSelf="center" textWrap="nowrap" fontColor={theme.colors.light} font={theme.typography.family.code} />
							<ButtonText
								id              = "demo_hotbar_qty_plus"
								textLabel       = "+"
								width           = {36}
								height          = {36}
								backgroundColor = {theme.colors.secondary}
								callback        = {() => setQuantity(quantity + 1)}
							/>
						</Row>
					</Card>
				</Column>
			</Row>
		)
	}
}

export const demoHotbarsLayer = new DemoHotbarsLayer()
