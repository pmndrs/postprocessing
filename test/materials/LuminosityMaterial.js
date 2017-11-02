"use strict";

const LuminosityMaterial = require("../../build/postprocessing").LuminosityMaterial;

module.exports = {

	"Luminosity": {

		"can be created": function(test) {

			const material = new LuminosityMaterial();
			test.ok(material);
			test.done();

		}

	}

};
