#!/usr/bin/env node
// Copyright 2017-2021 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import os from 'os';
import path from 'path';
import yargs from 'yargs';

import copySync from './copySync.mjs';
import execSync from './execSync.mjs';

console.log('$ polkadot-ci-ghact-build', process.argv.slice(2).join(' '));

const repo = `https://${process.env.GH_PAT}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

const argv = yargs(process.argv.slice(2))
  .options({
    'skip-beta': {
      description: 'Do not increment as beta',
      type: 'boolean'
    }
  })
  .strict().argv;

function runClean() {
  execSync('yarn polkadot-dev-clean-build');
}

function runBuild() {
  execSync('yarn build');
}

function npmGetVersion() {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')).version;
}

function npmSetup() {
  const registry = 'registry.npmjs.org';

  fs.writeFileSync(path.join(os.homedir(), '.npmrc'), `//${registry}/:_authToken=${process.env.NPM_TOKEN}`);
}

function npmPublish() {
  if (fs.existsSync('.skip-npm')) {
    return;
  }

  ['LICENSE', 'package.json']
    .filter((file) => !fs.existsSync(path.join(process.cwd(), 'build', file)))
    .forEach((file) => copySync(file, 'build'));

  process.chdir('build');

  const tag = npmGetVersion().includes('-') ? '--tag beta' : '';
  let count = 1;

  while (true) {
    try {
      execSync(`npm publish --access public ${tag}`);

      break;
    } catch (error) {
      if (count < 5) {
        const end = Date.now() + 15000;

        console.error(`Publish failed on attempt ${count}/5. Retrying in 15s`);
        count++;

        while (Date.now() < end) {
          // just spin our wheels
        }
      }
    }
  }

  process.chdir('..');
}

function gitBump() {
  const currentVersion = npmGetVersion();
  const [version, tag] = currentVersion.split('-');
  const [, , patch] = version.split('.');

  if (argv['skip-beta'] || patch === '0') {
    // don't allow beta versions
    execSync('yarn polkadot-dev-version patch');
  } else {
    const triggerPath = path.join(process.cwd(), '.123trigger');
    const available = fs.readFileSync(triggerPath, 'utf-8').split('\n');

    if (tag || patch === '1' || available.includes(currentVersion)) {
      // if we have a beta version, just continue the stream of betas
      execSync('yarn polkadot-dev-version pre');
    } else {
      // manual setting of version, make some changes so we can commit
      fs.appendFileSync(triggerPath, `\n${currentVersion}`);
    }
  }

  // createContributors();

  execSync('git add --all .');
}

function loopFunc(fn) {
  if (fs.existsSync('packages')) {
    fs.readdirSync('packages')
      .filter((dir) => {
        const pkgDir = path.join(process.cwd(), 'packages', dir);

        return (
          fs.statSync(pkgDir).isDirectory() &&
          fs.existsSync(path.join(pkgDir, 'package.json')) &&
          fs.existsSync(path.join(pkgDir, 'build'))
        );
      })
      .forEach((dir) => {
        process.chdir(path.join('packages', dir));
        fn();
        process.chdir('../..');
      });
  } else {
    fn();
  }
}

gitBump();
npmSetup();

runClean();
runBuild();

loopFunc(npmPublish);
