const basePkg = require('../templates/packageConfig/package.base.json');
const optionalPkg = require('../templates/packageConfig/package.optional.json');
const clearConsole = require('./logger');
const path = require('path');
const chalk = require('chalk')
const validateProjectName = require('validate-npm-package-name')
const fs = require('fs-extra');
const inquirer = require('inquirer');
const program = require('commander');
const readline = require('readline');
const mkdirp = require('mkdirp');
const sortedObject = require('sorted-object');
const ejs = require('ejs');


const MODE_0666 = 0o0666;
const MODE_0755 = 0o0755;

async function create(projectName, options) {

  // 当前所在路径
  const cwd = options.cwd || process.cwd();
  // 是否要创建在当前文件夹中
  const inCurrent = projectName === '.'
  // 项目名称
  const name = inCurrent ? path.relative('../', cwd) : projectName
  // 项目目录
  const targetDir = path.resolve(cwd, projectName || '.')

  // 验证项目名
  const result = validateProjectName(name);
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`))
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red(err))
    })
    exit(1)
  }
  if (fs.existsSync(targetDir)) {
    clearConsole();
    if (inCurrent) {
      const { ok } = await inquirer.prompt([
        {
          name: 'ok',
          type: 'confirm',
          message: `Generate project in current directory?`
        }
      ])
      if (!ok) {
        return
      }
    } else {
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Merge', value: 'merge' },
            { name: 'Cancel', value: false }
          ]
        }
      ])
      if (!action) {
        return
      } else if (action === 'overwrite') {
        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
        await fs.remove(targetDir)
      }
    }
    // const creator = new creator(name, targetDir)
    // await creator.create(options);

  }

  // Generate application
  getAbsenceParams(targetDir, (params) => {
    createApplication(name, targetDir, params);
  });
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
    const buildSh = loadTemplate('build.sh');
    buildSh.locals.name = name;
    write(`${filePath}/build.sh`, buildSh.render());
    complete();
  });
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


module.exports = (...args) => {
  return create(...args).catch(err => {
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}