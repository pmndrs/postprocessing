uniform sampler2D tDiffuse;
uniform vec3 lightPosition;

uniform float exposure;
uniform float decay;
uniform float density;
uniform float weight;
uniform float clampMax;

varying vec2 vUv;

void main() {

	vec2 texCoord = vUv;

	// Calculate vector from pixel to light source in screen space.
	vec2 deltaTexCoord = texCoord - lightPosition.st;
	deltaTexCoord *= 1.0 / NUM_SAMPLES_FLOAT * density;

	// A decreasing illumination factor.
	float illuminationDecay = 1.0;

	vec4 sample;
	vec4 color = vec4(0.0);

	// Estimate the probability of occlusion at each pixel by summing samples along a ray to the light source.
	for(int i = 0; i < NUM_SAMPLES_INT; ++i) {

		texCoord -= deltaTexCoord;
		sample = texture2D(tDiffuse, texCoord);

		// Apply sample attenuation scale/decay factors.
		sample *= illuminationDecay * weight;

		color += sample;

		// Update exponential decay factor.
		illuminationDecay *= decay;

	}

	gl_FragColor = clamp(color * exposure, 0.0, clampMax);

}
