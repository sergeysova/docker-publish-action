const { createTags } = require('./tags');

const { assign } = require('./config');

const config = assign({
  image: 'owner/image',
  username: 'username',
  password: 'password',
});

const _Date = Date;
beforeAll(() => {
  const DATE_TO_USE = new Date('2017-06-13T04:41:20Z');

  // @ts-ignore
  global.Date = jest.fn(() => DATE_TO_USE);
  global.Date.UTC = _Date.UTC;
  global.Date.parse = _Date.parse;
  global.Date.now = _Date.now;
});

afterAll(() => {
  global.Date = _Date;
});

///////////////////////////////////////////////////////////////////////////////////
test('it pushes master to latest', () => {
  expect(
    createTags(
      { ...config, image: 'owner/image' },
      { ref: 'refs/heads/master', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:latest",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('it pushes branch as name of the branch', () => {
  expect(
    createTags(
      { ...config, image: 'owner/image' },
      { ref: 'refs/heads/myBranch', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:myBranch",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('it converts dashes in branch to hyphens', () => {
  expect(
    createTags(
      { ...config, image: 'owner/image' },
      { ref: 'refs/heads/myBranch/withDash', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:myBranch-withDash",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('it pushes pr as sha', () => {
  expect(
    createTags(config, {
      ref: 'refs/pull/24/merge',
      sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
    }),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3",
      ],
      "version": null,
    }
  `);

  expect(
    createTags(
      { ...config, tagExtra: ['pr'] },
      {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3",
        "owner/image:pr",
      ],
      "version": null,
    }
  `);

  expect(
    createTags(
      { ...config, tagExtra: ['pr'], snapshot: true },
      {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3",
        "owner/image:pr",
        "owner/image:20170613-044120-a0f149",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('it pushes tags to same tags', () => {
  expect(
    createTags(
      { ...config, image: 'owner/image' },
      { ref: 'refs/tags/myRelease', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:myRelease",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('with tagExtra it pushes also some tags', () => {
  expect(
    createTags(
      { ...config, image: 'owner/image', tagExtra: ['foo', 'bar'] },
      { ref: 'refs/tags/myRelease', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:myRelease",
        "owner/image:foo",
        "owner/image:bar",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('with tagExtra it pushes uniq tags', () => {
  expect(
    createTags(
      { ...config, image: 'owner/image', tagExtra: ['bye', 'hello'] },
      { ref: 'refs/tags/hello', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:hello",
        "owner/image:bye",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('with snapshot adds also snapshot tag to branch', () => {
  expect(
    createTags(
      { ...config, image: 'owner/image', snapshot: true },
      { ref: 'refs/heads/master', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:latest",
        "owner/image:20170613-044120-a0f149",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('with tagSeparator it pushes tags without project prefix', () => {
  expect(
    createTags(
      { ...config, image: 'owner/image', tagSeparator: '@' },
      { ref: 'refs/tags/hello@version', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:version",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('with tagSeparator it pushes tags do not affect snapshot and extra tags', () => {
  expect(
    createTags(
      {
        ...config,
        image: 'owner/image',
        tagSeparator: '@',
        snapshot: true,
        tagExtra: ['hello', 'bar'],
      },
      { ref: 'refs/tags/hello@version', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:version",
        "owner/image:hello",
        "owner/image:bar",
        "owner/image:20170613-044120-a0f149",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('with tagSemver: skip it skips non semver tag', () => {
  expect(
    createTags(
      { ...config, image: 'owner/image', tagSemver: 'skip', tagSeparator: '@' },
      { ref: 'refs/tags/hello@version', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3",
      ],
      "version": null,
    }
  `);

  expect(
    createTags(
      { ...config, image: 'owner/image', tagSemver: 'skip' },
      { ref: 'refs/tags/version', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3",
      ],
      "version": null,
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('with tagSemver: fail it fails on non semver tag', () => {
  expect(() =>
    createTags(
      { ...config, image: 'owner/image', tagSemver: 'fail', tagSeparator: '@' },
      { ref: 'refs/tags/hello@version', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toThrow(`Tag "version" is not`);

  expect(() =>
    createTags(
      { ...config, image: 'owner/image', tagSemver: 'fail' },
      { ref: 'refs/tags/version', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toThrow(`Tag "version" is not`);
});

///////////////////////////////////////////////////////////////////////////////////
test('with tagSemver: fail it parses semver tag', () => {
  expect(
    createTags(
      { ...config, image: 'owner/image', tagSemver: 'skip', tagSeparator: '@' },
      { ref: 'refs/tags/hello@1.2.3', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:1.2.3",
      ],
      "version": "1.2.3",
    }
  `);

  expect(
    createTags(
      { ...config, image: 'owner/image', tagSemver: 'skip' },
      { ref: 'refs/tags/v1.2.3', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:1.2.3",
      ],
      "version": "1.2.3",
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('it saves prerelease as is', () => {
  expect(
    createTags(
      {
        ...config,
        image: 'owner/image',
        tagSemver: 'skip',
        tagSeparator: '@',
      },
      {
        ref: 'refs/tags/hello@1.2.3-alpha.0-gt.1',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:1.2.3-alpha.0-gt.1",
      ],
      "version": "1.2.3-alpha.0-gt.1",
    }
  `);

  expect(
    createTags(
      { ...config, image: 'owner/image', tagSemver: 'skip' },
      { ref: 'refs/tags/v1.2.3-alpha.0-gt.1', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:1.2.3-alpha.0-gt.1",
      ],
      "version": "1.2.3-alpha.0-gt.1",
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('with semverHigher it creates much tags', () => {
  expect(
    createTags(
      {
        ...config,
        image: 'owner/image',
        tagSemver: 'skip',
        semverHigher: true,
      },
      { ref: 'refs/tags/v1.2.3-alpha.0-gt.1', sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3' },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "owner/image:1.2.3-alpha.0-gt.1",
        "owner/image:1.2.3-alpha.0-gt",
        "owner/image:1.2.3-alpha",
        "owner/image:1.2-alpha",
        "owner/image:1-alpha",
      ],
      "version": "1.2.3-alpha.0-gt.1",
    }
  `);
});

///////////////////////////////////////////////////////////////////////////////////
test('with all options set', () => {
  expect(
    createTags(
      {
        ...config,
        image: 'owner/image',
        registry: 'docker.pkg.github.com',
        semverHigher: true,
        snapshot: true,
        tagExtra: ['dev', 'pre'],
        tagSemver: 'skip',
        tagSeparator: '@',
      },
      {
        ref: 'refs/tags/project@v1.2.3-alpha.0-gt.1',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "docker.pkg.github.com/owner/image:1.2.3-alpha.0-gt.1",
        "docker.pkg.github.com/owner/image:1.2.3-alpha.0-gt",
        "docker.pkg.github.com/owner/image:1.2.3-alpha",
        "docker.pkg.github.com/owner/image:1.2-alpha",
        "docker.pkg.github.com/owner/image:1-alpha",
        "docker.pkg.github.com/owner/image:dev",
        "docker.pkg.github.com/owner/image:pre",
        "docker.pkg.github.com/owner/image:20170613-044120-a0f149",
      ],
      "version": "1.2.3-alpha.0-gt.1",
    }
  `);

  expect(
    createTags(
      {
        ...config,
        image: 'owner/image',
        registry: 'docker.pkg.github.com',
        semverHigher: true,
        snapshot: true,
        tagExtra: ['dev'],
        tagSemver: 'skip',
        tagSeparator: '@',
      },
      {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "docker.pkg.github.com/owner/image:1.2.3",
        "docker.pkg.github.com/owner/image:1.2",
        "docker.pkg.github.com/owner/image:1",
        "docker.pkg.github.com/owner/image:dev",
        "docker.pkg.github.com/owner/image:20170613-044120-a0f149",
      ],
      "version": "1.2.3",
    }
  `);

  expect(
    createTags(
      {
        ...config,
        image: 'owner/image',
        registry: 'docker.pkg.github.com',
        semverHigher: true,
        snapshot: true,
        tagExtra: ['dev'],
        tagSemver: 'skip',
        tagSeparator: '@',
      },
      {
        ref: 'refs/tags/demo',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "docker.pkg.github.com/owner/image:dev",
        "docker.pkg.github.com/owner/image:20170613-044120-a0f149",
      ],
      "version": null,
    }
  `);

  expect(
    createTags(
      {
        ...config,
        image: 'owner/image',
        registry: 'docker.pkg.github.com',
        semverHigher: true,
        snapshot: true,
        tagExtra: ['dev'],
        tagSemver: 'skip',
        tagSeparator: '@',
      },
      {
        ref: 'refs/heads/demo/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "docker.pkg.github.com/owner/image:demo-branch",
        "docker.pkg.github.com/owner/image:dev",
        "docker.pkg.github.com/owner/image:20170613-044120-a0f149",
      ],
      "version": null,
    }
  `);

  expect(
    createTags(
      {
        ...config,
        image: 'owner/image',
        registry: 'docker.pkg.github.com',
        semverHigher: true,
        snapshot: true,
        tagExtra: ['dev'],
        tagSemver: 'skip',
        tagSeparator: '@',
      },
      {
        ref: 'refs/heads/dev',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "docker.pkg.github.com/owner/image:dev",
        "docker.pkg.github.com/owner/image:20170613-044120-a0f149",
      ],
      "version": null,
    }
  `);

  expect(
    createTags(
      {
        ...config,
        image: 'owner/image',
        registry: 'docker.pkg.github.com',
        semverHigher: true,
        snapshot: true,
        tagExtra: ['dev'],
        tagSemver: 'skip',
        tagSeparator: '@',
      },
      {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "tags": Array [
        "docker.pkg.github.com/owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3",
        "docker.pkg.github.com/owner/image:dev",
        "docker.pkg.github.com/owner/image:20170613-044120-a0f149",
      ],
      "version": null,
    }
  `);
});

test('example from readme', () => {
  expect(
    createTags(
      {
        ...config,
        tagSemver: 'skip',
        semverHigher: true,
      },
      {
        ref: 'refs/tags/v1.2.3-alpha',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toEqual({
    tags: ['owner/image:1.2.3-alpha', 'owner/image:1.2-alpha', 'owner/image:1-alpha'],
    version: '1.2.3-alpha',
  });

  expect(
    createTags(
      {
        ...config,
        tagSemver: 'skip',
        semverHigher: true,
      },
      {
        ref: 'refs/tags/v1.2.3-beta.1-int.2',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toEqual({
    tags: [
      'owner/image:1.2.3-beta.1-int.2',
      'owner/image:1.2.3-beta.1-int',
      'owner/image:1.2.3-beta',
      'owner/image:1.2-beta',
      'owner/image:1-beta',
    ],
    version: '1.2.3-beta.1-int.2',
  });

  expect(
    createTags(
      {
        ...config,
        tagSemver: 'skip',
        semverHigher: true,
      },
      {
        ref: 'refs/tags/v1.2.3-beta.1.pre.2',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      },
    ),
  ).toEqual({
    tags: [
      'owner/image:1.2.3-beta.1.pre.2',
      'owner/image:1.2.3-beta.1.pre',
      'owner/image:1.2.3-beta.1',
      'owner/image:1.2.3-beta',
      'owner/image:1.2-beta',
      'owner/image:1-beta',
    ],
    version: '1.2.3-beta.1.pre.2',
  });
});
