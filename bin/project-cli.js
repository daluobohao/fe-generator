#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const chalk = require('chalk')

const pkg = require('../package.json');

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
.option('    --no-lint', 'no .eslintrc')
.action((name, cmd) => {
  const options = cleanArgs(cmd)
  // --no-git makes commander to default git to true
  if (process.argv.includes('-g') || process.argv.includes('--git')) {
    options.forceGit = true
  }
  require('./create')(name, options)
})

program
.arguments('<command>')
.action((cmd) => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
});

program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`telecom-fe-generator <command> --help`)} for detailed usage of given command.`)
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

function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = o.long.replace(/^--/, '')
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}

