import { LinearFilter, NearestFilter, TextureFilter, WebGLRenderer, WebGLRenderTarget } from "three";

/**
 * Internal RenderTarget properties.
 */

interface RenderTargetProps {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	__webglFramebuffer: WebGLFramebuffer;

}

/**
 * Rapidly copies the contents of a source buffer into a destination buffer.
 *
 * Note: Ensure that the render targets are initialized before using this method.
 *
 * @see {@link WebGLRenderer.initRenderTarget}
 * @param src - The source buffer.
 * @param dst - The destination buffer.
 * @param color - Determines whether the color
 * @param filter - The filter type. Possible values are `NearestFilter` (default) and `LinearFilter`.
 * @category Utils
 * @internal
 */

export function blitFramebuffer(renderer: WebGLRenderer, src: WebGLRenderTarget, dst: WebGLRenderTarget,
	color = true, depth = false, stencil = false, filter: TextureFilter = NearestFilter): void {

	const gl = renderer.getContext() as WebGL2RenderingContext;
	const props = renderer.properties;

	const srcFBO = (props.get(src) as RenderTargetProps).__webglFramebuffer;
	const dstFBO = (props.get(dst) as RenderTargetProps).__webglFramebuffer;

	let glMask = 0;
	if(color) { glMask |= gl.COLOR_BUFFER_BIT; }
	if(depth) { glMask |= gl.DEPTH_BUFFER_BIT; }
	if(stencil) { glMask |= gl.STENCIL_BUFFER_BIT; }

	let glFilter: number;

	switch(filter) {

		case LinearFilter:
			glFilter = gl.LINEAR;
			break;

		case NearestFilter:
			glFilter = gl.NEAREST;
			break;

		default:
			glFilter = gl.NEAREST;
			console.warn(`Filter ${filter} is not supported`);
			break;

	}

	gl.bindFramebuffer(gl.READ_FRAMEBUFFER, srcFBO);
	gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dstFBO);

	gl.blitFramebuffer(
		0, 0, src.width, src.height,
		0, 0, dst.width, dst.height,
		glMask, glFilter
	);

	gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
	gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

}
