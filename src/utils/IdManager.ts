/**
 * An ID manager.
 *
 * @category Utils
 */

export class IdManager {

	/**
	 * The next ID.
	 */

	private nextId: number;

	/**
	 * Constructs a new ID manager.
	 *
	 * @param initialId - The first ID.
	 */

	constructor(initialId = 0) {

		this.nextId = initialId;

	}

	/**
	 * Returns the next unique ID.
	 *
	 * @return The ID.
	 */

	getNextId(): number {

		return this.nextId++;

	}

	/**
	 * Resets the ID counter.
	 *
	 * @param initialId - The first ID.
	 * @return This manager.
	 */

	reset(initialId = 0): this {

		this.nextId = initialId;
		return this;

	}

}
