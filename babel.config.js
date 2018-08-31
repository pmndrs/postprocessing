module.exports = function(api) {

	api.cache.forever();

	return {
		comments: false,
		presets: [
			["@babel/preset-env", {
				"modules": false
			}]
		]
	};

};
