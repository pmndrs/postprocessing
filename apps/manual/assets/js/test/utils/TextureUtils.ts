import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BoxGeometry, Mesh, MeshStandardMaterial, Object3D, Texture, WebGLRenderTarget } from "three";
import { setAnisotropy } from "../../src/utils/TextureUtils.ts";

describe("TextureUtils", () => {

	it("sets anisotropy on textures in nested meshes", () => {

		const texture = new Texture();
		const material = new MeshStandardMaterial({ map: texture });
		const mesh = new Mesh(new BoxGeometry(), material);
		const root = new Object3D();
		root.add(mesh);

		setAnisotropy(root, 8);

		assert.equal(texture.anisotropy, 8);

	});

	it("does not modify render-target textures", () => {

		const renderTarget = new WebGLRenderTarget(1, 1);
		const material = new MeshStandardMaterial({ map: renderTarget.texture });
		const mesh = new Mesh(new BoxGeometry(), material);

		setAnisotropy(mesh, 8);

		assert.equal(renderTarget.texture.anisotropy, 1);

	});

});
