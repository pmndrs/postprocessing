// #region WebGL

/**
 * Returns a safe render target sample count for the given rendering context.
 *
 * Some environments, such as expo-gl, expose `renderbufferStorageMultisample` but throw when it is called.
 * This check detects that case and falls back to zero samples. Samples are also clamped by `gl.MAX_SAMPLES`.
 *
 * @internal
 * @see https://docs.expo.dev/versions/v57.0.0/sdk/gl-view/#webgl-api
 * @param renderer - A renderer.
 * @param samples - The desired sample count.
 * @return The safe sample count that is closest to the requested one.
 */

export function getSafeSamples(renderer, samples) {

	const gl = renderer.getContext();

	if(samples <= 0 || typeof gl.renderbufferStorageMultisample !== "function") {

		return 0;

	}

	const maxSamples = gl.getParameter(gl.MAX_SAMPLES);
	const safeSamples = Math.min(samples, maxSamples);

	if(safeSamples <= 0) {

		return 0;

	}

	const previousRenderbuffer = gl.getParameter(gl.RENDERBUFFER_BINDING);
	const renderbuffer = gl.createRenderbuffer();

	try {

		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.renderbufferStorageMultisample(gl.RENDERBUFFER, safeSamples, gl.RGBA8, 1, 1);

		return safeSamples;

	} catch(e) {

		return 0;

	} finally {

		gl.bindRenderbuffer(gl.RENDERBUFFER, previousRenderbuffer);
		gl.deleteRenderbuffer(renderbuffer);

	}

}

// #endregion
