uniform sampler2D tDiffuse;
uniform float intensity;
uniform vec2 resolution;

varying vec2 vUv;

void main() {

	vec4 texel;

	float granularity = floor(intensity);

	if(mod(granularity, 2.0) > 0.0) {

		granularity += 1.0;

	}

	if(granularity > 0.0) {

		float dx = granularity / resolution.x;
		float dy = granularity / resolution.y;

		vec2 coord = vec2(dx * (floor(vUv.x / dx) + 0.5), dy * (floor(vUv.y / dy) + 0.5));

		texel = texture2D(tDiffuse, coord);

	} else {

		texel = texture2D(tDiffuse, vUv);

	}

	gl_FragColor = texel;

}
