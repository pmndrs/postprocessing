/**
 * Creates a deterministic pseudo-random number generator.
 *
 * @see https://github.com/cprosche/mulberry32
 * @param seed - The seed.
 * @return A function that returns values in the range `[0, 1)`.
 * @category Utils
 * @internal
 */

export function createSeededRandom(seed: number): () => number {

	let state = seed >>> 0;

	return () => {

		state |= 0;
		state = (state + 0x6D2B79F5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;

	};

}
