uniform vec2 texelSize;
uniform vec2 direction;
uniform vec2 scale; // X = resolution, Y = kernel

varying vec2 vOffset;
varying vec2 vUv;

void main() {

	vOffset = direction * texelSize * scale.x * scale.y;
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);

}
