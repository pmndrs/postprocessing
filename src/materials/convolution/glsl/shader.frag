uniform sampler2D tDiffuse;
uniform vec2 uImageIncrement;
uniform float cKernel[KERNEL_SIZE_INT];

varying vec2 vUv;

void main() {

	vec2 coord = vUv;
	vec4 sum = vec4(0.0);

	for(int i = 0; i < KERNEL_SIZE_INT; ++i) {

		sum += texture2D(tDiffuse, coord) * cKernel[i];
		coord += uImageIncrement;

	}

	gl_FragColor = sum;

}
