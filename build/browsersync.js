export default function ({dev, port}) {

	const baseDir = 'dist';

	let cfg = {
		server: {baseDir},
		files: dev ? `${baseDir}/**/*.*` : null,
		port: port,
		open: false,
		notify: false
	};

	return cfg;

}