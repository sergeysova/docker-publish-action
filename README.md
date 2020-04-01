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
          name: myDocker/repository
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
  username: ${{ secrets.GITHUB_USERNAME }}
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
image: owner/image
  username: ${{ secrets.DOCKER_USERNAME }}
  password: ${{ secrets.DOCKER_PASSWORD }}
  context: directory/of/the/context
```

### `workdir`

> Default: —

Use `workdir` when you would like to change the directory for building.

```yaml
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
    name: myDocker/repository
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
    name: myDocker/repository
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
- Default: `"latest"`

Build an image with another tags. To set multiple use space.

Example:

```yaml
tag_extra: latest

# multiple
tag_extra: latest dev
```

### `tag_separator`

- Available values: any string
- Default: —

Parses git tag as two parts project name and version.

Example:

```yaml
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

### `semver_prerelease`

- Requires: `tag_semver`
- Available values: `"cut"` | `"short"` | `"full"`
- Default: `"cut"`

Removes prerelease part from version and use only `major.minor.patch` as docker tag.

Example:

- `v1.2.3`
- `1.2.3`
- `v1.2.3-something`
- `1.2.3-beta.0`

This is all is equals docker tag `1.2.3`.

#### `semver_prerelease: short`

Ref: https://semver.org/#spec-item-10

Takes first part of prerelease version (all alphanumeric text before first dot) and appends to docker image tag. If no prerelease version, uses `major.minor.patch`

Example:

| Input               | Version       |
| ------------------- | ------------- |
| `v1.2.3-alpha`      | `1.2.3-alpha` |
| `1.2.3-alpha.1.5.3` | `1.2.3-alpha` |
| `1.2.3-4.5.6`       | `1.2.3-4`     |
| `v1.2.3`            | `1.2.3`       |

#### `semver_prerelease: full`

Append full prerelease version to docker tag. If no prerelease version, uses `major.minor.patch`.

| Input               | Version             |
| ------------------- | ------------------- |
| `v1.2.3-alpha`      | `1.2.3-alpha`       |
| `1.2.3-alpha.1.5.3` | `1.2.3-alpha.1.5.3` |
| `1.2.3-4.5.6`       | `1.2.3-4.5.6`       |
| `v1.2.3`            | `1.2.3`             |

### `semver_higher`

- Requires: `tag_semver`
- Available values: `true` | `false`
- Default: `false`

Also push tags with higher version updates.

#### with `semver_prerelease: cut` (default)

| Input          | Tags                |
| -------------- | ------------------- |
| `v1.2.3`       | `1.2.3`, `1.2`, `1` |
| `v1.2.3-alpha` | `1.2.3`, `1.2`, `1` |
| `v1.2.3-4.5.6` | `1.2.3`, `1.2`, `1` |

#### with `semver_prerelease: short`

| Input          | Tags                               |
| -------------- | ---------------------------------- |
| `v1.2.3`       | `1.2.3`, `1.2`, `1`                |
| `v1.2.3-alpha` | `1.2.3-alpha`, `1.2.3`, `1.2`, `1` |
| `v1.2.3-4.5.6` | `1.2.3-4`, `1.2.3`, `1.2`, `1`     |

#### with `semver_prerelease: full`

| Input                  | Tags |       |         |               |                 |                     |
| ---------------------- | ---- | ----- | ------- | ------------- | --------------- | ------------------- |
| `v1.2.3`               | `1`  | `1.2` | `1.2.3` |
| `v1.2.3-alpha`         | `1`  | `1.2` | `1.2.3` | `1.2.3-alpha` |
| `v1.2.3-alpha.1-hot.2` | `1`  | `1.2` | `1.2.3` | `1.2.3-alpha` | `1.2.3-alpha.1` | `1.2.3-alpha.1-hot` |
| `v1.2.3-4.5.6`         | `1`  | `1.2` | `1.2.3` | `1.2.3-4`     | `1.2.3-4.5`     | `1.2.3-4.5.6`       |

## ToDo

- [ ] `cache` to build only changed layers for big docker images

## Reading

- [Actions versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
