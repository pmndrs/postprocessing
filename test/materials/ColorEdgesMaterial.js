"use strict";

const ColorEdgesMaterial = require("../../build/postprocessing").ColorEdgesMaterial;

module.exports = {

	"ColorEdges": {

		"can be created": function(test) {

			const material = new ColorEdgesMaterial();
			test.ok(material);
			test.done();

		}

	}

};
