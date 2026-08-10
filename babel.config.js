module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        // Убирает import.meta из веб-бандла (приезжает из zustand devtools).
        // См. комментарий в самом плагине.
        "./plugins/babelTransformImportMeta.js",
      ],
    };
  };