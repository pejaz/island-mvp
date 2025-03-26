const { add } = require("./util.mjs");

async function foo() {
  console.log(add(1, 2));
}

foo();

/**
 * node 低版本引入mjs会报错，此时可以通过const { add } = await import('./util.mjs') 进行引入
 * 但是需要注意的是，await import() 只能在 async 函数中使用
 * 另外，如果通过 tsc 编译，tsc 会将 import() 转换为 require()，所以需要在 tsconfig.json 中添加 "module": "esnext" 或 "module": "es2020" 来保持 import() 的语法，
 * 或者通过下面形式绕过tsc编译 import()：
 *  const dynamicImport = new Function('m', 'return import(m)');
 *  const { add } = await dynamicImport('./util.mjs');
 * 或者可以通过如 rullup、tsup、unbuild等专业构建工具去替换 tsc 编译解决
 */