import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/index.mjs',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationDir: './dist/typings'
          }
        }
      }),
      postcss({
        extensions: ['.css'],
        extract: false
      }),
      json(),
      resolve({
        extensions: ['.js', '.ts', '.tsx']
      }),
      commonjs()
    ],
    external: ['survey-core', 'survey-creator-core', 'dynamic-form-shared']
  },
  // CJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      }),
      postcss({
        extensions: ['.css'],
        extract: false
      }),
      json(),
      resolve({
        extensions: ['.js', '.ts', '.tsx']
      }),
      commonjs()
    ],
    external: ['survey-core', 'survey-creator-core', 'dynamic-form-shared']
  }
];