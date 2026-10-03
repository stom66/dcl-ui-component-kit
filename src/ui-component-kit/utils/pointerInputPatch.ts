import { InputAction, PointerEventType, PointerEventsResult, inputSystem, type Entity, type PBPointerEventsResult } from '@dcl/sdk/ecs'


/**
 * TEAR-OUT: temporary SDK workaround. Flip to `false` (or delete this file and
 * its `SetupUiComponentKit` call) once `@dcl/ecs` input timestamps are
 * per-entity. Report: `dclcontext/bugs/sdk-ui-pointer-stale-click.md`.
 */
export const ENABLE_POINTER_INPUT_WORKAROUND = true

const IA_ANY            = InputAction.IA_ANY
const ROOT_ENTITY       = 0 as Entity
const lastDelivered     = new Map<string, number>()
let   installed         = false


// MARK: deliveryKey
function deliveryKey(
	entity          : Entity,
	inputAction     : InputAction,
	pointerEventType: PointerEventType,
): string {
	return `${entity}:${inputAction}:${pointerEventType}`
}


// MARK: findLastCommand
/** Newest matching pointer result on `entity`, or null. */
function findLastCommand(
	inputAction     : InputAction,
	pointerEventType: PointerEventType,
	entity          : Entity,
): PBPointerEventsResult | null {
	if (!PointerEventsResult.has(entity)) return null

	const results = Array.from(PointerEventsResult.get(entity)) as PBPointerEventsResult[]
	for (const command of results.reverse()) {
		if (command.state !== pointerEventType) continue
		if (inputAction !== IA_ANY && command.button !== inputAction) continue
		return command
	}

	return null
}


// MARK: rememberDelivery
function rememberDelivery(
	entity          : Entity | undefined,
	inputAction     : InputAction,
	pointerEventType: PointerEventType,
	timestamp       : number,
) {
	if (entity === undefined) return
	lastDelivered.set(deliveryKey(entity, inputAction, pointerEventType), timestamp)
}


// MARK: installPointerInputWorkaround
/**
 * Re-delivers pointer events the SDK input system drops as stale.
 *
 * Explorer writes the same click on the UI entity and on `RootEntity` with one
 * timestamp. The SDK keeps a single global watermark, so if the root copy
 * arrives a frame earlier the button's copy is ignored. This wrap returns that
 * copy once per entity.
 */
export function installPointerInputWorkaround() {
	if (!ENABLE_POINTER_INPUT_WORKAROUND) return
	if (installed) return
	installed = true

	const originalGet       = inputSystem.getInputCommand.bind(inputSystem)
	const originalTriggered = inputSystem.isTriggered.bind(inputSystem)

	inputSystem.getInputCommand = (
		inputAction     : InputAction,
		pointerEventType: PointerEventType,
		entity         ?: Entity,
	): PBPointerEventsResult | null => {
		const fromSdk = originalGet(inputAction, pointerEventType, entity)
		if (fromSdk) {
			rememberDelivery(entity, inputAction, pointerEventType, fromSdk.timestamp)
			return fromSdk
		}

		if (entity === undefined || entity === ROOT_ENTITY) return null

		const command = findLastCommand(inputAction, pointerEventType, entity)
		if (!command) return null

		const prev = lastDelivered.get(deliveryKey(entity, inputAction, pointerEventType)) ?? 0
		if (command.timestamp <= prev) return null

		rememberDelivery(entity, inputAction, pointerEventType, command.timestamp)
		return command
	}

	inputSystem.isTriggered = (
		inputAction     : InputAction,
		pointerEventType: PointerEventType,
		entity         ?: Entity,
	) => {
		if (entity === undefined || entity === ROOT_ENTITY) {
			return originalTriggered(inputAction, pointerEventType, entity)
		}

		return inputSystem.getInputCommand(inputAction, pointerEventType, entity) !== null
	}
}
