require('esbuild')
	.build({
		entryPoints: ['./src/index.ts'],
		outdir: './build/esm',
		format: 'esm',
		bundle: true,
		minify: false,
		sourcemap: 'external',
		keepNames: true,
		external: ['isomorphic-unfetch'],
		target: ['es2019']
	})
	.catch(() => process.exit(1))
