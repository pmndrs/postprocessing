"use strict";

const SMAAWeightsMaterial = require("../../build/postprocessing").SMAAWeightsMaterial;

module.exports = {

	"SMAAWeights": {

		"can be created": function(test) {

			const material = new SMAAWeightsMaterial();
			test.ok(material);
			test.done();

		}

	}

};
