/**
 * Converts orthographic depth to view Z.
 *
 * @see https://github.com/mrdoob/three.js/blob/0de4e75ee65c3238957318b88ef91b6597e23c1e/src/renderers/shaders/ShaderChunk/packing.glsl.js#L42
 * @param {Number} depth - The linear clip Z.
 * @param {Number} near - The camera near plane.
 * @param {Number} far - The camera far plane.
 * @return {Number} The view Z.
 * @ignore
 */

export function orthographicDepthToViewZ(depth, near, far) {

	return depth * (near - far) - near;

}
