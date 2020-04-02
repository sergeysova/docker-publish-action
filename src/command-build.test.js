const { createBuildCommand } = require('./command-build');
const { assign } = require('./config');
const { createTags } = require('./tags');

const defaults = assign({
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
test('default config branch master', () => {
  const config = { ...defaults };
  const { tags } = createTags(config, {
    ref: 'refs/heads/master',
    sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
  });
  expect(createBuildCommand(config, { tags })).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:latest ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('default config branch deep', () => {
  const config = { ...defaults };
  const { tags } = createTags(config, {
    ref: 'refs/heads/branch/inside/deep/wow',
    sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
  });
  expect(createBuildCommand(config, { tags })).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:branch-inside-deep-wow ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('default config tag semver', () => {
  const config = { ...defaults };
  const { tags } = createTags(config, {
    ref: 'refs/tags/v1.2.3',
    sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
  });
  expect(createBuildCommand(config, { tags })).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:v1.2.3 ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('default config tag nonsemver', () => {
  const config = { ...defaults };
  const { tags } = createTags(config, {
    ref: 'refs/tags/hello',
    sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
  });
  expect(createBuildCommand(config, { tags })).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:hello ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('default config tag semver with separator', () => {
  const config = { ...defaults };
  const { tags } = createTags(config, {
    ref: 'refs/tags/project@hello',
    sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
  });
  expect(createBuildCommand(config, { tags })).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:project@hello ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('registry option', () => {
  const config = { ...defaults, registry: 'docker.pkg.github.com' };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t docker.pkg.github.com/owner/image:latest ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t docker.pkg.github.com/owner/image:deep-branch ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t docker.pkg.github.com/owner/image:hello ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t docker.pkg.github.com/owner/image:v1.2.3 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t docker.pkg.github.com/owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('dockerfile option', () => {
  const config = { ...defaults, registry: 'docker.pkg.github.com', dockerfile: 'my.Dockerfile' };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:latest ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:deep-branch ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:hello ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:v1.2.3 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('context option', () => {
  const config = {
    ...defaults,
    registry: 'docker.pkg.github.com',
    dockerfile: 'my.Dockerfile',
    context: 'context/dir',
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:latest context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:deep-branch context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:hello context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:v1.2.3 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 context/dir"`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('buildargs option', () => {
  const config = {
    ...defaults,
    registry: 'docker.pkg.github.com',
    dockerfile: 'my.Dockerfile',
    context: 'context/dir',
    buildargs: ['FOO', 'BAR'],
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:latest context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:deep-branch context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:hello context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:v1.2.3 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile -t docker.pkg.github.com/owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 context/dir"`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('buildoptions option', () => {
  const config = {
    ...defaults,
    registry: 'docker.pkg.github.com',
    dockerfile: 'my.Dockerfile',
    context: 'context/dir',
    buildArgs: ['FOO', 'BAR'],
    buildOptions: '--compress --force-rm',
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t docker.pkg.github.com/owner/image:latest context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t docker.pkg.github.com/owner/image:deep-branch context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t docker.pkg.github.com/owner/image:hello context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t docker.pkg.github.com/owner/image:v1.2.3 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t docker.pkg.github.com/owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 context/dir"`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('snapshot option', () => {
  const config = {
    ...defaults,
    registry: 'docker.pkg.github.com',
    dockerfile: 'my.Dockerfile',
    context: 'context/dir',
    buildArgs: ['FOO', 'BAR'],
    buildOptions: '--compress --force-rm',
    snapshot: true,
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t docker.pkg.github.com/owner/image:latest -t docker.pkg.github.com/owner/image:20170613-044120-a0f149 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t docker.pkg.github.com/owner/image:deep-branch -t docker.pkg.github.com/owner/image:20170613-044120-a0f149 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t docker.pkg.github.com/owner/image:hello -t docker.pkg.github.com/owner/image:20170613-044120-a0f149 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t docker.pkg.github.com/owner/image:v1.2.3 -t docker.pkg.github.com/owner/image:20170613-044120-a0f149 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t docker.pkg.github.com/owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 -t docker.pkg.github.com/owner/image:20170613-044120-a0f149 context/dir"`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('snapshot option without registry', () => {
  const config = {
    ...defaults,
    dockerfile: 'my.Dockerfile',
    context: 'context/dir',
    buildArgs: ['FOO', 'BAR'],
    buildOptions: '--compress --force-rm',
    snapshot: true,
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t owner/image:latest -t owner/image:20170613-044120-a0f149 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t owner/image:deep-branch -t owner/image:20170613-044120-a0f149 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t owner/image:hello -t owner/image:20170613-044120-a0f149 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t owner/image:v1.2.3 -t owner/image:20170613-044120-a0f149 context/dir"`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f my.Dockerfile --compress --force-rm --build-arg FOO --build-arg BAR -t owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 -t owner/image:20170613-044120-a0f149 context/dir"`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('just snapshot option', () => {
  const config = {
    ...defaults,
    snapshot: true,
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:latest -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:deep-branch -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:hello -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:v1.2.3 -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 -t owner/image:20170613-044120-a0f149 ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('snapshot and tagExtra option', () => {
  const config = {
    ...defaults,
    snapshot: true,
    tagExtra: ['foo', 'bar'],
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:latest -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:deep-branch -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:hello -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:v1.2.3 -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('snapshot and tagExtra with registry option', () => {
  const config = {
    ...defaults,
    snapshot: true,
    registry: 'my.docker.com',
    tagExtra: ['foo', 'bar'],
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t my.docker.com/owner/image:latest -t my.docker.com/owner/image:foo -t my.docker.com/owner/image:bar -t my.docker.com/owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t my.docker.com/owner/image:deep-branch -t my.docker.com/owner/image:foo -t my.docker.com/owner/image:bar -t my.docker.com/owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t my.docker.com/owner/image:hello -t my.docker.com/owner/image:foo -t my.docker.com/owner/image:bar -t my.docker.com/owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t my.docker.com/owner/image:v1.2.3 -t my.docker.com/owner/image:foo -t my.docker.com/owner/image:bar -t my.docker.com/owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t my.docker.com/owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 -t my.docker.com/owner/image:foo -t my.docker.com/owner/image:bar -t my.docker.com/owner/image:20170613-044120-a0f149 ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('tagSeparator option', () => {
  const config = {
    ...defaults,
    snapshot: true,
    tagExtra: ['foo', 'bar'],
    tagSeparator: '@',
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:v1.2.3 -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:hello -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/project@hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:hello -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/project@v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:v1.2.3 -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('tagSeparator and tagSemver option', () => {
  const config = {
    ...defaults,
    snapshot: true,
    tagExtra: ['foo', 'bar'],
    tagSeparator: '@',
    tagSemver: 'skip',
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:latest -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/project@v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:project@v1.2.3 -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:1.2.3 -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello@v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:1.2.3 -t owner/image:foo -t owner/image:bar -t owner/image:20170613-044120-a0f149 ."`,
  );
});

///////////////////////////////////////////////////////////////////////////////////
test('tagSemver and semverHigher option', () => {
  const config = {
    ...defaults,
    tagSemver: 'skip',
    semverHigher: true,
  };

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/master',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(`"docker build -f Dockerfile -t owner/image:latest ."`);

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/heads/deep/branch',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(`"docker build -f Dockerfile -t owner/image:deep-branch ."`);

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/hello',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/tags/v1.2.3',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:1.2.3 -t owner/image:1.2 -t owner/image:1 ."`,
  );

  expect(
    createBuildCommand(config, {
      tags: createTags(config, {
        ref: 'refs/pull/24/merge',
        sha: 'a0f1490a20d0211c997b44bc357e1972deab8ae3',
      }).tags,
    }),
  ).toMatchInlineSnapshot(
    `"docker build -f Dockerfile -t owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 ."`,
  );
});
