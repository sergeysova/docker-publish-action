const core = require('@actions/core');

module.exports = { createLoginCommand };

function createLoginCommand(config) {
  const { username, password, registry } = config;
  return `docker login -u ${username} -p ${password} ${registry || ''}`;
}
