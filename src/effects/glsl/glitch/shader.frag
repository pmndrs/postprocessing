uniform lowp sampler2D perturbationMap;

uniform bool active;
uniform float columns;
uniform float random;
uniform vec2 seeds;
uniform vec2 distortion;

void mainUv(inout vec2 uv) {

	if(active) {

		if(uv.y < distortion.x + columns && uv.y > distortion.x - columns * random) {

			float sx = clamp(ceil(seeds.x), 0.0, 1.0);
			uv.y = sx * (1.0 - (uv.y + distortion.y)) + (1.0 - sx) * distortion.y;

		}

		if(uv.x < distortion.y + columns && uv.x > distortion.y - columns * random) {

			float sy = clamp(ceil(seeds.y), 0.0, 1.0);
			uv.x = sy * distortion.x + (1.0 - sy) * (1.0 - (uv.x + distortion.x));

		}

		vec2 normal = texture2D(perturbationMap, uv * random * random).rg;
		uv += normal * seeds * (random * 0.2);

	}

}
