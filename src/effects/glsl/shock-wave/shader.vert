uniform float size;
uniform float cameraDistance;

varying float vSize;

void mainSupport() {

	vSize = (0.1 * cameraDistance) / size;

}
