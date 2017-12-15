uniform mat4 textureMatrix;

varying vec4 projTexCoord;
varying vec4 vPosition;

void main() {
  vPosition = modelViewMatrix * vec4(position, 1.0);

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  projTexCoord = textureMatrix * worldPosition;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
