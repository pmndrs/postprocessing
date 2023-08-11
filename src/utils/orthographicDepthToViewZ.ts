/**
 * Converts orthographic depth into a view Z value.
 *
 * @see https://github.com/mrdoob/three.js/blob/0de4e75ee65c3238957318b88ef91b6597e23c1e/src/renderers/shaders/ShaderChunk/packing.glsl.js#L42
 * @param depth - The linear clip Z.
 * @param near - The camera near plane.
 * @param far - The camera far plane.
 * @return The view Z.
 * @group Utils
 */

export function orthographicDepthToViewZ(depth: number, near: number, far: number): number {

	return depth * (near - far) - near;

}
