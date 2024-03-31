uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixInverse;
uniform mat4 viewMatrix;
uniform mat4 viewMatrixInverse;
uniform vec3 cameraParams;

#define cameraPosition viewMatrixInverse[3].xyz
