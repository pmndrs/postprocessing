"use strict";

const lib = require("../build/postprocessing.js");

module.exports = {

	"Effect Composer": {

		"can be instantiated and disposed": function(test) {

			const composer = new lib.EffectComposer();
			test.ok(composer);
			composer.dispose();

			test.done();

		}

	}

};
