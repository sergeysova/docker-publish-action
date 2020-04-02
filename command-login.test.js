const { createLoginCommand } = require('./command-login');

test('it works with login and password', () => {
  expect(
    createLoginCommand({ username: 'sergeysova', password: 'mysuperpassword' }),
  ).toMatchInlineSnapshot(`"docker login -u sergeysova -p mysuperpassword"`);
});
