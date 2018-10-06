varying vec2 vOffset0;
varying vec2 vOffset1;

void mainSupport() {

	vOffset0 = uv + texelSize * vec2(1.0, 0.0);
	vOffset1 = uv + texelSize * vec2(0.0, -1.0); // Changed sign in Y component.

}
