const { createPushCommand } = require('./command-push');

test('it works with one tag', () => {
  expect(createPushCommand({}, { tags: ['owner/name:tag'] })).toMatchInlineSnapshot(`
    Array [
      "docker push \\"owner/name:tag\\"",
    ]
  `);
});

test('it works with many tags', () => {
  expect(
    createPushCommand(
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
      "docker push \\"owner/name:tag\\"",
      "docker push \\"docker.pkg.github.com/owner/repo/image:version\\"",
      "docker push \\"owner/name:1.2.3-alpha\\"",
    ]
  `);
});
