uniform vec2 texelSize;

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {

	vUv0 = vec2(uv.x + texelSize.x, uv.y);
	vUv1 = vec2(uv.x - texelSize.x, uv.y);
	vUv2 = vec2(uv.x, uv.y + texelSize.y);
	vUv3 = vec2(uv.x, uv.y - texelSize.y);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
