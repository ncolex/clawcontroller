#!/usr/bin/env node

// Only run setup when installed globally via npm
// Skip when cloned locally (install.sh handles setup)

const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const isGlobalInstall = !fs.existsSync(path.join(ROOT, '.git'));

if (isGlobalInstall) {
  console.log('Running ClawController setup...');
  require('./setup.js');
} else {
  // Local clone - skip postinstall (install.sh handles this)
  console.log('Detected local clone - skipping npm postinstall');
}
