const core = require('@actions/core');

module.exports = { createLoginCommand };

function createLoginCommand(config) {
  const { username, password } = config;
  return `docker login -u ${username} -p ${password}`;
}
