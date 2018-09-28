varying vec4 vOffset;

void mainSupport() {

	vOffset = uv.xyxy + texelSize.xyxy * vec4(1.0, 0.0, 0.0, -1.0); // Changed sign in W component.

}
