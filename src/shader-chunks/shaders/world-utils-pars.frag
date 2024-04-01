uniform mat4 viewMatrixInverse;

#define cameraPosition viewMatrixInverse[3].xyz
#define getWorldPosition(viewPosition) (viewMatrixInverse * vec4(viewPosition, 1.0)).xyz
#define getDistance(worldPosition) length(worldPosition - cameraPosition)
