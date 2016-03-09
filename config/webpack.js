import webpack from 'webpack';
import HtmlPlugin from 'html-webpack-plugin';
import ExtractPlugin from 'extract-text-webpack-plugin';

const CWD = process.cwd();
const SRC = CWD + '/src';
const DIST = CWD + '/dist';
const TEST = CWD + '/test';
const PAGES = SRC + '/pages';
const PUBLIC = '/';

export default function ({dev, hot, test, port}) {

	const DEVTOOL = dev || test ? 'inline-source-map' : 'source-map';
	const JS_NAME = dev ? '[name].js' : '[name]-[chunkhash].js';
	const CSS_NAME = dev ? '[name].css' : '[name]-[contenthash].css';
	const TPL_NAME = 'tpl/[dir]/[dir]';
	const ASSET_NAME = '[name]-[hash].[ext]';
	const ASSET_CACHE = 1024 * 10; // 10KB

	const cfg = {
		watch: dev,
		cache: dev,
		debug: dev,
		devtool: DEVTOOL,
		entry: {
			vendor: ['./src/vendor/vendor'],
			app: ['./src/app/app']
		},
		output: {
			path: DIST,
			filename: JS_NAME,
			publicPath: PUBLIC
		},
		resolve: {
			extensions: ['', '.js', '.json'],
			modules: [
				'node_modules',
				SRC,
				SRC + '/modules'
			],
			alias: {
				assets: SRC + '/assets'
			}
		},
		module: {
			loaders: [{
				test: /\.js$/,
				include: [SRC, TEST],
				loader: 'ng-annotate!babel!eslint!jscs'
			}, {
				test: /\.css$/,
				include: SRC,
				loader: ExtractPlugin.extract('css?sourceMap')
			}, {
				test: /\.styl$/,
				include: SRC,
				loader: ExtractPlugin.extract('css?sourceMap!stylus!stylint')
			}, {
				test: /\.html$/,
				include: SRC,
				loader: 'html'
			}, {
				test: /\.jade$/,
				include: PAGES,
				loader: 'jade?pretty=true'
			}, {
				test: /\.jade$/,
				include: SRC,
				exclude: PAGES,
				loader: `ng-cache?prefix=${TPL_NAME}!jade-html`
			}, {
				test: /\.(svg|png|jpg|gif|eot|ttf|woff|woff2)$/,
				loader: `url-loader?limit=${ASSET_CACHE}&name=${ASSET_NAME}`
			}]
		},
		plugins: [
			new ExtractPlugin(CSS_NAME)
		]
	};

	if (hot) {
		const entry = `webpack-dev-server/client`;
		const query = `http://localhost:${port}/`;
		cfg.entry.app.unshift(`${entry}?${query}`);
		cfg.devServer = {
			port,
			hot: true,
			stats: {
				colors: true
			}
		};
	}

	if (test) {
		cfg.watch = false;
		cfg.cache = false;
		cfg.debug = false;
	}

	if (!test) {
		cfg.plugins.push(
			new HtmlPlugin({
				filename: 'index.html',
				template: 'src/pages/index.jade'
			})
		);

	}

	if (!dev && !test) {
		cfg.plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false
				}
			})
		);
	}

	return cfg;

}
