import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RenderTargetDescriptor } from "postprocessing";
import { DepthTexture, LinearFilter, NearestFilter, UnsignedIntType } from "three";

describe("RenderTargetDescriptor", () => {

	it("equals itself", () => {

		const descriptor = new RenderTargetDescriptor();
		assert.ok(descriptor.equals(descriptor));

	});

	it("equals a descriptor with the same options", () => {

		const options = { samples: 4, minFilter: LinearFilter };
		const descriptor1 = new RenderTargetDescriptor(options);
		const descriptor2 = new RenderTargetDescriptor(options);

		assert.ok(descriptor1.equals(descriptor2));

	});

	it("rejects descriptors with different samples", () => {

		const descriptor1 = new RenderTargetDescriptor({ samples: 4 });
		const descriptor2 = new RenderTargetDescriptor({ samples: 1 });

		assert.equal(descriptor1.equals(descriptor2), false);

	});

	it("rejects descriptors with different texture parameters", () => {

		const descriptor1 = new RenderTargetDescriptor({ minFilter: LinearFilter });
		const descriptor2 = new RenderTargetDescriptor({ minFilter: NearestFilter });

		assert.equal(descriptor1.equals(descriptor2), false);

	});

	it("rejects descriptors with different texture attachments", () => {

		const descriptor1 = new RenderTargetDescriptor({
			textures: [
				{ name: "Color" },
				{ name: "Normal" }
			]
		});

		const descriptor2 = new RenderTargetDescriptor({
			textures: [
				{ name: "Color" },
				{ name: "Normal" }
			]
		});

		const descriptor3 = new RenderTargetDescriptor({
			textures: [
				{ name: "Normal" },
				{ name: "Color" }
			]
		});

		const descriptor4 = new RenderTargetDescriptor({
			textures: [
				{ name: "Test" },
				{ name: "Normal" }
			]
		});

		assert.equal(descriptor1.equals(descriptor2), true);
		assert.equal(descriptor1.equals(descriptor3), false);
		assert.equal(descriptor1.equals(descriptor4), false);

	});

	it("compares depth textures strictly by identity", () => {

		const depthTexture1 = new DepthTexture(1, 1, UnsignedIntType);
		const depthTexture2 = new DepthTexture(1, 1, UnsignedIntType);

		const descriptor1 = new RenderTargetDescriptor({ depthTexture: depthTexture1 });
		const descriptor2 = new RenderTargetDescriptor({ depthTexture: depthTexture1 });
		const descriptor3 = new RenderTargetDescriptor({ depthTexture: depthTexture2 });
		const descriptor4 = new RenderTargetDescriptor();

		assert.equal(descriptor1.equals(descriptor2), true);
		assert.equal(descriptor1.equals(descriptor3), false);
		assert.equal(descriptor1.equals(descriptor4), false);

	});

});
