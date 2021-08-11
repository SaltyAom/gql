require('esbuild')
	.build({
		entryPoints: ['./src/index.ts'],
		outdir: './build',
		format: 'cjs',
		bundle: true,
		minify: true,
		sourcemap: 'external',
		keepNames: true,
		external: ['isomorphic-unfetch'],
		target: ['es2019']
	})
	.catch(() => process.exit(1))
