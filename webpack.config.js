const TerserPlugin = require('terser-webpack-plugin'),
	path = require('path'),
	CopyPlugin = require('copy-webpack-plugin'),
	{ CleanWebpackPlugin } = require('clean-webpack-plugin'),
	OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (env, argv) => {
	const config = {
		mode: 'development',
		entry: {
			index: './src/index.ts',
			background: './src/background.ts'
		},
		optimization: {
			minimize: true,
			minimizer: [
				new TerserPlugin(),
				new OptimizeCSSAssetsPlugin()
			]
		},
		output: {
			path: path.resolve(__dirname + '/dist'),
			filename: '[name].js'
		},
		resolve:{
			extensions: [".ts", ".js"]
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: "ts-loader"
				},{
					test: /\.styl$/,
					use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader']
				}
			]
		},
		plugins: [
			new CleanWebpackPlugin({
				cleanStaleWebpackAssets: false
			}),
			new CopyPlugin([
				{from: 'manifest.json', to: 'manifest.json'},
				{from: 'src/assets', to: 'assets'},
			]),
			new MiniCssExtractPlugin({
				filename: 'index.css'
			}),
		]
	}

	// mode
	if (argv.mode === 'production') {
		config.mode = 'production'
	}

	return config
}
