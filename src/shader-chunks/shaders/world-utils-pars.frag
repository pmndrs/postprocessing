uniform mat4 viewMatrixInverse;

#define getWorldPosition(viewPosition) (viewMatrixInverse * vec4(viewPosition, 1.0)).xyz
#define getDistance(viewPosition) length(viewPosition)
