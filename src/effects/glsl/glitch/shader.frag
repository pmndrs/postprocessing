uniform sampler2D perturbationMap;

uniform bool active;
uniform float amount;
uniform float angle;
uniform float x;
uniform float colS;
uniform vec2 seed;
uniform vec2 distortion;

varying vec2 vUv;

void mainUv(inout vec2 uv) {

	if(active) {

		float xs = floor(gl_FragCoord.x * 2.0);
		float ys = floor(gl_FragCoord.y * 2.0);

		vec4 normal = texture2D(perturbationMap, uv * x * x);

		if(uv.y < distortion.x + colS && uv.y > distortion.x - colS * x) {

			sx = clamp(ceil(seed.x), 0.0, 1.0);
			uv.y = sx * (1.0 - (uv.y + distortion.y)) + (1.0 - sx) * distortion.y;

		}

		if(uv.x < distortion.y + colS && uv.x > distortion.y - colS * x) {

			sy = clamp(ceil(seed.y), 0.0, 1.0);
			uv.x = sy * distortion.x + (1.0 - sy) * (1.0 - (uv.x + distortion.x));

		}

		uv.x += normal.x * seed.x * (x * 0.2);
		uv.y += normal.y * seed.y * (x * 0.2);

	}

}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec4 color = inputColor;

	if(active) {

		vec2 offset = amount * vec2(cos(angle), sin(angle));

		vec4 cr = texture2D(inputBuffer, uv + offset);
		vec4 cb = texture2D(inputBuffer, uv - offset);

		color = vec4(cr.r, color.g, cb.b, color.a);

	}

	outputColor = color;

}
