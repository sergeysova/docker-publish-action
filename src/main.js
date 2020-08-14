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

const { getCommands } = require('./commands');

main().catch((error) => {
  console.error(error);
  core.setFailed(`Action failed with error ${error}`);
});

async function main() {
  const config = readConfig();
  const ref = process.env.GITHUB_REF;
  const sha = process.env.GITHUB_SHA;

  const commands = getCommands({ ref, sha, config });

  const result = commands.reduce((p, [command, args, options, { safe }], index, list) => {
    const executor = isLast(index, list) ? execOutput : exec;
    const promise = p.then(() => executor(command, args, options));
    return safe ? promise.catch(() => null) : promise;
  }, Promise.resolve());

  const digest = await result;

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

function isLast(index, list) {
  return list.length - 1 === index;
}
