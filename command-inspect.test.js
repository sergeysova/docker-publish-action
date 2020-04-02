const { createInspectCommand } = require('./command-inspect');

test('it works with one tag', () => {
  expect(createInspectCommand({}, { tags: ['owner/image:version'] })).toMatchInlineSnapshot(
    `"docker inspect --format=\\"{{index .RepoDigests 0}}\\" owner/image:version"`,
  );
});

test('it works with many tags', () => {
  expect(
    createInspectCommand(
      {},
      {
        tags: [
          'owner/name:tag',
          'docker.pkg.github.com/owner/repo/image:version',
          'owner/name:1.2.3-alpha',
        ],
      },
    ),
  ).toMatchInlineSnapshot(
    `"docker inspect --format=\\"{{index .RepoDigests 0}}\\" owner/name:tag"`,
  );
});
