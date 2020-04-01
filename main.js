const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const { readConfig } = require('./config');
const { createTags } = require('./tags');
const { createBuildQuery } = require('./lib');

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

  const buildQuery = createBuildQuery(config, { tags });

  // login to docker
}
