#include <common>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>

varying float vViewZ;
varying vec4 vProjTexCoord;

void main() {

	#include <skinbase_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>

	vViewZ = mvPosition.z;
	vProjTexCoord = gl_Position;

	#include <clipping_planes_vertex>

}
