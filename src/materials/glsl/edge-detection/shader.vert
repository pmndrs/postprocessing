uniform vec2 texelSize;

varying vec2 vUv;
varying vec2 vUv0;
varying vec2 vUv1;

#if EDGE_DETECTION_MODE != 0

	varying vec2 vUv2;
	varying vec2 vUv3;
	varying vec2 vUv4;
	varying vec2 vUv5;

#endif

void main() {

	vUv = position.xy * 0.5 + 0.5;

	// Left and top texel coordinates.
	vUv0 = vUv + texelSize * vec2(-1.0, 0.0);
	vUv1 = vUv + texelSize * vec2(0.0, -1.0);

	#if EDGE_DETECTION_MODE != 0

		// Right and bottom texel coordinates.
		vUv2 = vUv + texelSize * vec2(1.0, 0.0);
		vUv3 = vUv + texelSize * vec2(0.0, 1.0);

		// Left-left and top-top texel coordinates.
		vUv4 = vUv + texelSize * vec2(-2.0, 0.0);
		vUv5 = vUv + texelSize * vec2(0.0, -2.0);

	#endif

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
