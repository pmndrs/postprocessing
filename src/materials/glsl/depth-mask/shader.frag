uniform sampler2D depthBuffer0;
uniform sampler2D depthBuffer1;
uniform sampler2D inputBuffer;

varying vec2 vUv;

void main() {

	float d0 = texture2D(depthBuffer0, vUv).r;
	float d1 = texture2D(depthBuffer1, vUv).r;

	if(d0 < d1) {

		discard;

	}

	gl_FragColor = texture2D(inputBuffer, vUv);

}
