uniform sampler2D tDiffuse;
uniform sampler2D tDisp;
uniform int byp;
uniform float amount;
uniform float angle;
uniform float seed;
uniform float seedX;
uniform float seedY;
uniform float distortionX;
uniform float distortionY;
uniform float colS;

varying vec2 vUv;

float rand(vec2 co) {

	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);

}

void main() {

	vec2 coord = vUv;

	float xs, ys;
	vec4 normal;

	vec2 offset;
	vec4 cr, cga, cb;
	vec4 snow, color;

	if(byp < 1) {

		xs = floor(gl_FragCoord.x / 0.5);
		ys = floor(gl_FragCoord.y / 0.5);

		normal = texture2D(tDisp, coord * seed * seed);

		if(coord.y < distortionX + colS && coord.y > distortionX - colS * seed) {

			if(seedX > 0.0){

				coord.y = 1.0 - (coord.y + distortionY);

			} else {

				coord.y = distortionY;

			}

		}

		if(coord.x < distortionY + colS && coord.x > distortionY - colS * seed) {

			if(seedY > 0.0){

				coord.x = distortionX;

			} else {

				coord.x = 1. - (coord.x + distortionX);

			}

		}

		coord.x += normal.x * seedX * (seed / 5.0);
		coord.y += normal.y * seedY * (seed / 5.0);

		// Adopted from RGB shift shader.
		offset = amount * vec2(cos(angle), sin(angle));
		cr = texture2D(tDiffuse, coord + offset);
		cga = texture2D(tDiffuse, coord);
		cb = texture2D(tDiffuse, coord - offset);
		color = vec4(cr.r, cga.g, cb.b, cga.a);
		snow = 200.0 * amount * vec4(rand(vec2(xs * seed,ys * seed * 50.0)) * 0.2);
		color += snow;

	} else {

		color = texture2D(tDiffuse, vUv);

	}

	gl_FragColor = color;

}
