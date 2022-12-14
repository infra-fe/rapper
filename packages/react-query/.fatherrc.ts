import { defineConfig } from 'father';
import path from 'path';
export default defineConfig({
  extends: path.resolve(__dirname, '../../.fatherrc.ts'),
  esm: {
    input: 'src',
    output: 'es',
  },
  cjs: {
    input: 'src',
    output: 'lib',
  },
});
