import { getTheme } from '../../styles'
import { timers } from '../../utils/timers'
import { easingFunctions, tweenValue } from '../../utils/tweens'
import { getOffscreenPosition, resolveVisibilityEdges } from '../zones/zone.presets'
import { defaultEdgesForPosition } from './toast.dock'
import type { ShowToastOptions, ToastItem } from './toast.types'


let nextToastId = 1

type GroupState = {
	activeId? : string
	queue     : string[]
}


// MARK: ToastRegistry
/**
 * Holds ephemeral toast items and group queue/replace policy.
 * Shaped as a generic overlay registry so a future particle host can share the pattern.
 */
export class ToastRegistry {
	readonly items     = new Map<string, ToastItem>()
	private groups     = new Map<string, GroupState>()
	private holdTimers = new Map<string, number>()

	private onChange?: () => void


	// MARK: setOnChange
	/** Optional hook when the visible set changes (host can ignore — ReactEcs re-renders each frame). */
	setOnChange(cb: () => void) {
		this.onChange = cb
	}


	// MARK: list
	/** Snapshot of on-screen / animating toasts for rendering (excludes queued + done). */
	list(): ToastItem[] {
		const out: ToastItem[] = []
		for (const item of this.items.values()) {
			if (
				item.phase === 'entering' ||
				item.phase === 'visible' ||
				item.phase === 'pulsing' ||
				item.phase === 'exiting'
			) {
				out.push(item)
			}
		}
		return out
	}


	// MARK: show
	/** Enqueues or starts a toast per group policy. Returns the toast id. */
	show(options: ShowToastOptions): string {
		const theme    = getTheme()
		const id       = options.id ?? `toast_${nextToastId++}`
		const edges = defaultEdgesForPosition(options.position)
		const resolved = (
			options.showFrom === undefined && options.hideTo === undefined
				? edges
				: resolveVisibilityEdges(edges.showFrom, options.showFrom, options.hideTo)
		)

		let groupPolicy = options.groupPolicy ?? 'stack'
		if ((groupPolicy === 'queue' || groupPolicy === 'replace') && !options.group) {
			console.error(`ToastRegistry.show: groupPolicy=${groupPolicy} requires group; falling back to stack`)
			groupPolicy = 'stack'
		}

		const iconSize = theme.icons.defaultSize
		const slide    = options.slide ?? true
		const item: ToastItem = {
			id,
			position      : options.position,
			content       : options.content,
			duration      : options.duration ?? 3,
			isDismissable : options.isDismissable ?? false,
			showFrom      : resolved.showFrom,
			hideTo        : resolved.hideTo,
			slide,
			scaleIn       : options.scaleIn ?? false,
			scaleOut      : options.scaleOut ?? false,
			scalePulse    : options.scalePulse ?? false,
			group         : options.group,
			groupPolicy,
			width         : options.width  ?? iconSize * 3,
			height        : options.height ?? iconSize,
			zIndex        : options.zIndex ?? 2000,
			phase         : 'queued',
			activeEdge    : resolved.showFrom,
			slideOffset   : slide ? getOffscreenPosition(resolved.showFrom) : 0,
			scale         : options.scaleIn ? 0 : 1,
		}

		if (this.items.has(id)) {
			this.forceRemove(id)
		}

		if (groupPolicy === 'stack' || !options.group) {
			this.items.set(id, item)
			this.startEnter(item)
			this.emit()
			return id
		}

		const group = this.ensureGroup(options.group)

		if (groupPolicy === 'queue') {
			this.items.set(id, item)
			if (group.activeId && this.isBusy(group.activeId)) {
				group.queue.push(id)
				this.emit()
				return id
			}
			group.activeId = id
			this.startEnter(item)
			this.emit()
			return id
		}

		// replace — drop other queued entries, dismiss active, then show this one
		this.items.set(id, item)
		for (const qid of [...group.queue]) {
			if (qid !== id) this.forceRemove(qid)
		}
		group.queue = []

		const previousId = group.activeId
		if (previousId && previousId !== id && this.isBusy(previousId)) {
			group.queue = [id]
			this.beginExit(previousId)
			this.emit()
			return id
		}

		group.activeId = id
		this.startEnter(item)
		this.emit()
		return id
	}


	// MARK: hide
	/** Begins exit animation for a toast. */
	hide(id: string) {
		const item = this.items.get(id)
		if (!item || item.phase === 'exiting' || item.phase === 'done') return
		if (item.phase === 'queued') {
			this.forceRemove(id)
			if (item.group) {
				const group = this.groups.get(item.group)
				if (group) group.queue = group.queue.filter(qid => qid !== id)
			}
			this.emit()
			return
		}
		this.clearHoldTimer(id)
		this.beginExit(id)
	}


	// MARK: clearGroup
	/** Hides active + drops queued toasts in a group. */
	clearGroup(groupName: string) {
		const group = this.groups.get(groupName)
		if (!group) return

		for (const qid of group.queue) {
			this.forceRemove(qid)
		}
		group.queue = []

		if (group.activeId) {
			this.hide(group.activeId)
		}
		this.emit()
	}


	// MARK: dismiss
	/** Click-dismiss when isDismissable. */
	dismiss(id: string) {
		const item = this.items.get(id)
		if (!item?.isDismissable) return
		this.hide(id)
	}


	// MARK: ensureGroup
	private ensureGroup(name: string): GroupState {
		let group = this.groups.get(name)
		if (!group) {
			group = { queue: [] }
			this.groups.set(name, group)
		}
		return group
	}


	// MARK: isBusy
	private isBusy(id: string): boolean {
		const item = this.items.get(id)
		if (!item) return false
		return item.phase !== 'done' && item.phase !== 'queued'
	}


	// MARK: startEnter
	private startEnter(item: ToastItem) {
		item.phase       = 'entering'
		item.activeEdge  = item.showFrom
		item.slideOffset = item.slide ? getOffscreenPosition(item.showFrom) : 0
		item.scale       = item.scaleIn ? 0 : 1

		const duration  = getTheme().animation.showDuration
		const fromSlide = item.slideOffset
		const fromScale = item.scale

		let slideDone = !item.slide
		let scaleDone = !item.scaleIn

		const maybeFinish = () => {
			if (!slideDone || !scaleDone) return
			if (item.phase !== 'entering') return
			item.slideOffset = 0
			item.scale       = 1
			this.afterEnter(item)
		}

		if (item.slide) {
			tweenValue(fromSlide, 0, duration, v => {
				item.slideOffset = v
			}, () => {
				slideDone = true
				maybeFinish()
			}, easingFunctions.easeOutBack)
		}

		if (item.scaleIn) {
			tweenValue(fromScale, 1, duration, v => {
				item.scale = v
			}, () => {
				scaleDone = true
				maybeFinish()
			}, easingFunctions.easeOutBack)
		} else {
			maybeFinish()
		}
	}


	// MARK: afterEnter
	private afterEnter(item: ToastItem) {
		if (item.scalePulse) {
			this.startPulse(item)
			return
		}
		item.phase = 'visible'
		this.scheduleHold(item)
	}


	// MARK: startPulse
	private startPulse(item: ToastItem) {
		item.phase = 'pulsing'
		const theme    = getTheme()
		const duration = theme.animation.pulseDurationDefault
		const scaleMax = theme.animation.pulseScaleMaxDefault
		const half     = duration / 2

		tweenValue(1, scaleMax, half, v => {
			item.scale = v
		}, () => {
			tweenValue(scaleMax, 1, half, v => {
				item.scale = v
			}, () => {
				item.scale = 1
				item.phase = 'visible'
				this.scheduleHold(item)
			}, easingFunctions.easeInCubic)
		}, easingFunctions.easeOutCubic)
	}


	// MARK: scheduleHold
	private scheduleHold(item: ToastItem) {
		this.clearHoldTimer(item.id)
		if (item.duration <= 0) return

		const timerId = timers.setTimeout(() => {
			this.holdTimers.delete(item.id)
			if (item.phase === 'visible') {
				this.beginExit(item.id)
			}
		}, item.duration * 1000)
		this.holdTimers.set(item.id, timerId)
	}


	// MARK: beginExit
	private beginExit(id: string) {
		const item = this.items.get(id)
		if (!item || item.phase === 'exiting' || item.phase === 'done') return

		this.clearHoldTimer(id)
		item.phase       = 'exiting'
		item.activeEdge  = item.hideTo
		item.slideOffset = 0

		const duration  = getTheme().animation.hideDuration
		const toSlide   = getOffscreenPosition(item.hideTo)
		const fromScale = item.scale

		let slideDone = !item.slide
		let scaleDone = !item.scaleOut

		const maybeFinish = () => {
			if (!slideDone || !scaleDone) return
			this.finishExit(id)
		}

		if (item.slide) {
			tweenValue(0, toSlide, duration, v => {
				item.slideOffset = v
			}, () => {
				slideDone = true
				maybeFinish()
			}, easingFunctions.easeInBack)
		}

		if (item.scaleOut) {
			tweenValue(fromScale, 0, duration, v => {
				item.scale = v
			}, () => {
				scaleDone = true
				maybeFinish()
			}, easingFunctions.easeInBack)
		} else {
			maybeFinish()
		}
	}


	// MARK: finishExit
	private finishExit(id: string) {
		const item = this.items.get(id)
		if (!item) return

		item.phase = 'done'
		this.items.delete(id)
		this.clearHoldTimer(id)

		if (item.group) {
			const group = this.groups.get(item.group)
			if (group && group.activeId === id) {
				group.activeId = undefined
				this.drainQueue(item.group)
			} else if (group) {
				group.queue = group.queue.filter(qid => qid !== id)
			}
		}

		this.emit()
	}


	// MARK: drainQueue
	private drainQueue(groupName: string) {
		const group = this.groups.get(groupName)
		if (!group) return

		while (group.queue.length > 0) {
			const nextId = group.queue.shift()!
			const next   = this.items.get(nextId)
			if (!next || next.phase === 'done') continue

			group.activeId = nextId
			this.startEnter(next)
			this.emit()
			return
		}
	}


	// MARK: forceRemove
	private forceRemove(id: string) {
		this.clearHoldTimer(id)
		const item = this.items.get(id)
		if (!item) return
		item.phase = 'done'
		this.items.delete(id)

		if (item.group) {
			const group = this.groups.get(item.group)
			if (group) {
				if (group.activeId === id) group.activeId = undefined
				group.queue = group.queue.filter(qid => qid !== id)
			}
		}
	}


	// MARK: clearHoldTimer
	private clearHoldTimer(id: string) {
		const timerId = this.holdTimers.get(id)
		if (timerId !== undefined) {
			timers.clearTimeout(timerId)
			this.holdTimers.delete(id)
		}
	}


	// MARK: emit
	private emit() {
		this.onChange?.()
	}
}


export const toastRegistry = new ToastRegistry()
