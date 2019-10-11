# Welcome!

Hello, and welcome to the app! This is a hobby project and I'm still figuring out how to best code well with others. So if you have any questions / comments / concerns feel free to reach out to me. You are welcome to help out however you wish.

## Getting Started
- Have both `node` and `yarn` installed. You can use npm instead of yarn of course but I'll pretend you're using yarn.
- Make sure you have Factorio installed (app currently isn't smart enough to work without it)
- Fork the repository and get it on your computer however you wish
- Run `yarn install` while in the repository to initialize the project
- Run `yarn run dev` or `yarn run debug` to start the app. If using debug mode, you can open a web browser on `http://localhost:9223` to access the dev inspector for the app

## Making Changes
- All work is based on develop, master branch is reserved for code that is ready to have a release made
- Create a new branch with your work on it, based on develop or another sub branch of your choice
- Please make sure your code is linted (I'm using [Standard.js](https://standardjs.com/) and [Vue](https://vuejs.github.io/eslint-plugin-vue/) rules).  
If your code editor is configured for it, linting will be done automatically, otherwise you can run `yarn run lint` to check your code or `yarn run lint:fix` to let lint try to automatically fix errors
- To test your code, you can run the commands `yarn run test` or `yarn test:coverage`. Using the coverage option will generate a coverage report that can be viewed by opening the `index.html` file in a browser, found at `test/unit/coverage/lcov-report`
  - All tests go in the `test/unit/specs` folder. My plan is not to do e2e testing but unit test library functions that will be used in the renderer or main process
