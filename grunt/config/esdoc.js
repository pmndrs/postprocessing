module.exports = {

	compile: {
		options: {
			coverageThreshold: 97.0,
			source: "src",
			destination: "public/docs",
			plugins: [{
				name: "esdoc-standard-plugin"
			}]
		}
	}

};
