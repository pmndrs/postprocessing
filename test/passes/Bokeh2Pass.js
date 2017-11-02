"use strict";

const Bokeh2Pass = require("../../build/postprocessing").Bokeh2Pass;

module.exports = {

	"Bokeh 2": {

		"can be created and destroyed": function(test) {

			const pass = new Bokeh2Pass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
