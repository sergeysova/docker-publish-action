const core = require('@actions/core');

module.exports = { createPullCommand };

function createPullCommand(config, { tags }) {
  return tags.map((tag) => `docker pull "${tag}"`).join(' || ') + ' || true';
}
