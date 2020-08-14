const { getCommands } = require('./commands');
const { createTags } = require('./tags');
const { assign } = require('./config');

const common = {
  ...assign({
    image: 'owner/image',
    username: 'username',
    password: 'password',
    workdir: '.',
  }),
};

const ref = 'refs/heads/master';
const sha = 'a0f1490a20d0211c997b44bc357e1972deab8ae3';

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

test('registry option', () => {
  const config = { ...common, registry: 'docker.pkg.github.com' };
  const commands = getCommands({
    tags: createTags(config, { ref, sha }).tags,
    config,
  });
  expect(stringify(commands)).toMatchInlineSnapshot(`
    Array [
      "> docker login -u username -p password docker.pkg.github.com  { cwd: . }",
      "$ docker pull \\"docker.pkg.github.com/owner/image:latest\\"  { cwd: . }",
      "> docker build -f Dockerfile -t docker.pkg.github.com/owner/image:latest .  { cwd: . }",
      "> docker push \\"docker.pkg.github.com/owner/image:latest\\"  { cwd: . }",
      "> docker inspect --format=\\"{{index .RepoDigests 0}}\\" docker.pkg.github.com/owner/image:latest  { cwd: . }",
    ]
  `);
});

describe('pr', () => {
  it('pushes as sha', () => {
    const commands = getCommands({
      tags: createTags(common, { ref: 'refs/pull/24/merge', sha }).tags,
      config: common,
    });
    expect(stringify(commands)).toMatchInlineSnapshot(`
      Array [
        "> docker login -u username -p password   { cwd: . }",
        "$ docker pull \\"owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3\\"  { cwd: . }",
        "> docker build -f Dockerfile -t owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 .  { cwd: . }",
        "> docker push \\"owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3\\"  { cwd: . }",
        "> docker inspect --format=\\"{{index .RepoDigests 0}}\\" owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3  { cwd: . }",
      ]
  `);
  });

  it('pushes with tagExtra as two tags', () => {
    const config = { ...common, tagExtra: ['pr'] };
    const commands = getCommands({
      tags: createTags(config, { ref: 'refs/pull/24/merge', sha }).tags,
      config,
    });
    expect(stringify(commands)).toMatchInlineSnapshot(`
      Array [
        "> docker login -u username -p password   { cwd: . }",
        "$ docker pull \\"owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3\\"  { cwd: . }",
        "$ docker pull \\"owner/image:pr\\"  { cwd: . }",
        "> docker build -f Dockerfile -t owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 -t owner/image:pr .  { cwd: . }",
        "> docker push \\"owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3\\"  { cwd: . }",
        "> docker push \\"owner/image:pr\\"  { cwd: . }",
        "> docker inspect --format=\\"{{index .RepoDigests 0}}\\" owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3  { cwd: . }",
      ]
  `);
  });

  it('pushes with tagExtra and snapshot as three tags', () => {
    const config = { ...common, tagExtra: ['pr'], snapshot: true };
    const commands = getCommands({
      tags: createTags(config, { ref: 'refs/pull/24/merge', sha }).tags,
      config,
    });
    expect(stringify(commands)).toMatchInlineSnapshot(`
      Array [
        "> docker login -u username -p password   { cwd: . }",
        "$ docker pull \\"owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3\\"  { cwd: . }",
        "$ docker pull \\"owner/image:pr\\"  { cwd: . }",
        "$ docker pull \\"owner/image:20170613-044120-a0f149\\"  { cwd: . }",
        "> docker build -f Dockerfile -t owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3 -t owner/image:pr -t owner/image:20170613-044120-a0f149 .  { cwd: . }",
        "> docker push \\"owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3\\"  { cwd: . }",
        "> docker push \\"owner/image:pr\\"  { cwd: . }",
        "> docker push \\"owner/image:20170613-044120-a0f149\\"  { cwd: . }",
        "> docker inspect --format=\\"{{index .RepoDigests 0}}\\" owner/image:a0f1490a20d0211c997b44bc357e1972deab8ae3  { cwd: . }",
      ]
  `);
  });
});

it('pushes tags to same tags', () => {
  const commands = getCommands({
    tags: createTags(common, { ref: 'refs/tags/release-example', sha }).tags,
    config: common,
  });
  expect(stringify(commands)).toMatchInlineSnapshot(`
    Array [
      "> docker login -u username -p password   { cwd: . }",
      "$ docker pull \\"owner/image:release-example\\"  { cwd: . }",
      "> docker build -f Dockerfile -t owner/image:release-example .  { cwd: . }",
      "> docker push \\"owner/image:release-example\\"  { cwd: . }",
      "> docker inspect --format=\\"{{index .RepoDigests 0}}\\" owner/image:release-example  { cwd: . }",
    ]
  `);
});

it('add cache', () => {
  const config = { ...common, cache: true };
  const commands = getCommands({
    tags: createTags(config, { ref, sha }).tags,
    config,
  });
  expect(stringify(commands)).toMatchInlineSnapshot(`
    Array [
      "> docker login -u username -p password   { cwd: . }",
      "$ docker pull \\"owner/image:latest\\"  { cwd: . }",
      "> docker build -f Dockerfile --pull --cache-from owner/image:latest -t owner/image:latest .  { cwd: . }",
      "> docker push \\"owner/image:latest\\"  { cwd: . }",
      "> docker inspect --format=\\"{{index .RepoDigests 0}}\\" owner/image:latest  { cwd: . }",
    ]
  `);
});

it('registry, dockerfile, tagExtra and cache', () => {
  const config = { ...common, dockerfile: 'builder.Dockerfile', tagExtra: ['1.45.2'], cache: true };
  const commands = getCommands({
    tags: createTags(config, { ref, sha }).tags,
    config,
  });
  expect(stringify(commands)).toMatchInlineSnapshot(`
    Array [
      "> docker login -u username -p password   { cwd: . }",
      "$ docker pull \\"owner/image:latest\\"  { cwd: . }",
      "$ docker pull \\"owner/image:1.45.2\\"  { cwd: . }",
      "> docker build -f builder.Dockerfile --pull --cache-from owner/image:latest -t owner/image:latest -t owner/image:1.45.2 .  { cwd: . }",
      "> docker push \\"owner/image:latest\\"  { cwd: . }",
      "> docker push \\"owner/image:1.45.2\\"  { cwd: . }",
      "> docker inspect --format=\\"{{index .RepoDigests 0}}\\" owner/image:latest  { cwd: . }",
    ]
  `);
});

function stringify(commands) {
  return commands.map(([command, args, options, { safe }]) =>
    [safe ? '$' : '>', command, args.join(' '), objectToString(options)].join(' '),
  );
}

function objectToString(object) {
  const pairs = [...Object.entries(object)].map(([key, value]) => `${key}: ${value}`).join(', ');
  return `{ ${pairs} }`;
}
