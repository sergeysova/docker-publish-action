const { createPullCommands } = require('./command-pull');

test('it works with one tag', () => {
  expect(createPullCommands({}, { tags: ['owner/name:tag'] })).toMatchInlineSnapshot(`
    Array [
      "docker pull \\"owner/name:tag\\"",
    ]
  `);
});
test('it works with one tag', () => {
  expect(
    createPullCommands(
      {},
      {
        tags: [
          'owner/name:tag',
          'docker.pkg.github.com/owner/repo/image:version',
          'owner/name:1.2.3-alpha',
        ],
      },
    ),
  ).toMatchInlineSnapshot(`
    Array [
      "docker pull \\"owner/name:tag\\"",
      "docker pull \\"docker.pkg.github.com/owner/repo/image:version\\"",
      "docker pull \\"owner/name:1.2.3-alpha\\"",
    ]
  `);
});
test('it works with one tag', () => {
  expect(
    createPullCommands(
      {},
      {
        tags: [
          'owner/name:tag',
          'docker.pkg.github.com/owner/repo/image:version',
          'owner/name:1.2.3-alpha',
        ],
      },
    ),
  ).toMatchInlineSnapshot(`
    Array [
      "docker pull \\"owner/name:tag\\"",
      "docker pull \\"docker.pkg.github.com/owner/repo/image:version\\"",
      "docker pull \\"owner/name:1.2.3-alpha\\"",
    ]
  `);
});
