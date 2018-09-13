# pgb-cli  <a href=https://www.npmjs.com/package/pgb-cli><img alt=npm src=https://badge.fury.io/js/pgb-cli.svg></a>
This is a nodejs CLI module to access [PhoneGap Build](https://build.phonegap.com).

The CLI can be installed by

```bash
> yarn global add pgb-cli

or

> npm install -g pgb-cli

or

> brew tap phonegap-build/build
> brew install bash-completion or zsh-completions # only required for command completion
> brew install pgb
```

If you don't have (or don't want) node installed you can download executables for Mac OSX, Linux and Windows [here](https://github.com/phonegap-build/pgb-cli/releases/latest)

Here is a snippet of some common actions:

```bash

# list your apps
> pgb ls

# create a new app from a github repo
> pgb new shazamable/repoodly

# create a new app from a directory
> pgb new . --ios-key 12 --share true --debug true --ignore node_modules,tmp,test,**/*.log
```

Here is the full list of commands:

```
Usage: pgb [OPTIONS] COMMAND [arg...]
       pgb [ --help | -? | --version | -v ]

Options:

  -d, --debug       Enable debug mode
  -f, --force       Skip confirmation
  -j, --json        Print raw json
  --no-progress     Don't show progress
  -c, --no-colours  Don't use colors
  -v, --version     Print version
  -?, --help        Print usage
  -b, --bare        Print numerical ids

Commands:

  app               Show information about an app
  build             Build an app
  clone             Shortcut to update and build a repo backed app
  download          Download an app package
  lock              Lock a signing key
  log               Show a build log
  login             Sign in to PhoneGap Build
  logout            Sign out of PhoneGap Build
  ls                List your apps
  key               Show information about a signing key
  keys              List your signing keys
  new               Create an app from a repository, file or directory
  new-key           Create a signing key
  phonegaps         List supported versions of PhoneGap
  rm                Delete an app
  rm-key            Delete a signing key
  unlock            Unlock a signing key
  update            Update an app
  update-key        Update a signing key
  whoami            Show signed in user

Run 'pgb COMMAND --help' for more information on a command
```

If you find a bug or have a feature request tell me about it [here](https://github.com/phonegap-build/pgb-cli/issues).

Follow me on twitter **@brettrudd**
