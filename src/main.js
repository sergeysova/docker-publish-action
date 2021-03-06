const core = require('@actions/core');
const { exec } = require('@actions/exec');

const { readConfig } = require('./config');
const { createTags, createFullName } = require('./tags');
const { getCommands } = require('./commands');

main().catch((error) => {
  console.error(error);
  core.setFailed(`Action failed with error ${error}`);
});

async function main() {
  const config = readConfig();
  const ref = process.env.GITHUB_REF;
  const sha = process.env.GITHUB_SHA;

  const { tags, version } = createTags(config, { ref, sha });
  const commands = getCommands({ tags, config });
  const answer = await executeCommands(commands);

  const [, digest] = answer.split('@sha256:');

  core.debug(JSON.stringify(config));
  const firstTag = tags[0];

  if (config.tagFromLabel) {
    const labelValue = await execOutput(
      `docker image inspect --format="{{.Config.Labels.${config.tagFromLabel}}}" ${firstTag}`,
      [],
      { cwd: config.workdir },
    );
    if (labelValue !== '<no value>') {
      const fullTag = `${createFullName(config)}:${labelValue}`;
      await exec(`docker tag ${firstTag} ${fullTag}`);
      await exec(`docker push ${fullTag}`);
    }
  }

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

function executeCommands(commands) {
  return commands.reduce((p, [command, args, options, { safe }], index, list) => {
    const executor = isLast(index, list) ? execOutput : exec;
    const promise = p.then(() => executor(command, args, options));
    return safe ? promise.catch(() => null) : promise;
  }, Promise.resolve());
}
