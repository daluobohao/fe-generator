## Installation

```sh
# switch the registry of npm to http://registry.npm.pt.mi.com
$ npm install -g @mi/telecom-fe-generator
```

## Quick Start


Create the project: 

```bash
# project name is hello-world
$ telecom-fe-generator hello-wrod
```

Install dependencies:

```bash
$ cd hello-word
# the registry of mi is unnecessary
$ npm install
```

Dev

```bash
$ npm run dev
```

Build

```bash
$ npm run build
```

## Command Line Options

This generator can also be further configured with the following command line flags.

    -h, --help                   output usage information
        --version                output the version number
    -c, --css <engine>           add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)
        --no-git                 add .gitignore
        --no-lint                add .eslintrc
    -f, --force                  force on non-empty directory
    -F, --framework <framework>  add framework to project support (react) (defaults to pure js)
    -a, --ajax <ajax>            add ajax client to project support (superagent) (defaults to pure ajax