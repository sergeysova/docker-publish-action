const core = require('@actions/core');
const { exec } = require('@actions/exec');
const github = require('@actions/github');

const { readConfig } = require('./config');
const { createTags } = require('./tags');
const { createBuildCommand } = require('./command-build');

main().catch((error) => {
  console.error(error);
  core.setFailed(`Action failed with error ${error}`);
});

async function main() {
  const config = readConfig();
  const ref = process.env.GITHUB_REF;
  const sha = process.env.GITHUB_SHA;

  const cwd = config.workdir;
  const context = config.context || '.';

  const tags = createTags(config, { ref, sha });
  const dockerName = tags[0];

  const buildCommand = createBuildCommand(config, { tags });

  await exec(buildCommand, [], { cwd });

  // login to docker
}
