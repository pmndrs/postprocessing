uniform sampler2D tDiffuse;
uniform float stepSize;
uniform float decay;
uniform float weight;
uniform float exposure;
uniform vec3 lightPosition;

varying vec2 vUv;

void main() {

	vec2 texCoord = vUv;
	float numSamples = float(NUM_SAMPLES);

	// Calculate vector from pixel to light source in screen space.
	vec2 deltaTexCoord = texCoord - lightPosition.st;
	float distance = length(deltaTexCoord);

	// Step vector (uv space).
	vec2 step = stepSize * deltaTexCoord / distance;

	// Number of iterations between pixel and sun.
	int iterations = int(distance / stepSize);

	// Set up illumination decay factor.
	float illuminationDecay = 1.0;

	// Sample color.
	vec4 sample;

	// Color accumulator.
	vec4 color = vec4(0.0);

	// Estimate the probability of occlusion at each pixel by summing samples along a ray to the light source.
	for(int i = 0; i < NUM_SAMPLES; ++i) {

		// Don't do more than necessary.
		if(i <= iterations && texCoord.y < 1.0) {

			sample = texture2D(tDiffuse, texCoord);

			// Apply sample attenuation scale/decay factors.
			sample *= illuminationDecay * weight;

			color += sample;

			// Update exponential decay factor.
			illuminationDecay *= decay;

		}

		texCoord -= step;

	}

	// Output final color with a further scale control factor.
	gl_FragColor = (color / numSamples) * exposure;

}
