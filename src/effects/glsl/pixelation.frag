uniform bool active;
uniform vec2 d;

void mainUv(inout vec2 uv) {

	if(active) {

		uv = vec2(
			d.x * (floor(uv.x / d.x) + 0.5),
			d.y * (floor(uv.y / d.y) + 0.5)
		);

	}

}
