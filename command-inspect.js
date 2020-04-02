const core = require('@actions/core');

module.exports = { createInspectCommand };

function createInspectCommand(config, { tags }) {
  const first = tags[0];
  return `docker inspect --format='{{index .RepoDigests 0}}' ${first}`;
}
