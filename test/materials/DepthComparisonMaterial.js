"use strict";

const DepthComparisonMaterial = require("../../build/postprocessing").DepthComparisonMaterial;

module.exports = {

	"Depth Comparison": {

		"can be created": function(test) {

			const material = new DepthComparisonMaterial();
			test.ok(material);
			test.done();

		}

	}

};
