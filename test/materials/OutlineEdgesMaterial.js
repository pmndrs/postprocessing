"use strict";

const OutlineEdgesMaterial = require("../../build/postprocessing").OutlineEdgesMaterial;

module.exports = {

	"Outline Edges": {

		"can be created": function(test) {

			const material = new OutlineEdgesMaterial();
			test.ok(material);
			test.done();

		}

	}

};
