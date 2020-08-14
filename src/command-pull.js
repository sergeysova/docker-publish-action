const core = require('@actions/core');

module.exports = { createPullCommands };

function createPullCommands(config, { tags }) {
  return tags.map((tag) => `docker pull "${tag}"`);
}
