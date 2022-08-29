#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

#ifdef BILATERAL

	#include <packing>

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D depthBuffer;

	#else

		uniform mediump sampler2D depthBuffer;

	#endif

	uniform vec2 cameraNearFar;

	float readDepth(const in vec2 uv) {

		#if DEPTH_PACKING == 3201

			return unpackRGBAToDepth(texture2D(depthBuffer, uv));

		#else

			return texture2D(depthBuffer, uv).r;

		#endif

	}

	float getViewZ(const in float depth) {

		#ifdef PERSPECTIVE_CAMERA

			return perspectiveDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);

		#else

			return orthographicDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);

		#endif

	}

	#ifdef PERSPECTIVE_CAMERA

		#define linearDepth(v) viewZToOrthographicDepth(getViewZ(readDepth(v)), cameraNearFar.x, cameraNearFar.y)

	#else

		#define linearDepth(v) readDepth(v)

	#endif

#endif

#define getTexel(v) texture2D(inputBuffer, v)

#if KERNEL_SIZE == 9

	varying vec2 vUv00, vUv01, vUv02;
	varying vec2 vUv03, vUv04, vUv05;
	varying vec2 vUv06, vUv07, vUv08;

#else

	varying vec2 vUv00, vUv01, vUv02, vUv03, vUv04;
	varying vec2 vUv05, vUv06, vUv07, vUv08, vUv09;
	varying vec2 vUv10, vUv11, vUv12, vUv13, vUv14;
	varying vec2 vUv15, vUv16, vUv17, vUv18, vUv19;
	varying vec2 vUv20, vUv21, vUv22, vUv23, vUv24;

#endif

void main() {

	#if KERNEL_SIZE == 9

		vec4 c[] = vec4[9](
			getTexel(vUv00), getTexel(vUv01), getTexel(vUv02),
			getTexel(vUv03), getTexel(vUv04), getTexel(vUv05),
			getTexel(vUv06), getTexel(vUv07), getTexel(vUv08)
		);

		#ifdef BILATERAL

			float z[] = float[9](
				linearDepth(vUv00), linearDepth(vUv01), linearDepth(vUv02),
				linearDepth(vUv03), linearDepth(vUv04), linearDepth(vUv05),
				linearDepth(vUv06), linearDepth(vUv07), linearDepth(vUv08)
			);

			float centerDepth = z[4];

		#endif

	#else

		vec4 c[] = vec4[25](
			getTexel(vUv00), getTexel(vUv01), getTexel(vUv02), getTexel(vUv03), getTexel(vUv04),
			getTexel(vUv05), getTexel(vUv06), getTexel(vUv07), getTexel(vUv08), getTexel(vUv09),
			getTexel(vUv10), getTexel(vUv11), getTexel(vUv12), getTexel(vUv13), getTexel(vUv14),
			getTexel(vUv15), getTexel(vUv16), getTexel(vUv17), getTexel(vUv18), getTexel(vUv19),
			getTexel(vUv20), getTexel(vUv21), getTexel(vUv22), getTexel(vUv23), getTexel(vUv24)
		);

		#ifdef BILATERAL

			float z[] = float[25](
				linearDepth(vUv00), linearDepth(vUv01), linearDepth(vUv02), linearDepth(vUv03), linearDepth(vUv04),
				linearDepth(vUv05), linearDepth(vUv06), linearDepth(vUv07), linearDepth(vUv08), linearDepth(vUv09),
				linearDepth(vUv10), linearDepth(vUv11), linearDepth(vUv12), linearDepth(vUv13), linearDepth(vUv14),
				linearDepth(vUv15), linearDepth(vUv16), linearDepth(vUv17), linearDepth(vUv18), linearDepth(vUv19),
				linearDepth(vUv20), linearDepth(vUv21), linearDepth(vUv22), linearDepth(vUv23), linearDepth(vUv24)
			);

			float centerDepth = z[12];

		#endif

	#endif

	#ifdef BILATERAL

		vec4 result = vec4(0.0);
		float w = 0.0;

		for(int i = 0; i < KERNEL_SIZE; ++i) {

			float d = step(abs(z[i] - centerDepth), DISTANCE_THRESHOLD);
			result += c[i] * d;
			w += d;

		}

		gl_FragColor = result / max(w, 1.0);

	#else

		vec4 result = vec4(0.0);

		for(int i = 0; i < KERNEL_SIZE; ++i) {

			result += c[i];

		}

		gl_FragColor = result * INV_KERNEL_SIZE;

	#endif

}
