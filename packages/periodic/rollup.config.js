import buble from 'rollup-plugin-buble'

export default {
  entry: 'lib/index.js',
  dest: 'dist/tempest-periodic.js',
  format: 'umd',
  moduleName: 'tempestPeriodic',
  sourceMap: true,
  globals: {
    '@tempest/core': 'tempestCore'
  },
  plugins: [
    buble()
  ]
}