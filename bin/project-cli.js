#!/usr/bin/env node

const ejs = require('ejs');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const program = require('commander');
const readline = require('readline');
const sortedObject = require('sorted-object');
const chalk = require('chalk')

const MODE_0666 = 0o0666;
const MODE_0755 = 0o0755;

const pkg = require('../package.json');
const basePkg = require('../templates/packageConfig/package.base.json');
const optionalPkg = require('../templates/packageConfig/package.optional.json');

const version = pkg.version;

/* eslint no-console: 0, no-underscore-dangle: 0, prefer-rest-params: 0 */

//
const enhanceErrorMessages = (methodName, log) => {
  program.Command.prototype[methodName] = function (...args) {
    if (methodName === 'unknownOption' && this._allowUnknownOption) {
      return
    }
    this.outputHelp()
    console.log(`  ` + chalk.red(log(...args)))
    console.log()
    process.exit(1)
  }
}

const oldExit = process.exit;

program
  .version(version, '    --version')
  .usage('<command> [options]')

program
.command('create <app-name>')
.description('创建一个新项目')
.option('-p, --preview <host>', 'preview host')
.option('-o, --online <host>', 'online host')
.option('-F, --framework <framework>', 'add framework to project support (react) (defaults to pure js)')
.option('-c, --css <engine>', 'add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)')
.option('-f, --force', 'force on non-empty directory')
.option('    --no-git', 'no .gitignore')
.option('    --no-lint', 'no .eslintrc');

program
.arguments('<command>')
.action((cmd) => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
});

program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`vue <command> --help`)} for detailed usage of given command.`)
  console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))


enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
    flag ? `, got ${chalk.yellow(flag)}` : ``
  )
})
enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})
enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm(msg, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(msg, (input) => {
    rl.close();
    callback(/^y|yes|ok|true$/i.test(input));
  });
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write(filePath, str, mode) {
  fs.writeFileSync(filePath, str, { mode: mode || MODE_0666 });
  console.log(`   ${chalk.cyan('create')}${chalk.cyan(path)}`);
}

/**
 * Copy file from template directory.
 */

function copyTemplate(from, to) {
  const sourceFile = path.join(__dirname, '..', 'templates', from);
  write(to, fs.readFileSync(sourceFile, 'utf-8'));
}

/**
 * Determine if launched from cmd.exe
 */

function launchedFromCmd() {
  return process.platform === 'win32' &&
    process.env._ === undefined;
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(filePath, fn) {
  mkdirp(filePath, MODE_0755, (err) => {
    if (err) throw err;
    console.log(`   ${chalk.cyan('create')}${chalk.cyan(filePath)}`);
    if (typeof fn === 'function') {
      fn();
    }
  });
}

/**
 * babel presets map
 */

const presetMap = {
  react: ['react'],
};

/**
 * Load template file.
 */

function loadTemplate(name) {
  const contents = fs.readFileSync(path.join(__dirname, '..', 'templates', (`${name}.ejs`)), 'utf-8');
  const locals = Object.create(null);

  function render() {
    return ejs.render(contents, locals);
  }

  return {
    locals,
    render,
  };
}

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

function createApplication(name, filePath, params) {
  let wait = 16;

  console.log();
  function complete() {
    wait -= 1;
    if (wait) {
      return;
    }
    const prompt = launchedFromCmd() ? '>' : '$';
    console.log();
    console.log('   install dependencies:');
    console.log('     %s cd %s && npm install', prompt, filePath);
    console.log();
    console.log('   run the project:');
    console.log('     %s npm run dev', prompt);
    console.log();
    console.log('   build the project:');
    console.log('     %s npm run build', prompt);
    console.log();
  }
  mkdir(filePath, () => {
    mkdir(`${filePath}/server`, () => {
      copyTemplate('server/api-router.js', `${filePath}/server/api-router.js`);
      copyTemplate('server/api-server.js', `${filePath}/server/api-server.js`);
      copyTemplate('server/proxy-server.js', `${filePath}/server/proxy-server.js`);
      copyTemplate('server/static-server.js', `${filePath}/server/static-server.js`);
      copyTemplate('server/.rnd', `${filePath}/server/.rnd`);
      copyTemplate('server/cert.pem', `${filePath}/server/cert.pem`);
      copyTemplate('server/key.pem', `${filePath}/server/key.pem`);
      complete();
    });

    mkdir(`${filePath}/src`, () => {
      mkdir(`${filePath}/src/css`, () => {
        copyTemplate('src/css/index.css', `${filePath}/src/css/index.css`);
        complete();
      });

      mkdir(`${filePath}/src/img`, () => {
        copyTemplate('src/img/test.png', `${filePath}/src/img/test.png`);
        complete();
      });

      mkdir(`${filePath}/src/js`, () => {
        mkdir(`${filePath}/src/js/component`);
        mkdir(`${filePath}/src/js/container`);
        mkdir(`${filePath}/src/js/utils`);
        mkdir(`${filePath}/src/js/api`, () => {
          copyTemplate('src/js/api/api.js', `${filePath}/src/js/api/api.js`);
          complete();
        });
        mkdir(`${filePath}/src/js/page`, () => {
          copyTemplate('src/js/page/index.js', `${filePath}/src/js/page/index.js`);
          complete();
        });
        complete();
      });

      mkdir(`${filePath}/src/views`, () => {
        copyTemplate('src/views/index.html', `${filePath}/src/views/index.html`);
        complete();
      });
      complete();
    });
    copyTemplate('project.config.js', `${filePath}/project.config.js`);
    copyTemplate('postcss.config.js', `${filePath}/postcss.config.js`);
    copyTemplate('.browserslistrc', `${filePath}/.browserslistrc`);
    copyTemplate('polyfill.js', `${filePath}/polyfill.js`);
    copyTemplate('webpack.config.common.js', `${filePath}/webpack.config.common.js`);
    copyTemplate('webpack.config.dev.js', `${filePath}/webpack.config.dev.js`);
    copyTemplate('webpack.config.js', `${filePath}/webpack.config.js`);
    const babelrc = loadTemplate('rcConfig/babelrc');
    // add framework dependecy and babelrc
    if (program.framework || params.framework) {
      const framework = program.framework || params.framework;
      const option = optionalPkg[framework] || { dependencies: {}, devDependencies: {} };
      Object.keys(option.dependencies).forEach((key) => {
        basePkg.dependencies[key] = option.dependencies[key];
      });
      Object.keys(option.devDependencies).forEach((key) => {
        basePkg.devDependencies[key] = option.devDependencies[key];
      });
      babelrc.locals.babelPresets = [];
      if (presetMap[framework]) {
        babelrc.locals.babelPresets = babelrc.locals.babelPresets.concat(presetMap[framework]);
      }
      write(`${filePath}/.babelrc`, babelrc.render());
    }
    basePkg.host = {
      preview: program.preview || params.preview || '',
      online: program.online || params.online || '',
    };
    if (program.git) {
      copyTemplate('gitignore', `${filePath}/.gitignore`);
      copyTemplate('README', `${filePath}/README.md`);
    }
    if (program.lint) {
      const option = optionalPkg.lint;
      Object.keys(option).forEach((key) => {
        basePkg.devDependencies[key] = option[key];
      });
      copyTemplate('.eslintrc', `${filePath}/.eslintrc`);
    }
    basePkg.name = name;
    basePkg.dependencies = sortedObject(basePkg.dependencies);
    basePkg.devDependencies = sortedObject(basePkg.devDependencies);
    write(`${filePath}/package.json`, `${JSON.stringify(basePkg, null, 2)}\n`);

    // copy dir and file for xbox
    mkdir(`${filePath}/deploy`, () => {
      mkdir(`${filePath}/deploy/manifests`, () => {
        copyTemplate('deploy/manifests/config.pp.template', `${filePath}/deploy/manifests/config.pp.template`);
        complete();
      });
      copyTemplate('deploy/find_cluster.py', `${filePath}/deploy/find_cluster.py`);
      complete();
    });
    const buildSh = loadTemplate('build.sh');
    buildSh.locals.name = name;
    write(`${filePath}/build.sh`, buildSh.render());
    complete();
  });
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName(pathName) {
  return path.basename(pathName)
    .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase();
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory(filePath, fn) {
  fs.readdir(filePath, (err, files) => {
    if (err && err.code !== 'ENOENT') throw err;
    fn(!files || !files.length);
  });
}

/**
 * Check param
 * @return {Object} tips
 */
const checkParams = (destinationPath) => {
  const allTips = {
    path: '输入项目名称（支持路径，默认当目录）[hello-world] \n name of project (path supproted) [hello-world] ',
    preview: '预上线环境的域名（不包括协议http或https）\npreview host(no protocol) [default: ""] ',
    online: '线上环境的域名（不包括协议http或https）\nonline host(no protocol) [default: ""]',
    framework: '项目使用框架（目前支持react）\nframework（react supported） [default: pure js] ',
    css: 'css预处理器（目前暂无支持）\ncss engine [default: pure css] ',
  };
  const tips = {};
  const params = {};
  Object.keys(allTips).forEach((key) => {
    params[key] = program[key];
  });
  params.path = destinationPath;
  Object.keys(allTips).forEach((key) => {
    if (!params[key]) {
      tips[key] = allTips[key];
    }
  });
  return tips;
};

/**
 * get input from STDOUT/STDIN
 */

function getAbsenceParams(destinationPath, callback) {
  const tips = checkParams(destinationPath);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const keys = Object.keys(tips);
  const params = {};
  const getInput = (name, value) => {
    if (value && value.length > 0) {
      params[name] = value;
    }
    if (keys.length === 0) {
      rl.close();
      callback(params);
      return;
    }
    const key = keys.shift();
    rl.question(tips[key], (input) => {
      getInput(key, input);
    });
  };
  if (keys.length === 0) {
    callback(params);
    return;
  }
  const key = keys.shift();
  rl.question(tips[key], (input) => {
    getInput(key, input);
  });
}

/**
 * Main program.
 */

function main() {
  // Path
  const destinationPath = program.args.shift();
  console.log('destination', destinationPath)
  console.log("destinationPath: ", destinationPath);

  // App name
  // const appName = createAppName(path.resolve(destinationPath));

  // Generate application
  getAbsenceParams(destinationPath, (params) => {
    const realPath = destinationPath || params.path || './hello-world';
    const appName = createAppName(path.resolve(realPath));
    emptyDirectory(realPath, (empty) => {
      if (empty || program.force) {
        process.stdin.destroy();
        createApplication(appName, realPath, params);
      } else {
        confirm('目标目录不为空，命令将会覆盖并合并原有内容，是否继续？\ndestination is not empty, cli will rewrite and merge destination, continue? [y/N] ', (ok) => {
          if (ok) {
            process.stdin.destroy();
            createApplication(appName, realPath, params);
          } else {
            console.error('aborting');
            process.exit(1);
          }
        });
      }
    });
  });
}

if (!process.exit.exited) {
  main();
}

