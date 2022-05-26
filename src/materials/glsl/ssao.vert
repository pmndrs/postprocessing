uniform vec2 noiseScale;

varying vec2 vUv;
varying vec2 vUv2;

void main() {

	vUv = position.xy * 0.5 + 0.5;
	vUv2 = vUv * noiseScale;

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
