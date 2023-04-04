module.exports = function override(config, env) {
  console.log("React app rewired works!");
  config.resolve.fallback = {
    fs: false,
    path: false,
    os: require.resolve("os-browserify/browser"),
  };
  return config;
};
