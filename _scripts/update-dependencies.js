// node requires
const { execSync: exec } = require('child_process')
const { join } = require('path')
const fs = require('fs')

// package requires
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const Boxcutter = require('boxcutter')

// constants
const TEMPEST_DIR=process.cwd()
const PACKAGES_DIR=join(TEMPEST_DIR, 'packages')
const CORE_DIR = join(PACKAGES_DIR, 'core')
const CORE_VERSION = require(join(CORE_DIR, 'package.json')).version
const PACKAGES = getDirectories(PACKAGES_DIR)
const SCRIPT = process.argv[2] 

PACKAGES.filter(package => package !== 'core').forEach(package => {
  const CURRENT_PACKAGE_DIR = join(PACKAGES_DIR, package)
  const PACKAGEJSON = require(join(CURRENT_PACKAGE_DIR, 'package.json'))
  const DEPENDENCIES = Object.keys(PACKAGEJSON.dependencies)

  const boxcutter = Object.assign({}, Boxcutter.Boxcutter)
  boxcutter.load(join(CURRENT_PACKAGE_DIR, 'package.json'))

  console.log(`Updating 'core' dependency to ${CORE_VERSION} in @tempest/${package}...`)

  function updateDep (dep) {
    if (isTempestPackage(dep)) {
      boxcutter.set(`dependencies.${dep}`, `^${CORE_VERSION}`)
    }
  }

  DEPENDENCIES.forEach(updateDep)
  boxcutter.save(join(CURRENT_PACKAGE_DIR, 'package.json'))
})

function getDirectories (path) {
  return fs.readdirSync(path).filter(isDirectoryIn(path))
}

function isDirectoryIn (path) {
  return function isDirectory (dir) {
    return fs.statSync(join(path, dir)).isDirectory()
  }
}

function strip (dependency) {
  return dependency.replace('@tempest/', '').trim()
}

function isTempestPackage (package) {
  return package.indexOf('@tempest') === 0
}