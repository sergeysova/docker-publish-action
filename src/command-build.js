const core = require('@actions/core');

module.exports = { createBuildCommand };

function createBuildCommand(config, { tags }) {
  const context = config.context || '.';
  const buildParams = [];

  if (config.dockerfile) {
    buildParams.push(`-f ${config.dockerfile}`);
  }

  if (config.buildOptions) {
    buildParams.push(config.buildOptions);
  }

  if (config.buildArgs.length > 0) {
    config.buildArgs.forEach((arg) => {
      // build args can contain secrets, see README `buildargs`
      core.setSecret(arg);
      buildParams.push(`--build-arg ${arg}`);
    });
  }

  if (config.cache) {
    buildParams.push('--pull');
    buildParams.push(`--cache-from ${tags[0]}`);
  }

  buildParams.push(...tags.map((tag) => `-t ${tag}`));

  // latest param
  buildParams.push(context);

  const execParams = buildParams.join(' ');

  return `docker build ${execParams}`;
}
