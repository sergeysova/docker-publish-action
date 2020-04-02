# Docker Publish Action

## Usage

```yaml
name: Docker Image

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Publish to Registry
        uses: sergeysova/docker-publish-action@master
        with:
          image: myDocker/repository
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
```

Checkout releases and use it instead of `@master` branch in `uses`.

## Options

### Required options

- `image`
- `username`
- `password`

```yaml
with:
  image: owner/image
  username: ${{ secrets.DOCKER_USERNAME }}
  password: ${{ secrets.DOCKER_PASSWORD }}
```

### `registry`

- Default: —

GitHub's Docker registry uses a different path format. See [Configuring Docker for use with GitHub Package Registry](https://help.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-docker-for-use-with-github-packages#publishing-a-package)

```yaml
with:
  image: owner/repository/image
  username: ${{ github.actor }}
  password: ${{ secrets.GITHUB_TOKEN }}
  registry: docker.pkg.github.com
```

### `dockerfile`

- Default: "Dockerfile"

This might be useful when you hanve multiple Dockerfiles in one repo.

```yaml
with:
  image: owner/image
  username: ${{ secrets.DOCKER_USERNAME }}
  password: ${{ secrets.DOCKER_PASSWORD }}
  dockerfile: project.Dockerfile
```

### `context`

- Default: —

Use `context` when you would like to change the Docker build context.

```yaml
with:
  image: owner/image
  username: ${{ secrets.DOCKER_USERNAME }}
  password: ${{ secrets.DOCKER_PASSWORD }}
  context: directory/of/the/context
```

### `workdir`

- Default: —

Use `workdir` when you would like to change the directory for building.

```yaml
with:
  image: owner/image
  username: ${{ secrets.DOCKER_USERNAME }}
  password: ${{ secrets.DOCKER_PASSWORD }}
  workdir: project/subdirectory
```

### `buildargs`

- Default: —

Use `buildargs` when you want to pass a list of environment variables as [build-args](https://docs.docker.com/engine/reference/commandline/build/#set-build-time-variables---build-arg). Identifiers are separated by space.
All `buildargs` will be masked, so that they don't appear in the logs.

```yaml
- name: Publish to Registry
  uses: sergeysova/docker-publish-action@master
  env:
    FOO: ${{ secrets.FOO_CONTENT }}
    BAR: AnotherSecretValue
  with:
    image: myDocker/repository
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
    buildargs: FOO BAR
```

### `buildoptions`

- Default: —

Use `buildoptions` when you want to configure [options](https://docs.docker.com/engine/reference/commandline/build/#options) for building.

```yaml
- name: Publish to Registry
  uses: sergeysova/docker-publish-action@master
  with:
    image: myDocker/repository
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
    buildoptions: '--compress --force-rm'
```

### `snapshot`

- Available values: `true` | `false`
- Default: `false`

Build image also with tag `20200405-124909-5b9727` (date-time-hash)

### `tag_extra`

- Available values: any string
- Default: —

Build an image with another tags. To set multiple use space.

If changes were on master, added tag `latest`

Example:

```yaml
with:
  tag_extra: foo

  # multiple
  tag_extra: foo bar
```

### `tag_separator`

- Available values: any string
- Default: —

Parses git tag as two parts project name and version.

Example:

```yaml
with:
  tag_separator: '@'
```

| Input                 | Parsed                                              |
| --------------------- | --------------------------------------------------- |
| `project-name@v1.2.3` | project name: `project-name`<br/> version: `v1.2.3` |
| `highway/car@demo`    | project name: `highway/car`<br/> version: `demo`    |

### `tag_semver`

- Available values: `"skip"` | `"fail"`
- Default: —

Parses git tag as semver `v1.2.3` or `1.2.3` or `1.2.3-something` and push docker tag `1.2.3`.

| Value    | Description                              |
| -------- | ---------------------------------------- |
| Default  | Do nothing with tag                      |
| `"skip"` | If tag is not a semver, do not push tag. |
| `"fail"` | If tag is not a semver, fail the build.  |

If used with **`tag_separator`** parses version as semver:

| Input                 | Version       |
| --------------------- | ------------- |
| `demo@v0.1.2`         | `1.2.3`       |
| `my-name@1.2.3-alpha` | `1.2.3-alpha` |

Example:

```yaml
with:
  tag_semver: skip
```

### `semver_higher`

- Requires: `tag_semver`
- Available values: `true` | `false`
- Default: `false`

Also push tags with higher version updates.

| Input                 | Tags                 |                    |              |            |          |
| --------------------- | -------------------- | ------------------ | ------------ | ---------- | -------- |
| `v1.2.3`              | `1.2.3`              | `1.2`              | `1`          |
| `v1.2.3-alpha`        | `1.2.3-alpha`        | `1.2-alpha`        | `1-alpha`    |
| `v1.2.3-beta.1-int.2` | `1.2.3-beta.1-int.2` | `1.2.3-beta.1-int` | `1.2.3-beta` | `1.2-beta` | `1-beta` |
| `v1.2.3-4.5.6`        | `1.2.3-4.5.6`        | `1.2.3-4.5`        | `1.2.3-4`    | `1.2-4`    | `1-4`    |

Example:

```yaml
with:
  semver_higher: true
```

## ToDo

- [ ] `cache` to build only changed layers for big docker images
- [ ] `projectAppend` append project from tag with separator to image name
- [ ] Pass password to `docker login` with `--password-stdin` when applicable
- [ ] Check that dockerfile, context and workdir is present

## Reading

- [Actions versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
