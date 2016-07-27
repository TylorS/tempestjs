// node requires
const { join } = require('path')
const fs = require('fs')
const { chdir } = require('process')
const { exec } = require('child_process')

// package requires
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const EJS = require('ejs')

// constants
const TEMPEST_DIR=process.cwd()
const PACKAGE_DIR=join(TEMPEST_DIR, 'packages')
const PACKAGES=getDirectories(PACKAGE_DIR)
const PACKAGE_TO_CREATE = process.argv[2] || console.log('did not provide package name') || process.exit()

// templates
const TEMPLATE_DIR=join(TEMPEST_DIR, '_scripts/template')
const PACKAGEJSON_TEMPLATE = join(TEMPLATE_DIR, 'package.ejs.json')
const ROLLUP_TEMPLATE = join(TEMPLATE_DIR, 'rollup.config.ejs.js')
const TSCONFIG_TEMPLATE = join(TEMPLATE_DIR, 'tsconfig.json')
const TYPINGS_TEMPLATE = join(TEMPLATE_DIR, 'typings.ejs.json')
const SRC_INDEX_TEMPLATE = join(TEMPLATE_DIR, 'src-index.ejs.ts')
const TEST_INDEX_TEMPLATE = join(TEMPLATE_DIR, 'test-index.ejs.ts')

if (isDirectoryIn(PACKAGE_DIR)(PACKAGE_TO_CREATE)) {
  console.log("package already exists")
} else {
  console.log('creating package ' + PACKAGE_TO_CREATE + '...')
  const PACKAGE_TO_CREATE_DIR = join(PACKAGE_DIR, PACKAGE_TO_CREATE)

  function writeFile (filename, content) {
    fs.writeFile(join(PACKAGE_TO_CREATE_DIR, filename), content, (err) => {
      if (err) throw err
    })
  }

  mkdirp(PACKAGE_TO_CREATE_DIR, (err) => {
    if (err) throw err

    const data = { name: PACKAGE_TO_CREATE, capitalName: capitalize(PACKAGE_TO_CREATE) }

    const PACKAGE_JSON_CONTENTS = renderEJS(PACKAGEJSON_TEMPLATE, data)
    const ROLLUP_CONTENTS = renderEJS(ROLLUP_TEMPLATE, data)
    const TYPINGS_CONTENT = renderEJS(TYPINGS_TEMPLATE, data)
    const SRC_INDEX_CONTENT = renderEJS(SRC_INDEX_TEMPLATE, data)
    const TEST_INDEX_CONTENT = renderEJS(TEST_INDEX_TEMPLATE, data)

    writeFile('package.json', PACKAGE_JSON_CONTENTS)
    writeFile('rollup.config.js', ROLLUP_CONTENTS)
    writeFile('typings.json', TYPINGS_CONTENT)

    fs.readFile(TSCONFIG_TEMPLATE, { encoding: 'utf-8' }, (err, data) => {
      if (err) throw err

      fs.writeFile(join(PACKAGE_TO_CREATE_DIR, 'tsconfig.json'), data, (err) => {
        if (err) throw err
      })
    })

    mkdirp(join(PACKAGE_TO_CREATE_DIR, 'src'), (err) => {
      if (err) throw err
      writeFile('src/index.ts', SRC_INDEX_CONTENT)
    })

    mkdirp(join(PACKAGE_TO_CREATE_DIR, 'test'), (err) => {
      if (err) throw err

      writeFile('test/index.ts', TEST_INDEX_CONTENT)
    })

    setTimeout(() => {
      exec('npm install', {cwd: PACKAGE_TO_CREATE_DIR}, (err, stdout, stderr) => {
        if (err) throw err
        console.log(stdout)

        exec('typings install', {cwd: PACKAGE_TO_CREATE_DIR}, (err, stdout, stderr) => {
          if (err) throw err
          console.log(stdout)
        })

        exec('npm run scripts:symlink', {cwd: TEMPEST_DIR}, (err, stdout, stderr) => {
          if (err) throw err
          console.log(stdout)
        })
      })
    }, 100)
  })
}

function getDirectories (path) {
  return fs.readdirSync(path).filter(isDirectoryIn(path))
}

function renderEJS (TEMPLATE, data) {
  return EJS.render(fs.readFileSync(TEMPLATE, { encoding: 'utf-8' }), data, { delimiter: '%' })
}

function isDirectoryIn (path) {
  return function isDirectory (dir) {
    try {
      return fs.statSync(join(path, dir)).isDirectory()
    } catch (e) {
      return false
    }
  }
}

function strip (dependency) {
  return dependency.replace('@tempest/', '').trim()
}

function capitalize (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}