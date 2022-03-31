#!/usr/bin/env node

// updateDevelop()
// check version in ./package.json
// new_version = version + 1
// git flow release start $new_version
// change version to $new_version in ./package.json
// git commit -m "Bump to version $new_version"
// git flow release finish $new_version -m 'v$new_version' <-- test this


import { exec as childProcess } from 'child_process';
import meow from 'meow';
import util from 'util';
import chalk from "chalk";
import fs from "fs";

const exec = util.promisify(childProcess);

const cli = meow(`
  Usage:
  # gogo release <ticket-id>
  
  Options:
   --type, -t Specify the type of release. Default is patch
        major, minor, or patch
  
  Examples:
  # gogo release TICKET-123
`, {
  importMeta: import.meta,
  flags: {
    type: {
      type: 'string',
      alias: 't',
      default: 'patch'
    }
  }
});

async function updateDevelop() {
  const { stdout } = await exec('git rev-parse --abbrev-ref HEAD');
  const currentBranch = stdout.trim();
  if (currentBranch === 'develop') {
    await exec(`
      git pull origin develop
    `);
    console.log(chalk.cyanBright.bold('Updated Develop Branch Successfully'));
    return;
  }
  await exec(`
    git checkout develop && 
    git pull origin develop && 
    git checkout ${currentBranch}
  `);
  console.log(chalk.cyanBright.bold('Updated Develop Branch Successfully'));
}

function getNewVersion(updateType = 'patch') {
  const file = fs.readFileSync('./package.json');
  const packageJSON = JSON.parse(file);
  const version = packageJSON.version.split('.')

  const composeVersion = (versionArray) => versionArray.join('.')

  if (updateType === 'major') {
    version[0]++
    return composeVersion(version);
  }

  if (updateType === 'minor') {
    version[1]++
    return composeVersion(version);
  }

  if (updateType === 'patch') {
    version[2]++
    return composeVersion(version);
  }
}

async function release(thingToYell, flags) {
  await updateDevelop();
  const newVersion = getNewVersion(flags);
  await exec(`git flow release start ${newVersion}`);


}

await release(cli.input[0], cli.flags)
