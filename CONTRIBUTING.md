# Contributing

Thank you for considering to contribute! :speech_balloon:


## Bugs :bug:

1. Search the issue tracker for similar bug reports before submitting a new one.
2. Specify the version of the library where the bug occurred.
3. Specify your browser version, operating system, and graphics card  
   (e.g. `Chrome 60.0.3112.113 (64-bit), Windows 10 (64-bit), NVIDIA GTX 1050`).
4. Describe the problem in detail. Explain what happened, and what you expected would happen.
5. Provide a minimal test case (http://jsfiddle.net) or a link to a live version of your application.
6. If helpful, include a screenshot. Annotate the screenshot for clarity.


## Pull Request Process :sparkles:

When contributing to this repository, please first discuss the change you wish to make with the owners of this repository via the issue tracker.
A proposed change should be focused and concise. Do not include generated build files in your commits.

1. Create a feature branch.
2. Implement your patch or feature on that branch. Maintain the existing coding style.
3. Lint and test your changes.
3. Add unit tests for any new or changed functionality.
3. Navigate to your fork on Github, select your feature branch and create a new Pull Request.
4. Once your PR has been merged, you can safely remove your feature-branch.


### Development :wrench:

This project contains Grunt tasks that will help you during development. You have two options that allow you to use them:

1. Install the [Grunt CLI](https://github.com/gruntjs/grunt-cli) globally. Grunt tasks can then be executed with `grunt [task]`.
2. Use a copy of [this grunt runner](https://gist.github.com/vanruesc/b9e8d8a5b749ab83958aecce890297b3#file-grunt-cli-js).
   Grunt tasks can then be executed with `node grunt-cli.js [task]`.

The following table provides an overview of the relevant tasks:

| Task       | Description                           |
|------------|---------------------------------------|
|            | The default task `build, nodeunit`    |
| build      | Alias for `eslint, rollup`            |
| build:lib  | Alias for `eslint:lib, rollup:lib`    |
| build:demo | Alias for `eslint:demo, rollup:demo`  |
| test       | Alias for `eslint, nodeunit`          |
| eslint     | Checks source files for syntax errors |
| nodeunit   | Runs unit tests                       |
| rollup     | Builds the library and demo bundle    |

__Note__: Using the `--production` flag enables source code transpilation and bundle minification which considerably slows down the build process.


### Testing :heavy_check_mark:

First, install the [http-server](https://github.com/indexzero/http-server) using `npm install -g http-server` to conveniently run things locally.

Navigate to the project's root folder and start the server with the command `hs`. Open your web browser and navigate to http://localhost:8080/demo/index.debug.html.
Please note that the default `index.html` will load the minified demo bundle which is _not_ desirable during development.

__Hint__: Open the development tools in your browser and make sure that the browser cache is disabled while it's open.


### Keeping Things Up-To-Date :hourglass:

Don't merge new changes from upstream into your feature branch.
Instead, use `rebase` to replay all of your commits on top of the latest code base:

```sh
git checkout master
git pull upstream master
git checkout my-feature
git rebase master
```

Git will guide you through the process of resolving conflicts.
This operation is similar to merging, except you're in fact rewriting your local history.
After rebasing, you'll need to use `git push --force my-feature`.

You can add more commits to your feature branch after you created the PR.
This means that you can change things later if necessary.
