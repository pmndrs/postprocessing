uniform sampler2D tDiffuse;
uniform float granularity;
uniform float dx;
uniform float dy;

varying vec2 vUv;

void main() {

	vec4 texel;

	if(granularity > 0.0) {

		vec2 coord = vec2(
			dx * (floor(vUv.x / dx) + 0.5),
			dy * (floor(vUv.y / dy) + 0.5)
		);

		texel = texture2D(tDiffuse, coord);

	} else {

		texel = texture2D(tDiffuse, vUv);

	}

	gl_FragColor = texel;

}
