import { engine } from '@dcl/sdk/ecs'
import type ReactEcs from '@dcl/sdk/react-ecs'


export type AnimationPlaybackState = {
	elapsed: number
	playing: boolean
	looping: boolean
}

export type BurstSample = {
	/** True while inside the active burst window (not the pause). */
	inBurst : boolean
	/** Progress within the current cycle, in `[0, 1)`. */
	cycleT  : number
	/** True when a non-looping run has completed. */
	finished: boolean
}

/**
 * Shared playback props for burst motion wrappers (`Pulse`, `Bounce`, `Shake`,
 * `Wiggle`, `FlashColor`, `FlashBorder`, `Spinner`).
 */
export type BurstAnimationProps = {
	/** Unique playback instance key. */
	id            : string
	children?     : ReactEcs.JSX.Element | ReactEcs.JSX.Element[]
	/** When true, advances local time. Defaults to `true`. */
	playing?      : boolean
	/** When true, repeats burst + pause. When false, one-shot then stops. Defaults to `true`. */
	looping?      : boolean
	/**
	 * Seconds for one animation instance (one pulse, bounce, shake sequence, etc.).
	 * Not the duration of the whole burst — that is `duration * burstCount`.
	 */
	duration?     : number
	/** Number of instances per burst before the pause. */
	burstCount?   : number
	/** Seconds to rest between bursts. */
	burstInterval?: number
	/**
	 * Seconds to wait before the burst timeline starts (initial delay).
	 * Pair with a sibling that shares `duration` / `burstInterval` and no offset
	 * to alternate — e.g. both `duration={D}`, `burstInterval={D}`, one with
	 * `burstOffset={D}`. Defaults to `0`.
	 */
	burstOffset?  : number
}

type SyncProps = {
	playing?: boolean
	looping?: boolean
}


const states     = new Map<string, AnimationPlaybackState>()
const lastSynced = new Map<string, SyncProps>()


// MARK: sys_animationPlayback
function sys_animationPlayback(delta: number) {
	for (const state of states.values()) {
		if (state.playing) state.elapsed += delta
	}
}
engine.addSystem(sys_animationPlayback)


// MARK: ensureState
/** Returns playback state for `id`, creating it with `defaults` if missing. */
function ensureState(
	id      : string,
	defaults: { playing: boolean, looping: boolean },
): AnimationPlaybackState {
	let state = states.get(id)
	if (!state) {
		state = {
			elapsed: 0,
			playing: defaults.playing,
			looping: defaults.looping,
		}
		states.set(id, state)
	}
	return state
}


// MARK: syncAnimationPlayback
/**
 * Returns per-id playback state. `playing` / `looping` props sync only when
 * their values change so helpers like `playOnce` are not overwritten every frame.
 */
export function syncAnimationPlayback(
	id  : string,
	opts: SyncProps = {},
): AnimationPlaybackState {
	const state = ensureState(id, {
		playing: opts.playing ?? true,
		looping: opts.looping ?? true,
	})
	const prev = lastSynced.get(id) ?? {}

	if (opts.playing !== undefined && opts.playing !== prev.playing) {
		state.playing = opts.playing
		state.elapsed = 0
	}

	if (opts.looping !== undefined && opts.looping !== prev.looping) {
		state.looping = opts.looping
	}

	lastSynced.set(id, {
		playing: opts.playing,
		looping: opts.looping,
	})

	return state
}


// MARK: sampleBurstTime
/**
 * Maps elapsed playback time onto the burst / pause timeline used by motion wrappers.
 * Looping keeps the existing burst + interval cycle; one-shot runs `burstCount` cycles then finishes.
 * `burstOffset` delays the start of that timeline (rest until the offset elapses).
 */
export function sampleBurstTime(
	elapsed      : number,
	duration     : number,
	burstCount   : number,
	burstInterval: number,
	looping      : boolean,
	burstOffset  : number = 0,
): BurstSample {
	if (duration <= 0 || burstCount <= 0) {
		return { inBurst: false, cycleT: 0, finished: !looping }
	}

	const shifted = elapsed - Math.max(0, burstOffset)
	if (shifted < 0) {
		return { inBurst: false, cycleT: 0, finished: false }
	}

	const burstDuration = burstCount * duration

	if (looping) {
		const period = burstDuration + Math.max(0, burstInterval)
		const t      = period > 0 ? shifted % period : 0
		if (t < burstDuration) {
			return {
				inBurst : true,
				cycleT  : (t % duration) / duration,
				finished: false,
			}
		}
		return { inBurst: false, cycleT: 0, finished: false }
	}

	if (shifted >= burstDuration) {
		return { inBurst: false, cycleT: 0, finished: true }
	}

	return {
		inBurst : true,
		cycleT  : (shifted % duration) / duration,
		finished: false,
	}
}


// MARK: applyBurstSample
/**
 * Applies a burst sample to playback state. When a one-shot finishes, stops playback and resets elapsed.
 */
export function applyBurstSample(
	state : AnimationPlaybackState,
	sample: BurstSample,
): BurstSample {
	if (sample.finished && state.playing) {
		state.playing = false
		state.elapsed = 0
	}
	return sample
}


// MARK: playOnce
/** Starts (or restarts) a one-shot run for `id`. */
export function playOnce(id: string) {
	const state = ensureState(id, { playing: true, looping: false })
	state.playing = true
	state.looping = false
	state.elapsed = 0
}


// MARK: setPlaying
/** Toggles playback. When stopping, snaps elapsed back to rest. */
export function setPlaying(
	id     : string,
	playing: boolean,
) {
	const state = ensureState(id, { playing, looping: true })
	state.playing = playing
	state.elapsed = 0
}


// MARK: setLooping
/** Sets whether `id` loops after each burst sequence. */
export function setLooping(
	id     : string,
	looping: boolean,
) {
	const state = ensureState(id, { playing: true, looping })
	state.looping = looping
}


// MARK: isPlaying
/** Returns whether `id` is currently advancing. Missing ids are treated as not playing. */
export function isPlaying(id: string): boolean {
	return states.get(id)?.playing ?? false
}
