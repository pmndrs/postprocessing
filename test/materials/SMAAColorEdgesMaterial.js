"use strict";

const SMAAColorEdgesMaterial = require("../../build/postprocessing").SMAAColorEdgesMaterial;

module.exports = {

	"SMAAColorEdges": {

		"can be created": function(test) {

			const material = new SMAAColorEdgesMaterial();
			test.ok(material);
			test.done();

		}

	}

};
