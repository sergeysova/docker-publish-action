const { createLoginCommand } = require('./command-login');

test('it works with login and password', () => {
  expect(
    createLoginCommand({ username: 'sergeysova', password: 'mysuperpassword' }),
  ).toMatchInlineSnapshot(`"docker login -u sergeysova -p mysuperpassword "`);
});

test('it works with registry', () => {
  expect(
    createLoginCommand({
      username: 'sergeysova',
      password: 'mysuperpassword',
      registry: 'my.registry.com',
    }),
  ).toMatchInlineSnapshot(`"docker login -u sergeysova -p mysuperpassword my.registry.com"`);
});
