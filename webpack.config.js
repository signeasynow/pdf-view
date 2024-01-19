const path = require('path');
const webpack = require('webpack');

const envPath = path.join(__dirname, `.env.${process.env.NODE_ENV}`);
require('dotenv').config({ path: envPath });

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: './loader.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	experiments: {
		asyncWebAssembly: true,  // Enable async WebAssembly
		syncWebAssembly: true     // Enable sync WebAssembly
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: 'file-loader'
					}
				]
			},
			{
				test: /\.(js)$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},
			{
				test: /\.svg$/,
				use: ['file-loader']
			}
		]
	},
	resolve: {
    alias: {
			react: 'preact/compat',
			'react-dom/test-utils': 'preact/test-utils',
			'react-dom': 'preact/compat'
    },
    extensions: ['.js']
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_CHROME': JSON.stringify(process.env.NODE_CHROME)
		}),
		new HtmlWebpackPlugin({
			template: 'index.html'
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'lib/pdf.worker.js', to: 'lib/pdf.worker.js' },
				{ from: 'lib/pdf_wasm_project.js', to: 'lib/pdf_wasm_project.js' },
				{ from: 'lib/pdf_wasm_project_bg.wasm', to: 'lib/pdf_wasm_project_bg.wasm' }
			]
		})
	],
	devServer: {
		static: {
			directory: path.join(__dirname, 'dist')
		},
		compress: true,
		port: 8080
	},
	devtool: 'source-map'
};