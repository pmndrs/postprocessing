#include <common>
#include <packing>

#ifdef NORMAL_DEPTH

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D normalDepthBuffer;

	#else

		uniform mediump sampler2D normalDepthBuffer;

	#endif

	float readDepth(const in vec2 uv) {

		return texture2D(normalDepthBuffer, uv).a;

	}

#else

	uniform lowp sampler2D normalBuffer;

	#if DEPTH_PACKING == 3201

		uniform lowp sampler2D depthBuffer;

	#elif defined(GL_FRAGMENT_PRECISION_HIGH)

		uniform highp sampler2D depthBuffer;

	#else

		uniform mediump sampler2D depthBuffer;

	#endif

	float readDepth(const in vec2 uv) {

		#if DEPTH_PACKING == 3201

			return unpackRGBAToDepth(texture2D(depthBuffer, uv));

		#else

			return texture2D(depthBuffer, uv).r;

		#endif

	}

#endif

uniform lowp sampler2D noiseTexture;

uniform mat4 inverseProjectionMatrix;
uniform mat4 projectionMatrix;
uniform vec2 texelSize;
uniform vec2 cameraNearFar;

uniform float intensity;
uniform float minRadiusScale;
uniform float fade;
uniform float bias;

uniform vec2 distanceCutoff;
uniform vec2 proximityCutoff;

varying vec2 vUv;
varying vec2 vUv2;

float getViewZ(const in float depth) {

	#ifdef PERSPECTIVE_CAMERA

		return perspectiveDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);

	#else

		return orthographicDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);

	#endif

}

vec3 getViewPosition(const in vec2 screenPosition, const in float depth, const in float viewZ) {

	vec4 clipPosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);

	// Unoptimized version:
	// vec4 viewPosition = inverseProjectionMatrix * clipPosition;
	// viewPosition /= viewPosition.w; // Unproject.
	// return viewPosition.xyz;

	float clipW = projectionMatrix[2][3] * viewZ + projectionMatrix[3][3];
	clipPosition *= clipW; // Unproject.

	return (inverseProjectionMatrix * clipPosition).xyz;

}

float getAmbientOcclusion(const in vec3 p, const in vec3 n, const in float depth, const in vec2 uv) {

	// Distance scaling
	float radiusScale = 1.0 - smoothstep(0.0, distanceCutoff.y, depth);
	radiusScale = radiusScale * (1.0 - minRadiusScale) + minRadiusScale;
	float radius = RADIUS * radiusScale;

	// Use a random starting angle.
	float noise = texture2D(noiseTexture, vUv2).r;
	float baseAngle = noise * PI2;
	float rings = SPIRAL_TURNS * PI2;

	float occlusion = 0.0;
	int taps = 0;

	for(int i = 0; i < SAMPLES_INT; ++i) {

		float alpha = (float(i) + 0.5) * INV_SAMPLES_FLOAT;
		float angle = alpha * rings + baseAngle;
		vec2 rotation = vec2(cos(angle), sin(angle));
		vec2 coords = alpha * radius * rotation * texelSize + uv;

		if(coords.s < 0.0 || coords.s > 1.0 || coords.t < 0.0 || coords.t > 1.0) {

			// Skip samples outside the screen.
			continue;

		}

		float sampleDepth = readDepth(coords);
		float viewZ = getViewZ(sampleDepth);

		#ifdef PERSPECTIVE_CAMERA

			float linearSampleDepth = viewZToOrthographicDepth(viewZ, cameraNearFar.x, cameraNearFar.y);

		#else

			float linearSampleDepth = sampleDepth;

		#endif

		float proximity = abs(depth - linearSampleDepth);

		if(proximity < proximityCutoff.y) {

			float falloff = 1.0 - smoothstep(proximityCutoff.x, proximityCutoff.y, proximity);

			vec3 Q = getViewPosition(coords, sampleDepth, viewZ);
			vec3 v = Q - p;

			float vv = dot(v, v);
			float vn = dot(v, n) - bias;

			float f = max(RADIUS_SQ - vv, 0.0) / RADIUS_SQ;
			occlusion += (f * f * f * max(vn / (fade + vv), 0.0)) * falloff;

		}

		++taps;

	}

	return occlusion / (4.0 * max(float(taps), 1.0));

}

void main() {

	#ifdef NORMAL_DEPTH

		vec4 normalDepth = texture2D(normalDepthBuffer, vUv);

	#else

		vec4 normalDepth = vec4(texture2D(normalBuffer, vUv).xyz, readDepth(vUv));

	#endif

	float ao = 0.0;
	float depth = normalDepth.a;
	float viewZ = getViewZ(depth);

	#ifdef PERSPECTIVE_CAMERA

		float linearDepth = viewZToOrthographicDepth(viewZ, cameraNearFar.x, cameraNearFar.y);

	#else

		float linearDepth = depth;

	#endif

	// Skip fragments that are too far away.
	if(linearDepth < distanceCutoff.y) {

		vec3 viewPosition = getViewPosition(vUv, depth, viewZ);
		vec3 viewNormal = unpackRGBToNormal(normalDepth.rgb);
		ao += getAmbientOcclusion(viewPosition, viewNormal, linearDepth, vUv);

		// Fade AO based on depth.
		float d = smoothstep(distanceCutoff.x, distanceCutoff.y, linearDepth);
		ao = mix(ao, 0.0, d);

		#ifdef LEGACY_INTENSITY

			ao = clamp(1.0 - pow(1.0 - ao, abs(intensity)), 0.0, 1.0);

		#endif

	}

	gl_FragColor.r = ao;

}
