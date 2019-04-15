# AdEng Jenkins CLI

Base:

- https://github.com/Bielik20/outside-cli
- https://github.com/Bielik20/git-cli

Resources:

- https://github.com/sindresorhus/awesome-nodejs

## How to install

- `npm i -g adeng-jenkins-cli --registry https://artifactory.wikia-inc.com/artifactory/api/npm/wikia-npm/`

## Development Guide

- `npm ci`
- `npm link` - it will link package so it will be available globally
- `npm run build -- --watch` - it will compile files to dist directory

## Publish Guide

- get your api key [here](https://wikia-inc.atlassian.net/wiki/spaces/GEN/pages/110592255/Artifactory+-+Internal+package+repositories)
- `npm login`
  - username: your wikia user name
  - password: api key
- `npm publish`
