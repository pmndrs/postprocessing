# Contributing

Thank you for considering to contribute! :speech_balloon:


## Bugs :bug:

1. Search the issue tracker for similar bug reports before submitting a new one.
2. Specify the version of the library where the bug occurred.
3. Specify your browser version, operating system, and graphics card  
   (e.g. `Chrome 0.0.0.0 (64-bit), Windows 10 (64-bit), NVIDIA GTX 1050`).
4. Describe the problem in detail. Explain what happened, and what you expected would happen.
5. Provide a minimal test case (http://jsfiddle.net) or a link to a live version of your application.
6. If applicable, include a screenshot. Consider annotating the screenshot for clarity.


## Pull Request Process :sparkles:

When contributing to this repository, please first discuss the changes you wish to make with the owners of this repository via the issue tracker.
A proposed change should be focused and concise. Please adhere to the following guideline:

1. Create a feature branch based on the `dev` branch.
2. Implement your patch or feature on that branch.
3. Lint and test your changes. Maintain the existing coding style.
3. Add unit tests for any new or changed functionality.
3. Navigate to your fork on Github, select your feature branch and create a new Pull Request targeting the `dev` branch.
4. Once your PR has been merged, you can safely remove your feature-branch.


### Development :wrench:

This project contains scripts that will help you during development. All scripts can be executed with `npm run [script]`.
The following table provides an overview of the most important scripts:

| Task  | Description                                                  |
|-------|--------------------------------------------------------------|
| build | Builds and minifies all bundles.                             |
| watch | Lints source files, builds the demo and listens for changes. |
| dev   | Runs the watch script and serves files locally.              |
| test  | Lints source files, builds all bundles and runs unit tests.  |

__Note__: Setting `NODE_ENV` to `production` enables source code minification which slows down the build process. The `build` script does this automatically.


### Testing :heavy_check_mark:

Use the script `npm run dev` to run an HTTP server, build the demo bundle and watch files for changes. Open your web browser and navigate to http://localhost:8080/demo/index.html. Extend one of the existing demos or create a new one depending on the kind of feature you wish to implement. Make sure that your changes don't break the existing demos.

__Hint__: Open the development tools in your browser and make sure that the cache is disabled while it's open.


### Keeping Things Up-To-Date :hourglass:

Don't merge new changes from upstream into your feature branch.
Instead, use `rebase` to replay all of your commits on top of the latest code base:

```sh
git checkout main
git pull upstream main
git checkout my-feature
git rebase main
```

Git will guide you through the process of resolving conflicts.
This operation is similar to merging, except you're in fact rewriting your local history.
After rebasing, you'll need to use `git push --force my-feature`.

You can add more commits to your feature branch after you created the Pull Request.
This means that you can change things later if necessary.
