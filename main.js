const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const { readConfig } = require('./config');
const { createTags } = require('./tags');

main().catch((error) => {
  core.setFailed(`Action failed with error ${error}`);
});

async function main() {
  const config = readConfig();
  const ref = process.env.GITHUB_REF;
  const sha = process.env.GITHUB_SHA;

  const cwd = config.workdir;
  const context = config.context || '.';

  const tags = createTags(config, { ref, sha });
  const dockerName = tags.shift();
  const buildParams = [];

  if (config.dockerfile) {
    buildParams.push(`-f ${config.dockerfile}`);
  }

  if (config.buildArgs.length > 0) {
    config.buildArgs.forEach((arg) => {
      core.setSecret(arg);
      buildParams.push(`--build-arg ${arg}`);
    });
  }

  if (config.buildOptions) {
    buildParams.push(config.buildOptions);
  }

  // latest param
  buildParams.push(context);

  const execParams = buildParams.join(' ');
  console.log(`docker ${execParams}`);

  // login to docker
}
