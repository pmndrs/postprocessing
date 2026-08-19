/**
 * An enumeration of render target load operations.
 *
 * The ops say what happens to the target’s existing pixels when the pass begins rendering:
 * - clear: the buffer is cleared.
 * - load: preserve existing pixels and draw over some or all of them.
 * - dontCare: existing pixels are irrelevant and will all be overwritten.
 */

export type LoadOp = "load" | "clear" | "dontCare";
