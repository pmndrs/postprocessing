module.exports = {

	options: {
		coverageThreshold: 97.0,
		plugins: [{
			name: "esdoc-standard-plugin"
		}]
	},

	lib: {
		src: "src",
		dest: "public/docs"
	}

};
