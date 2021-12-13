# Development Documentation

Notes on how we've developed things in this project.

## Visual customizability

One of our most important features is the ability to customize the UI of the Components. We currently support 2 implementations of this:

1. CSS Variable Fallbacks

CSS variables are the simplest way for developers to add UI customizability to the Component's. When defining an aesthetic style (color, border, etc), simply write it as an CSS variable with a fallback:

```
main {
  background-color: var(--component-background-color, blue);
}
```

Leaving the variable undefined will allow it to be defined by the user like so:

```
<nylas-component style="--component-background-color: black" />
```

2. `theme` Property

Some Components also have a theme property to let us define multiple default themes but still allow the user to create a custom theme.

```
<main class={theme ?? "a-default-theme"}>
```

```
main.a-default-theme {
  background-color: var(--component-background-color, blue);
}
```

The user can redefine the style by replacing the theme property (and therefore removing the class name) and defining new values for the variables.

```
<nylas-component theme="custom" style="--component-background-color: black" />
```
