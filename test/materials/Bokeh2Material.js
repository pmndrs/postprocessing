"use strict";

const Bokeh2Material = require("../../build/postprocessing").Bokeh2Material;

module.exports = {

	"Bokeh 2": {

		"can be created": function(test) {

			const material = new Bokeh2Material();
			test.ok(material);
			test.done();

		}

	}

};
