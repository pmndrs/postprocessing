#include <pp_default_output_pars_fragment>
#include <pp_depth_buffer_pars_fragment>
#include <pp_depth_utils_pars_fragment>
#include <packing>

#ifdef DOWNSAMPLE_NORMALS

	uniform mediump sampler2D normalBuffer;

#endif

in vec2 vUv0, vUv1, vUv2, vUv3;

/**
 * Returns the index of the most representative depth in the 2x2 neighborhood.
 */

int findBestDepth(const in float samples[4]) {

	// Calculate the centroid.
	float c = (samples[0] + samples[1] + samples[2] + samples[3]) * 0.25;

	float distances[4];
	distances[0] = abs(c - samples[0]);
	distances[1] = abs(c - samples[1]);
	distances[2] = abs(c - samples[2]);
	distances[3] = abs(c - samples[3]);

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
	float d[4];
	d[0] = readDepth(vUv0);
	d[1] = readDepth(vUv1);
	d[2] = readDepth(vUv2);
	d[3] = readDepth(vUv3);

	int index = findBestDepth(d);

	#ifdef DOWNSAMPLE_NORMALS

		// Gather all corresponding normals to avoid dependent texel fetches.
		vec3 n[4];
		n[0] = texture(normalBuffer, vUv0).rgb;
		n[1] = texture(normalBuffer, vUv1).rgb;
		n[2] = texture(normalBuffer, vUv2).rgb;
		n[3] = texture(normalBuffer, vUv3).rgb;

	#else

		vec3 n[4];
		n[0] = vec3(0.0);
		n[1] = vec3(0.0);
		n[2] = vec3(0.0);
		n[3] = vec3(0.0);

	#endif

	out_Color = vec4(n[index], d[index]);

}
