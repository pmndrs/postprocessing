import { OrthographicCamera } from "three";

/**
 * A reusable fullscreen camera.
 *
 * @internal
 */

export const fullscreenCamera = /* @__PURE__ */ new OrthographicCamera(-1, 1, 1, -1, 0, 1);
