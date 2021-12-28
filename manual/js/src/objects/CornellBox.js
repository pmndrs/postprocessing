import {
	AmbientLight,
	BoxBufferGeometry,
	DirectionalLight,
	Group,
	Mesh,
	MeshStandardMaterial,
	PlaneBufferGeometry,
	PointLight,
	SphereBufferGeometry
} from "three";

/**
 * Creates lights.
 *
 * @return {Array} The lights.
 */

export function createLights() {

	const ambientLight = new AmbientLight(0x160D03);

	const lightCeiling = new PointLight(0xFFC370, 1, 3);
	lightCeiling.position.set(0, 0.93, 0);
	lightCeiling.castShadow = true;
	lightCeiling.shadow.bias = -0.035;
	lightCeiling.shadow.mapSize.width = 1024;
	lightCeiling.shadow.mapSize.height = 1024;
	lightCeiling.shadow.radius = 4;

	const lightRed = new DirectionalLight(0xFF0000, 0.05);
	lightRed.position.set(-1, 0, 0);
	lightRed.target.position.set(0, 0, 0);

	const lightGreen = new DirectionalLight(0x00FF00, 0.05);
	lightGreen.position.set(1, 0, 0);
	lightGreen.target.position.set(0, 0, 0);

	return [lightCeiling, lightRed, lightGreen, ambientLight];

}

/**
 * Creates the cornell box environment.
 *
 * @param {CubeTexture} envMap - An environment map.
 * @return {Group} The cornell box environment.
 */

export function createEnvironment(envMap = null) {

	const planeGeometry = new PlaneBufferGeometry();
	const planeMaterial = new MeshStandardMaterial({
		color: 0xFFFFFF,
		envMap
	});

	const plane00 = new Mesh(planeGeometry, planeMaterial);
	const plane01 = new Mesh(planeGeometry, planeMaterial);
	const plane02 = new Mesh(planeGeometry, planeMaterial);
	const plane03 = new Mesh(planeGeometry, planeMaterial);
	const plane04 = new Mesh(planeGeometry, planeMaterial);

	plane00.position.y = -1;
	plane00.rotation.x = Math.PI * 0.5;
	plane00.scale.set(2, 2, 1);

	plane01.position.y = -1;
	plane01.rotation.x = Math.PI * -0.5;
	plane01.scale.set(2, 2, 1);
	plane01.receiveShadow = true;

	plane02.position.y = 1;
	plane02.rotation.x = Math.PI * 0.5;
	plane02.scale.set(2, 2, 1);
	plane02.receiveShadow = true;

	plane03.position.z = -1;
	plane03.scale.set(2, 2, 1);
	plane03.receiveShadow = true;

	plane04.position.z = 1;
	plane04.rotation.y = Math.PI;
	plane04.scale.set(2, 2, 1);
	plane04.receiveShadow = true;

	const plane05 = new Mesh(
		planeGeometry,
		new MeshStandardMaterial({
			color: 0xFF0000,
			envMap
		})
	);

	const plane06 = new Mesh(
		planeGeometry,
		new MeshStandardMaterial({
			color: 0x00FF00,
			envMap
		})
	);

	const plane07 = new Mesh(
		planeGeometry,
		new MeshStandardMaterial({
			color: 0xFFFFFF,
			emissive: 0xFFFFFF,
			envMap
		})
	);

	plane05.position.x = -1;
	plane05.rotation.y = Math.PI * 0.5;
	plane05.scale.set(2, 2, 1);
	plane05.receiveShadow = true;

	plane06.position.x = 1;
	plane06.rotation.y = Math.PI * -0.5;
	plane06.scale.set(2, 2, 1);
	plane06.receiveShadow = true;

	plane07.position.y = 1 - 1e-4;
	plane07.rotation.x = Math.PI * 0.5;
	plane07.scale.set(0.4, 0.4, 1);

	const environment = new Group();
	environment.add(
		plane00, plane01, plane02, plane03,
		plane04, plane05, plane06, plane07
	);

	return environment;

}

/**
 * Creates the cornell box actors.
 *
 * @param {CubeTexture} envMap - An environment map.
 * @return {Group} The cornell box actors.
 */

export function createActors(envMap = null) {

	const actorMaterial = new MeshStandardMaterial({
		color: 0xFFFFFF,
		envMap
	});

	const box01 = new Mesh(new BoxBufferGeometry(1, 1, 1), actorMaterial);
	const box02 = new Mesh(new BoxBufferGeometry(1, 1, 1), actorMaterial);
	const sphere01 = new Mesh(new SphereBufferGeometry(1, 32, 32), actorMaterial);

	box01.position.set(-0.35, -0.4, -0.3);
	box01.rotation.y = Math.PI * 0.1;
	box01.scale.set(0.6, 1.2, 0.6);
	box01.castShadow = true;

	box02.position.set(0.35, -0.7, 0.3);
	box02.rotation.y = Math.PI * -0.1;
	box02.scale.set(0.6, 0.6, 0.6);
	box02.castShadow = true;

	sphere01.position.set(-0.5, -0.7, 0.6);
	sphere01.scale.set(0.3, 0.3, 0.3);
	sphere01.castShadow = true;

	const actors = new Group();
	actors.add(box01, box02, sphere01);

	return actors;

}
