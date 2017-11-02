"use strict";

const Pass = require("../../build/postprocessing").Pass;

module.exports = {

	"Pass": {

		"defines a dispose method": function(test) {

			test.equal(typeof Pass.prototype.dispose, "function");
			test.done();

		}

	}

};
