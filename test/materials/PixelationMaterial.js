"use strict";

const PixelationMaterial = require("../../build/postprocessing").PixelationMaterial;

module.exports = {

	"Pixelation": {

		"can be created": function(test) {

			const material = new PixelationMaterial();
			test.ok(material);
			test.done();

		}

	}

};
