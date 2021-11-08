# Nylas Contact List

Nylas Contact List (`<nylas-contact-list>`) is part of the Nylas Components library that lets you build user-facing contact functionality into your application in minutes. Use Nylas Contact List with your Nylas account or by passing in your own JSON data.

![Nylas Contact List example](https://nylas-static-assets.s3-us-west-2.amazonaws.com/public-documentation/contact_list_gif.gif)

## Table of Contents

- [Installation](#installation)
- [Using It in Your App](#using-it-in-your-app)
- [Contributing](#contributing)
- [Additional Documentation](#additional-documentation)

## Installation

In your JavaScript application, you can install Nylas Contact List with:

- npm `npm i @nylas/components-contact-list`
- Yarn `yarn add npm i @nylas/components-contact-list`

Alternatively, on an html page, you can load the Contact List using a script tag:

```
   <head>
      <!-- Import the script from CDN -->
      <script src="https://unpkg.com/@nylas/components-contact-list"></script>
    </head>
```

For both installation options, in the body of your page, you can instantiate the contact list with `<nylas-contact-list></nylas-contact-list>`.

## Using It in Your App

All Nylas components have two ways of dislaying data to your end-user:

1. [Fetching data directly from Nylas](#fetching-data-directly-from-nylas)
2. [Passing in your own data](#passing-in-your-own-data)

### Fetching data directly from Nylas

#### Setup

If you haven't registered for a Nylas account yet, you can do so at dashboard.nylas.com. Once there, head to the **Components** tab and create a new Contact List component.

You'll be guided through the component setup and be given the option to tie your component to your calendar account. Review the [Contact List Documentation](https://developer.nylas.com/docs/user-experience/components/contact-list-component/).

#### Allowed domains

During the setup process, you'll be prompted to provide a list of [allowed domains](https://developer.nylas.com/docs/user-experience/components/contact-list-component/#allowed-domains). Be sure to add any domains you'll be testing your app on, including `localhost`, and any staging and production URLs you might use.

### Passing in your own data

Nylas Contact List can be used as a UI on top of any contacts that you provide. Events should follow the [Nylas contacts object standard](https://developer.nylas.com/docs/api/#tag--Contacts--contact-object).

The property to use for this is `contacts`. You can pass in an JSON array of contacts.

```json
  const staticContacts = [
    {
      "emails": [
        {
          "email": "tom@brightideas.com"
        }
      ],
      "given_name": "Thomas Edison"
    },
    {
      "emails": [
        {
          "email": "alex@bell.com"
        }
      ],
      "given_name": "Alexander Graham Bell"
    },
    {
      "emails": [
        {
          "email": "al@particletech.com"
        }
      ],
      "given_name": "Albert Einstein"
    }
  ];
```

Then pass the array into your component using any JavaScript.

```js
<nylas-contact-list contacts={staticContacts}>
```

You can also use plain JavaScript as an attribute.

```js
document.querySelector("nylas-contact-list").contacts = staticContacts;
```

### Properties

Nylas Contact List allows for several properties that affect the layout and functionality of your component. You can find a complete list of properties within our [Documentation for Nylas Contact List](https://developer.nylas.com/docs/user-experience/components/contact-list-component/#customization)

### Events and Callbacks

You can listen to certain user events from your application by adding an event listener to your component.

For example, you can listen for a `contactClicked` event with the following code:

```js
document
  .querySelector("nylas-contact-list")
  .addEventListener("contactClicked", (event) => {
    let { detail } = event;
    console.log("contact clicked", detail);
  });
```

## Contributing

Please refer to our [Contributing Guidelines](CONTRIBUTING.md) for information about how to get involved. We welcome bug reports, questions, and pull requests.

1. Git clone `git@github.com:nylas/components.git`
2. Run `yarn install`
3. Run `yarn start`; your browser will load `http://localhost:8000` and show you a list of available running components

### Testing

`yarn cy:open` will launch our end-to-end tests in a browser
tests will automatically be run on push from push.yaml

## Additional Documentation

- [Nylas Contact List on NPM](https://www.npmjs.com/package/@nylas/components-contact-list)
- [Nylas Docs: Contact List Component](https://developer.nylas.com/docs/user-experience/components/contact-list-component/)
