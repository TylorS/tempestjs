import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'lib/index.js',
  dest: 'dist/tempest-core.js',
  format: 'umd',
  moduleName: 'tempestCore',
  sourceMap: true,
  plugins: [
    buble(),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    })
  ]
}