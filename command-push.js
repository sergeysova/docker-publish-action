const core = require('@actions/core');

module.exports = { createPushCommand };

function createPushCommand(config, { tags }) {
  return tags.map((tag) => `docker push "${tag}"`);
}
