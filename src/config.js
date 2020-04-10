const core = require('@actions/core');

module.exports = { readConfig, assign };

function readConfig() {
  const image = core.getInput('image', { required: true });
  const username = core.getInput('username', { required: true });
  const password = core.getInput('password', { required: true });
  const registry = core.getInput('registry', { required: false });
  const dockerfile = core.getInput('dockerfile', { required: false });
  const context = core.getInput('context', { required: false });
  const workdir = core.getInput('workdir', { required: false });
  const buildArgs = core.getInput('buildargs', { required: false });
  const buildOptions = core.getInput('buildoptions', { required: false });

  const cache = core.getInput('cache', { required: false });
  const snapshot = core.getInput('snapshot', { required: false });
  const tagExtra = core.getInput('tag_extra', { required: false });
  const tagSeparator = core.getInput('tag_separator', { required: false });
  const tagSemver = core.getInput('tag_semver', { required: false });
  const semverHigher = core.getInput('semver_higher', { required: false });

  const options = {
    image,
    username,
    password,
    registry,
    dockerfile,
    context,
    workdir,
    buildArgs,
    buildOptions,

    cache,
    snapshot,
    tagExtra,
    tagSeparator,
    tagSemver,
    semverHigher,
  };

  return assign(options);
}

function assign(options) {
  return validate(validators(), options);
}

function validators() {
  return {
    image: string(includes('/')).required(),
    username: string(filled).required(),
    password: string(filled).required(),
    registry: string(removeProtocol).default(undefined),
    dockerfile: string().default('Dockerfile'),
    context: string().default(undefined),
    workdir: string().default(undefined),
    buildArgs: array(),
    buildOptions: string().default(undefined),

    cache: boolean().default(false),
    snapshot: boolean().default(false),
    tagExtra: array().default([]),
    tagSeparator: string().default(undefined),
    tagSemver: options(['skip', 'fail']).default(undefined),
    semverHigher: boolean().default(false),
  };
}

function removeProtocol(name, value) {
  if (/^https:\/\//.test(value)) {
    return value.replace('https://', '');
  }
  return value;
}

function options(sourceOptions) {
  if (!Array.isArray(sourceOptions) || sourceOptions.length === 0) {
    throw new TypeError('options must be an array of string elements');
  }
  const options = sourceOptions.map((e) => String(e).trim());

  const validator = (name, value) => {
    if (!options.includes(value)) {
      throw new TypeError(`${name} option has invalid value: ${value}. Available: ${options}`);
    }
    return value;
  };
  return assignModifiers(validator);
}

function filled(name, value) {
  if (value.length === 0) {
    throw new TypeError(`${name} option cannot be empty string`);
  }
  return value;
}
function includes(sub) {
  return (name, value) => {
    if (!value.includes(sub)) {
      throw new TypeError(`${name} option should be filled correctly`);
    }
    return value;
  };
}

/**
 *
 * @param {Function} fn Asserts and converts value
 * @example
 * {
 *   name: string(filled),
 *   id: string(id({ min: 2, max: 10 })),
 * }
 */
function string(fn = (name, value) => value) {
  const validator = (name, value) => {
    return fn(name, value);
  };
  return assignModifiers(validator);
}

/**
 * Parses string as array separated by `separated` (space by default)
 * @param {string} separator
 */
function array(separator = ' ') {
  const validator = (name, value) => {
    const list = value
      .split(separator)
      .map((s) => s.trim())
      .filter(Boolean);
    return list;
  };
  return assignModifiers(validator);
}

function boolean() {
  const validator = (name, value) => {
    const trimmed = value.trim();
    if (trimmed !== 'false' && trimmed !== 'true' && trimmed !== '') {
      throw new TypeError(`${name} option is not boolean`);
    }
    return trimmed === 'true';
  };
  return assignModifiers(validator);
}

function assignModifiers(validator) {
  /** Replaces undefined with passed value */
  validator.default = (initial) => (name, value) => {
    if (value === undefined || value === null || value === '') {
      return initial;
    }

    return validator(name, value) || initial;
  };

  /** Allows empty string and another falsy values, but restricts null and undefined */
  validator.required = () => (name, value) => {
    if (value === undefined || value === null) {
      throw new TypeError(`${name} option is required`);
    }
    return validator(name, value);
  };
  return validator;
}

function validate(validators, values) {
  const result = {};
  Object.keys(validators).forEach((name) => {
    const value = values[name];
    const validator = validators[name];

    const strigified = value === undefined || value === null ? '' : String(value).trim();

    const newValue = validator(name, strigified);

    result[name] = newValue;
  });

  return result;
}
