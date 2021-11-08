# Nylas Composer

Nylas Composer (`<nylas-composer>`) is part of the Nylas Components library that lets you build email-send functionality into your application in minutes. Use Nylas Composer with your Nylas account or by passing in your own JSON data.

![Nylas Composer example](https://nylas-static-assets.s3-us-west-2.amazonaws.com/public-documentation/composer_gif_1.gif)

## Table of Contents

- [Nylas Composer](#nylas-composer)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Using It in Your App](#using-it-in-your-app)
    - [Fetching data directly from Nylas](#fetching-data-directly-from-nylas)
      - [Setup](#setup)
      - [Allowed domains](#allowed-domains)
    - [Passing in your own data](#passing-in-your-own-data)
    - [Properties](#properties)
    - [Events and Hooks](#events-and-hooks)
  - [Contributing](#contributing)
    - [Testing](#testing)
  - [Additional Documentation](#additional-documentation)

## Installation

In your JavaScript application, you can install Nylas Composer with:

- npm `npm i @nylas/components-composer`
- Yarn `yarn add npm i @nylas/components-composer`

Alternatively, on an html page, you can load the Composer using a script tag:

```
   <head>
      <!-- Import the script from CDN -->
      <script src="https://unpkg.com/@nylas/components-composer"></script>
    </head>
```

For both installation options, in the body of your page, you can instantiate the composer with `<nylas-composer></nylas-composer>`.

## Using It in Your App

All Nylas components have two ways of dislaying data to your end-user:

1. [Fetching data directly from Nylas](#fetching-data-directly-from-nylas)
2. [Passing in your own data](#passing-in-your-own-data)

### Fetching data directly from Nylas

#### Setup

If you haven't registered for a Nylas account yet, you can do so at dashboard.nylas.com. Once there, head to the **Components** tab and create a new Composer component.

You'll be guided through the component setup and be given the option to tie your component to your calendar account. Review the [Composer Documentation](https://developer.nylas.com/docs/user-experience/components/composer-component/).

#### Allowed domains

During the setup process, you'll be prompted to provide a list of [allowed domains](https://developer.nylas.com/docs/user-experience/components/composer-component/#allowed-domains). Be sure to add any domains you'll be testing your app on, including `localhost`, and any staging and production URLs you might use.

### Passing in your own data

Nylas Composer can be used as a UI on top of your own send hooks. Use [Custom Callbacks](https://developer.nylas.com/docs/user-experience/components/composer-component/#custom-callbacks) to determine **send** and other functionality.

### Properties

Nylas Composer allows for several properties that affect the layout and functionality of your component. You can find a complete list of properties within our [Documentation for Nylas Composer](https://developer.nylas.com/docs/user-experience/components/composer-component/#customization)

### Events and Hooks

You can listen to certain user events from your application by adding an event listener to your component.

For example, you can listen for a `composerMinimized` event with the following code:

```js
document
  .querySelector("nylas-composer")
  .addEventListener("composerMinimized", (event) => {
    let { detail } = event;
    console.log("composer minimized", detail);
  });
```

You can also pass in custom hooks that allow you to add functionality in response to certain end-user events. Read more about [Composer Custom Hooks](https://developer.nylas.com/docs/user-experience/components/composer-component/#custom-hooks) or [Try our custom hooks demo app](https://codesandbox.io/s/nylas-composer-custom-callbacks-ommji?file=/index.html)

## Contributing

Please refer to our [Contributing Guidelines](CONTRIBUTING.md) for information about how to get involved. We welcome bug reports, questions, and pull requests.

1. Git clone `git@github.com:nylas/components.git`
2. Run `yarn install`
3. Run `yarn start`; your browser will load `http://localhost:8000` and show you a list of available running components

### Testing

`yarn cy:open` will launch our end-to-end tests in a browser
tests will automatically be run on push from push.yaml

## Additional Documentation

- [Nylas Composer on NPM](https://www.npmjs.com/package/@nylas/components-composer)
- [Nylas Docs: Composer Component](https://developer.nylas.com/docs/user-experience/components/composer-component/)
