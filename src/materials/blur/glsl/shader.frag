uniform sampler2D tDiffuse;
uniform float strength;

varying vec2 vUv;

void main() {

	vec4 offset = vec4(
		1.0 * strength,
		2.0 * strength,
		3.0 * strength,
		4.0 * strength
	);

	#ifdef HORIZONTAL

		vec2 coord1 = vec2(vUv.x - offset.x, vUv.y);
		vec2 coord2 = vec2(vUv.x - offset.y, vUv.y);
		vec2 coord3 = vec2(vUv.x - offset.z, vUv.y);
		vec2 coord4 = vec2(vUv.x - offset.w, vUv.y);

	#else

		vec2 coord1 = vec2(vUv.x, vUv.y - offset.x);
		vec2 coord2 = vec2(vUv.x, vUv.y - offset.y);
		vec2 coord3 = vec2(vUv.x, vUv.y - offset.z);
		vec2 coord4 = vec2(vUv.x, vUv.y - offset.w);

	#endif

	vec4 sum = vec4(0.0);

	sum += texture2D(tDiffuse, coord4) * 0.051;
	sum += texture2D(tDiffuse, coord3) * 0.0918;
	sum += texture2D(tDiffuse, coord2) * 0.12245;
	sum += texture2D(tDiffuse, coord1) * 0.1531;

	sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y)) * 0.1633;

	sum += texture2D(tDiffuse, coord1) * 0.1531;
	sum += texture2D(tDiffuse, coord2) * 0.12245;
	sum += texture2D(tDiffuse, coord3) * 0.0918;
	sum += texture2D(tDiffuse, coord4) * 0.051;

	gl_FragColor = sum;

}
