/**
 * Converts view Z to orthographic depth.
 *
 * @see https://github.com/mrdoob/three.js/blob/0de4e75ee65c3238957318b88ef91b6597e23c1e/src/renderers/shaders/ShaderChunk/packing.glsl.js#L39
 * @param {Number} viewZ - The view Z. Expected to be negative.
 * @param {Number} near - The camera near plane.
 * @param {Number} far - The camera far plane.
 * @return {Number} The depth.
 * @ignore
 */

export function viewZToOrthographicDepth(viewZ, near, far) {

	return Math.min(Math.max((viewZ + near) / (near - far), 0.0), 1.0);

}
