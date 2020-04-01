const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const { readConfig } = require('./config');

main().catch((error) => {
  core.setFailed(`Action failed with error ${error}`);
});

async function main() {
  const config = readConfig();

  console.log('CONFIG', config);
}
