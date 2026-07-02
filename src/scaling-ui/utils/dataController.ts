type Listener = () => void

export class DataController<T extends Record<string, any>> {
	private data: T
	private listeners = new Set<Listener>()

	constructor(initial: T) {
		this.data = initial
	}

	get<K extends keyof T>(key: K): T[K] {
		return this.data[key]
	}

	set<K extends keyof T>(key: K, value: T[K]) {
		this.data[key] = value
		this.emit()
	}

	update(partial: Partial<T>) {
		Object.assign(this.data, partial)
		this.emit()
	}

	subscribe(fn: Listener) {
		this.listeners.add(fn)
		return () => this.listeners.delete(fn)
	}

	private emit() {
		for (const l of this.listeners) l()
	}
}