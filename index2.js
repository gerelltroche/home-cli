#!/usr/bin/env node

import meow from 'meow';
import getStdin from "get-stdin";
import chalk from "chalk";

// console.log(chalk.bgCyanBright.bold(await getStdin()));

const cli = meow(`
  Usage:
  # gogo release <ticket-id>
  
  Options:
  Dunno
  
  Examples:
  # gogo release ATTBUS-252
  stuff happens
`, {
  importMeta: import.meta
});

async function yellItOut(thingToYell) {
  if (!thingToYell) thingToYell = await getStdin();
  console.log('quietly', thingToYell)
  return true
}

await yellItOut(cli.input[0])
