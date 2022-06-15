uniform bool active;
uniform vec4 d;

void mainUv(inout vec2 uv) {

	if(active) {

		uv = d.xy * (floor(uv * d.zw) + 0.5);

	}

}
