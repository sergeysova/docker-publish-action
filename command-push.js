const core = require('@actions/core');

module.exports = { createPushCommands };

function createPushCommands(config, { tags }) {
  return tags.map((tag) => `docker push "${tag}"`);
}
