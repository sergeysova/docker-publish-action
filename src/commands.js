const { createTags } = require('./tags');
const { createBuildCommand } = require('./command-build');
const { createInspectCommand } = require('./command-inspect');
const { createLoginCommand } = require('./command-login');
const { createPullCommands } = require('./command-pull');
const { createPushCommands } = require('./command-push');

function getCommands({ ref, sha, config }) {
  const cwd = config.workdir;

  const { tags, version } = createTags(config, { ref, sha });

  /**
   * @type Array<[command, arguments, options, { safe: boolean }]>
   */
  const commands = [];

  commands.push([createLoginCommand(config), [], { cwd }, { safe: false }]);

  for (const command of createPullCommands(config, { tags })) {
    commands.push([command, [], { cwd }, { safe: true }]);
  }

  commands.push([createBuildCommand(config, { tags }), [], { cwd }, { safe: false }]);

  for (const command of createPushCommands(config, { tags })) {
    commands.push([command, [], { cwd }, { safe: false }]);
  }

  commands.push([createInspectCommand(config, { tags }), [], { cwd }, { safe: false }]);

  return commands;
}

module.exports = {
  getCommands,
};
