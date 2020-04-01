const semver = require('semver');

module.exports = {
  createTags,
};

function createTags(config, { ref, sha }) {
  const imageName = createFullName(config.image, config.registry);
  const tags = [];

  const branch = parseBranch(ref);

  if (branch === 'master') {
    tags.push('latest');
  } else if (isGitTag(ref)) {
    const [project, tag] = parseSeparatedTag(config, { ref });

    if (config.tagSemver) {
      tags.push(...createSemver(config, { tag }));
    } else {
      tags.push(tag);
    }
  } else if (isPullRequest(ref)) {
    tags.push(sha);
  } else {
    tags.push(branch);
  }

  if (config.tagExtra) {
    tags.push(...config.tagExtra);
  }

  if (config.snapshot) {
    tags.push(createSnapshot({ sha }));
  }

  return [...new Set(tags)].map((tag) => `${imageName}:${tag}`);
}

function createSnapshot({ sha }) {
  const date = new Date();
  const timestamp = date
    .toISOString()
    .replace(/-/g, '')
    .replace(/\..*$/, '')
    .replace(/:/g, '')
    .replace('T', '-');

  return `${timestamp}-${sha.slice(0, 6)}`;
}

function parseSeparatedTag(config, { ref }) {
  const tag = parseTag(ref);

  if (config.tagSeparator) {
    const index = tag.indexOf(config.tagSeparator);

    if (index > -1) {
      const name = tag.slice(0, index);
      const version = tag.slice(index + 1);
      return [name, version];
    }
  }
  return ['', tag];
}

function createSemver(config, { tag }) {
  const mode = config.tagSemver;
  const includePrerelease = config.semverPrerelease !== 'cut';

  if (semver.valid(tag, { includePrerelease })) {
    const version = semver.parse(tag, { includePrerelease });

    const tags = [];

    switch (config.semverPrerelease) {
      case 'short':
        const pre = version.prerelease.length > 0 ? `-${version.prerelease[0]}` : '';
        const string = [version.major, version.minor, version.patch].join('.').concat(pre);
        tags.push(string);
        break;
      case 'full':
        tags.push(version.format());
        break;
      case 'cut':
      default:
        tags.push([version.major, version.minor, version.patch].join('.'));
        break;
    }

    if (config.semverHigher) {
      tags.push(...createHigher(config, { version }));
    }

    return tags;
  } else if (mode === 'skip') {
    // do nothing
  } else if (mode === 'fail') {
    throw new TypeError(`Tag "${tag}" is not a semver`);
  }

  return [];
}

function createHigher(config, { version }) {
  const tags = [];

  if (version.prerelease.length) {
    switch (config.semverPrerelease) {
      case 'cut':
        version.prerelease = [];
        break;
      case 'short':
        version.prerelease = [version.prerelease[0]];
        break;
      case 'full':
      // do nothing, full prerelease is used
    }
  }

  while (version.prerelease.length) {
    tags.push(version.format());
    version.prerelease.pop();
  }

  tags.push(
    `${version.major}.${version.minor}.${version.patch}`,
    `${version.major}.${version.minor}`,
    `${version.major}`,
  );

  return tags;
}

function parseBranch(ref) {
  return ref.replace(/refs\/heads\//, '').replace(/\//g, '-');
}

function parseTag(ref) {
  return ref.replace(/refs\/tags\//, '');
}

function isGitTag(ref) {
  return parseTag(ref) !== ref;
}

function parsePr(ref) {
  return ref.replace(/refs\/pull\//, '');
}

function isPullRequest(ref) {
  return parsePr(ref) !== ref;
}

function createFullName(image, registry) {
  return registry && !image.includes(registry) ? `${registry}/${image}` : image;
}
