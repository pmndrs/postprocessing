uniform sampler2D tDiffuse;
uniform sampler2D tPerturb;

uniform bool active;

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

	float sx, sy;

	if(active) {

		xs = floor(gl_FragCoord.x / 0.5);
		ys = floor(gl_FragCoord.y / 0.5);

		normal = texture2D(tPerturb, coord * seed * seed);

		if(coord.y < distortionX + colS && coord.y > distortionX - colS * seed) {

			sx = clamp(ceil(seedX), 0.0, 1.0);
			coord.y = sx * (1.0 - (coord.y + distortionY)) + (1.0 - sx) * distortionY;

		}

		if(coord.x < distortionY + colS && coord.x > distortionY - colS * seed) {

			sy = clamp(ceil(seedY), 0.0, 1.0);
			coord.x = sy * distortionX + (1.0 - sy) * (1.0 - (coord.x + distortionX));

		}

		coord.x += normal.x * seedX * (seed / 5.0);
		coord.y += normal.y * seedY * (seed / 5.0);

		offset = amount * vec2(cos(angle), sin(angle));

		cr = texture2D(tDiffuse, coord + offset);
		cga = texture2D(tDiffuse, coord);
		cb = texture2D(tDiffuse, coord - offset);

		color = vec4(cr.r, cga.g, cb.b, cga.a);
		snow = 200.0 * amount * vec4(rand(vec2(xs * seed, ys * seed * 50.0)) * 0.2);
		color += snow;

	} else {

		color = texture2D(tDiffuse, vUv);

	}

	gl_FragColor = color;

}
