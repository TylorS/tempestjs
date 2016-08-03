// node requires
const { execSync: exec } = require('child_process')
const { join } = require('path')
const fs = require('fs')

// package requires
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

// constants
const TEMPEST_DIR=process.cwd()
const PACKAGES_DIR=join(TEMPEST_DIR, 'packages')
const PACKAGES=getDirectories(PACKAGES_DIR)
const SCRIPT = process.argv[2] 

PACKAGES.forEach(package => {
  const PACKAGE_DIR = join(PACKAGES_DIR, package)   
  console.log(`Running '${SCRIPT}' in @tempest/${package}...`)
  exec(`npm run ${SCRIPT}`, { cwd: PACKAGE_DIR })
})

function getDirectories (path) {
  return fs.readdirSync(path).filter(isDirectoryIn(path))
}

function isDirectoryIn (path) {
  return function isDirectory (dir) {
    return fs.statSync(join(path, dir)).isDirectory()
  }
}