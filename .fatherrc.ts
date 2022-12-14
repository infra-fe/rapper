// import { readdirSync } from 'fs';
// import { join } from 'path';
// const type = process.env.BUILD_TYPE;
// let config;
// const pkgs = ['core', 'generation', 'infra-rapper', 'request'];
// const tailPkgs = readdirSync(join(__dirname, 'packages')).filter(
//   (pkg) => pkg.charAt(0) !== '.' && !pkgs.includes(pkg) && pkg !== 'vue-query' && pkg !== 'vue-swr',
// );
// if (type === 'lib') {
//   config = {
//     cjs: { type: 'babel' },
//     esm: false,
//     pkgs: [...pkgs, ...tailPkgs],
//   };
// }
// if (type === 'es') {
//   config = {
//     cjs: false,
//     esm: 'babel',
//     pkgs: [...pkgs, ...tailPkgs],
//   };
// }

// export default config;

import { defineConfig } from 'father';

export default defineConfig({});
