import { BufferAttribute, BufferGeometry } from "three";

/**
 * A reusable fullscreen triangle.
 *
 * The screen size is 2x2 units (NDC), so the size of a triangle needs to be 4x4 units to exactly fill the screen.
 * @see https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
 * @internal
 */

export const fullscreenGeometry: Readonly<BufferGeometry> = /* @__PURE__ */ (() => {

	const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(vertices, 3));
	return geometry;

})();
