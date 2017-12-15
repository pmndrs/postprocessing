#include <packing>

uniform sampler2D depthTexture;
uniform vec2 cameraNearFar;

varying vec4 vPosition;
varying vec4 projTexCoord;

void main() {
  float depth = unpackRGBAToDepth(texture2DProj(depthTexture, projTexCoord));

  float viewZ = -perspectiveDepthToViewZ( depth, cameraNearFar.x, cameraNearFar.y );

  float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;

  gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);
}
