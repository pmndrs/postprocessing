"use strict";

const EffectComposer = require("../../build/postprocessing.js").EffectComposer;

module.exports = {

	"Effect Composer": {

		"can be instantiated and disposed": function(test) {

			const composer = new EffectComposer();
			test.ok(composer);
			composer.dispose();

			test.done();

		}

	}

};
