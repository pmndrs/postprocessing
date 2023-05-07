import {
	AmbientLight,
	BoxGeometry,
	CircleGeometry,
	ConeGeometry,
	DirectionalLight,
	DoubleSide,
	Group,
	Mesh,
	MeshStandardMaterial,
	OctahedronGeometry,
	SphereGeometry
} from "three";

/**
 * Creates lights.
 *
 * @return {Group} The lights.
 */

export function createLights() {

	const ambientLight = new AmbientLight(0x7a7a7a);

	const mainLight = new DirectionalLight(0xffbbaa, 1.0);
	mainLight.position.set(0, 0.05, -1).multiplyScalar(10);
	mainLight.castShadow = true;
	mainLight.shadow.bias = -0.01;
	mainLight.shadow.camera.near = 0.3;
	mainLight.shadow.camera.far = 20;
	mainLight.shadow.mapSize.width = 512;
	mainLight.shadow.mapSize.height = 512;
	mainLight.shadow.radius = 1;

	const backLight = new DirectionalLight(0xffbbaa, 0.1);
	backLight.position.copy(mainLight.position).negate();

	const lights = new Group();
	lights.add(ambientLight, mainLight, backLight);

	return lights;

}

/**
 * Creates scene actors.
 *
 * @return {Group} The actors.
 */

export function createActors() {

	const meshes = new Group();
	meshes.add(
		new Mesh(
			new SphereGeometry(1, 32, 32),
			new MeshStandardMaterial({
				color: 0xffff00
			})
		),
		new Mesh(
			new OctahedronGeometry(),
			new MeshStandardMaterial({
				color: 0xff00ff
			})
		),
		new Mesh(
			new CircleGeometry(0.75, 32),
			new MeshStandardMaterial({
				side: DoubleSide,
				color: 0xff0000
			})
		),
		new Mesh(
			new ConeGeometry(1, 1, 32),
			new MeshStandardMaterial({
				color: 0x00ff00
			})
		),
		new Mesh(
			new BoxGeometry(1, 1, 1),
			new MeshStandardMaterial({
				color: 0x00ffff
			})
		)
	);

	for(const mesh of meshes.children) {

		mesh.receiveShadow = true;
		mesh.castShadow = true;

	}

	return meshes;

}
