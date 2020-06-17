#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D depthBuffer;

#else

	uniform mediump sampler2D depthBuffer;

#endif

#ifdef DOWNSAMPLE_NORMALS

	uniform sampler2D normalBuffer;

#endif

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

float readDepth(const in vec2 uv) {

	#if DEPTH_PACKING == 3201

		return unpackRGBAToDepth(texture2D(depthBuffer, uv));

	#else

		return texture2D(depthBuffer, uv).r;

	#endif

}

/**
 * Returns the index of the most representative depth in the 2x2 neighborhood.
 */

int findBestDepth(const in float samples[4]) {

	// Calculate the centroid.
	float c = (samples[0] + samples[1] + samples[2] + samples[3]) / 4.0;

	float distances[4] = float[](
		abs(c - samples[0]), abs(c - samples[1]),
		abs(c - samples[2]), abs(c - samples[3])
	);

	float maxDistance = max(
		max(distances[0], distances[1]),
		max(distances[2], distances[3])
	);

	int remaining[3];
	int rejected[3];

	int i, j, k;

	for(i = 0, j = 0, k = 0; i < 4; ++i) {

		if(distances[i] < maxDistance) {

			// Keep the most representative samples.
			remaining[j++] = i;

		} else {

			// Discard max distance samples.
			rejected[k++] = i;

		}

	}

	// Fill up the array in case there were two or more max distance samples.
	for(; j < 3; ++j) {

		remaining[j] = rejected[--k];

	}

	// Final candidates.
	vec3 s = vec3(
		samples[remaining[0]],
		samples[remaining[1]],
		samples[remaining[2]]
	);

	// Recalculate the controid.
	c = (s.x + s.y + s.z) / 3.0;

	distances[0] = abs(c - s.x);
	distances[1] = abs(c - s.y);
	distances[2] = abs(c - s.z);

	float minDistance = min(distances[0], min(distances[1], distances[2]));

	// Determine the index of the min distance sample.
	for(i = 0; i < 3; ++i) {

		if(distances[i] == minDistance) {

			break;

		}

	}

	return remaining[i];

}

void main() {

	// Gather depth samples in a 2x2 neighborhood.
	float d[4] = float[](
		readDepth(vUv0), readDepth(vUv1),
		readDepth(vUv2), readDepth(vUv3)
	);

	int index = findBestDepth(d);

	#ifdef DOWNSAMPLE_NORMALS

		vec2 uvs[4] = vec2[](vUv0, vUv1, vUv2, vUv3);
		vec3 n = texture2D(normalBuffer, uvs[index]).rgb;

	#else

		vec3 n = vec3(0.0);

	#endif

	gl_FragColor = vec4(n, d[index]);

}
