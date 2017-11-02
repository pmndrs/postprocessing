"use strict";

const AdaptiveLuminosityMaterial = require("../../build/postprocessing").AdaptiveLuminosityMaterial;

module.exports = {

	"Adaptive Luminosity": {

		"can be created": function(test) {

			const material = new AdaptiveLuminosityMaterial();
			test.ok(material);
			test.done();

		}

	}

};
