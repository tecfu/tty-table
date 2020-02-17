import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace'

export default [
  {
    input: './adapters/default-adapter.js',
    output: {
      name: 'ttyTable',
      file: 'dist/tty-table.esm.js',
      format: 'esm'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs({
        namedExports: {
          'src/factory': ['Table']
        }
      }),
      replace({
        'process': '{}',
        'process.env': '{}',
        'process.exit': '()'
      }),
    ]
  },
  // solid border is corrupt, using browserify instead
  //{
  //  input: 'dist/tty-table.esm.js',
  //  output: {
  //    name: 'ttyTable',
  //    file: 'dist/tty-table.iife.js',
  //    format: 'iife'
  //  },
  //  plugins: [
  //    resolve({
  //      browser: true,
  //      preferBuiltins: false
  //    })
  //  ]
  //},
  // can't get rollup to add `require`, `exports`, using browserify instead
  //{
  //  input: 'dist/tty-table.esm.js',
  //  output: {
  //    name: 'ttyTable',
  //    file: 'dist/tty-table.cjs.js',
  //    format: 'cjs'
  //  },
  //  plugins: [
  //    resolve({
  //      browser: true,
  //      preferBuiltins: false
  //    })
  //  ]
  //}
]
