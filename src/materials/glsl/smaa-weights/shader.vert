uniform vec2 texelSize;

varying vec2 vUv;
varying vec4 vOffset[3];
varying vec2 vPixCoord;

void main() {

	vUv = position.xy * 0.5 + 0.5;
	vPixCoord = vUv / texelSize;

	// Offsets for the searches (see @PSEUDO_GATHER4).
	vOffset[0] = vUv.xyxy + texelSize.xyxy * vec4(-0.25, 0.125, 1.25, 0.125); // Changed sign in Y and W components.
	vOffset[1] = vUv.xyxy + texelSize.xyxy * vec4(-0.125, 0.25, -0.125, -1.25); //Changed sign in Y and W components.

	// This indicates the ends of the loops.
	vOffset[2] = vec4(vOffset[0].xz, vOffset[1].yw) + vec4(-2.0, 2.0, -2.0, 2.0) * texelSize.xxyy * MAX_SEARCH_STEPS_FLOAT;

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
