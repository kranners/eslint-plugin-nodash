# eslint-plugin-nodash

Plugin for finding unnecessary usages of Lodash.

Why such a Lodash hater? [Read my rant here](https://docs.cute.engineer/Opinion/Don't%20Use%20Lodash.html#don-t-use-lodash)!

### Installation

1. Install using your favourite Node package manager
```shell
$ npm install -D eslint-plugin-nodash
```

2. Add nodash to your ESLint config
```js
import nodash from "eslint-plugin-nodash";

export default [
  {
    plugins: { nodash },
    rules: {
      "nodash/unnecessary-use-of-get": "error",
      "nodash/unnecessary-mapping-function": "error",
    },
  }
];
```

3. Done 🎉!

### Local Setup

Install [Nix](https://nix.dev/install-nix) and [nix-direnv](https://github.com/nix-community/nix-direnv), then:
```shell
$ direnv allow
$ npm install
```

