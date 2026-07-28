type Listener = () => void

export class PropsController<T extends Record<string, any>> {
	private data: T
	private listeners = new Set<Listener>()

	constructor(initial: T) {
		this.data = initial
	}


	// MARK: get
	/** Returns the value for the given key. */
	get<K extends keyof T>(key: K): T[K] {
		return this.data[key]
	}


	// MARK: set
	/** Sets a single key and notifies subscribers. */
	set<K extends keyof T>(
		key  : K,
		value: T[K]
	) {
		this.data[key] = value
		this.emit()
	}


	// MARK: update
	/** Merges a partial update and notifies subscribers. */
	update(partial: Partial<T>) {
		Object.assign(this.data, partial)
		this.emit()
	}


	// MARK: subscribe
	/** Registers a change listener; returns an unsubscribe function. */
	subscribe(fn: Listener) {
		this.listeners.add(fn)
		return () => this.listeners.delete(fn)
	}


	// MARK: emit
	private emit() {
		for (const listener of this.listeners) listener()
	}
}
