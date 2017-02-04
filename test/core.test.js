"use strict";

const lib = require("../build/postprocessing.js");

module.exports = {

	"Effect Composer": {

		"can be instantiated and disposed": function(test) {

			let composer = new lib.EffectComposer();
			test.ok(composer, "effect composer");
			composer.dispose();

			test.done();

		}

	}

};
