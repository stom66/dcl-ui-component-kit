import { engine } from '@dcl/sdk/ecs'


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
 */
export function sampleBurstTime(
	elapsed      : number,
	speed        : number,
	burstCount   : number,
	burstInterval: number,
	looping      : boolean,
): BurstSample {
	if (speed <= 0 || burstCount <= 0) {
		return { inBurst: false, cycleT: 0, finished: !looping }
	}

	const burstDuration = burstCount * speed

	if (looping) {
		const period = burstDuration + Math.max(0, burstInterval)
		const t      = period > 0 ? elapsed % period : 0
		if (t < burstDuration) {
			return {
				inBurst : true,
				cycleT  : (t % speed) / speed,
				finished: false,
			}
		}
		return { inBurst: false, cycleT: 0, finished: false }
	}

	if (elapsed >= burstDuration) {
		return { inBurst: false, cycleT: 0, finished: true }
	}

	return {
		inBurst : true,
		cycleT  : (elapsed % speed) / speed,
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
