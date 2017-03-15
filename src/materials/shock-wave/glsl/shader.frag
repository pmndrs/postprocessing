#include <common>

uniform sampler2D tDiffuse;
uniform vec2 center;
uniform float aspect;
uniform float waveSize;
uniform float radius;
uniform float maxRadius;
uniform float amplitude;

varying vec2 vUv;
varying float vSize;

void main() {

	vec2 aspectCorrection = vec2(aspect, 1.0);

	vec2 difference = vUv * aspectCorrection - center * aspectCorrection;
	float distance = sqrt(dot(difference, difference)) * vSize;

	vec2 displacement = vec2(0.0);

	if(distance > radius) {

		if(distance < radius + waveSize) {

			float angle = (distance - radius) * PI2 / waveSize;
			float cosSin = (1.0 - cos(angle)) * 0.5;

			float extent = maxRadius + waveSize;
			float decay = max(extent - distance * distance, 0.0) / extent;

			displacement = ((cosSin * amplitude * difference) / distance) * decay;

		}

	}

	gl_FragColor = texture2D(tDiffuse, vUv - displacement);

}
