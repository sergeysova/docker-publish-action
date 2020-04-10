const core = require('@actions/core');
const { exec } = require('@actions/exec');
const github = require('@actions/github');

const { readConfig } = require('./config');
const { createTags } = require('./tags');
const { createBuildCommand } = require('./command-build');
const { createInspectCommand } = require('./command-inspect');
const { createLoginCommand } = require('./command-login');
const { createPullCommands } = require('./command-pull');
const { createPushCommands } = require('./command-push');

main().catch((error) => {
  console.error(error);
  core.setFailed(`Action failed with error ${error}`);
});

async function main() {
  const config = readConfig();
  const ref = process.env.GITHUB_REF;
  const sha = process.env.GITHUB_SHA;

  const cwd = config.workdir;

  const { tags, version } = createTags(config, { ref, sha });

  const login = createLoginCommand(config);
  const pullCommands = createPullCommands(config, { tags });
  const buildCommand = createBuildCommand(config, { tags });
  const inspectCommand = createInspectCommand(config, { tags });
  const pushCommands = createPushCommands(config, { tags });

  await exec(login, [], { cwd });

  for (const command of pullCommands) {
    try {
      await exec(command, [], { cwd });
    } catch (error) {
      // tag maybe not created yet
    }
  }

  await exec(buildCommand, [], { cwd });

  for (const command of pushCommands) {
    await exec(command, [], { cwd });
  }

  const digest = await execOutput(inspectCommand, [], { cwd });

  core.setOutput('digest', digest.trim());
  core.setOutput('tag', tags[0]);
  core.setOutput('semver', version);
}

async function execOutput(cmd, args, options) {
  let output = '';
  const listeners = {
    stdout: (data) => {
      output += data.toString();
    },
  };
  await exec(cmd, args, {
    ...options,
    listeners,
  });
  return output;
}
