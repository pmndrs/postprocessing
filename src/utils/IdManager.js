/**
 * An ID manager.
 */

export class IdManager {

	/**
	 * Constructs a new ID manager.
	 *
	 * @param initialId - The first ID.
	 */

	constructor(initialId = 0) {

		/**
		 * The next ID.
		 */

		this.nextId = initialId;

	}

	/**
	 * Returns the next unique ID.
	 *
	 * @return The ID.
	 */

	getNextId() {

		return this.nextId++;

	}

	/**
	 * Resets the ID counter.
	 *
	 * @param initialId - The first ID.
	 * @return This manager.
	 */

	reset(initialId = 0) {

		this.nextId = initialId;
		return this;

	}

}
