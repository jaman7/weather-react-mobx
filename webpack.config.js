const path = require('path');
const Dotenv = require('dotenv-webpack');

const outputDir = path.resolve(__dirname, './src/js/');
const srcPath = path.join(__dirname, './src/jsx/');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

const libraryName = pkg.name;

module.exports = {
	mode: 'development',
	// mode: 'production',
	entry: path.resolve(__dirname, './src/jsx/index.jsx'),
	devtool: false,
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000
	},
	output: {
		path: outputDir,
		filename: `${libraryName}.js`,
		library: libraryName,
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	plugins: [new Dotenv()],
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				enforce: 'pre',
				use: [
					{
						options: {
							// formatter: require('eslint/lib/cli-engine/formatters/stylish'),
							presets: ['@babel/preset-env'],
							eslintPath: require.resolve('eslint')
						},
						loader: require.resolve('eslint-loader')
					}
				],
				include: srcPath
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				// use: ['babel-loader']
				use: ['babel-loader', 'prettier-loader']
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
				loader: require.resolve('url-loader'),
				options: {
					limit: 10000,
					name: 'img/[name].[hash:8].[ext]'
				}
			}
		]
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					output: {
						comments: false
					}
				},
				extractComments: false
			})
		]
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: { mobx: `${__dirname}/node_modules/mobx/dist/mobx.esm.js` }
	}
};
