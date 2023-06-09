const path = require("path");
const glob = require("glob");

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            const backgroundFiles = glob.sync("./src/background/*.ts");

            webpackConfig.entry = {
                main: [
                    env === "development" &&
                        require.resolve("react-dev-utils/webpackHotDevClient"),
                    paths.appIndexJs,
                ].filter(Boolean),
            };
            backgroundFiles.forEach((file) => {
                webpackConfig.entry['background/' + path.parse(file).name] = file;
            });

            webpackConfig.output = {
                ...webpackConfig.output,
                filename: "static/js/[name].js",
            };

            webpackConfig.optimization.runtimeChunk = false;

            return webpackConfig;
        },
    },
};
