"use strict";

const BokehMaterial = require("../../build/postprocessing").BokehMaterial;

module.exports = {

	"Bokeh": {

		"can be created": function(test) {

			const material = new BokehMaterial();
			test.ok(material);
			test.done();

		}

	}

};
