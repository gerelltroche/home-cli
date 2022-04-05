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
  const { type } = updateType;
  const file = fs.readFileSync('./package.json');
  const packageJSON = JSON.parse(file);
  const version = packageJSON.version.split('.')

  const composeVersion = (versionArray) => versionArray.join('.')

  if (type === 'major') {
    version[0]++
    return composeVersion(version);
  }

  if (type === 'minor') {
    version[1]++
    return composeVersion(version);
  }

  if (type === 'patch') {
    version[2]++
    return composeVersion(version);
  }
}

async function release(flags = 'patch') {
  await updateDevelop();
  const newVersion = getNewVersion(flags);
  console.log(chalk.blue.bold(`Creating release ${newVersion}`));
  await exec(`git flow release start ${newVersion}`)
  console.log(chalk.blue.bold(`Bumping package.json version`));
  await exec(`npm version patch`);
  console.log(chalk.blue.bold(`Finishing release and adding tag`));
  await exec(`git flow release finish -m "v${newVersion}" ${newVersion}`);
  console.log(chalk.cyanBright.bold('Release created successfully'));
  console.log(chalk.blue.bold(`Attempting to push release and tags...`));
  await exec('git push --all && git push --tags');
  console.log(chalk.cyanBright.bold('Release pushed.'));
}

await release(cli.flags)
