# Material Components Web (MDC Web)

This package has been forked from the original Google project [material-components-web](https://github.com/material-components/material-components-web).

All the internal imports have been transformed to relative to make importing the library easier, without the need of adding `includePath` to the SASS compiler options.

## Installation

```bash
npm install @nicolabello/material-components-web
```

or

```bash
yarn add @nicolabello/material-components-web
```

## Usage

### Including the Sass

The default icons and typography require to include [Material Design Icons](https://material.io/resources/icons) and [Roboto font](https://fonts.google.com/specimen/Roboto)

```scss
// Material design icons
@import "https://fonts.googleapis.com/icon?family=Material+Icons";

// Roboto font
@import "https://fonts.googleapis.com/css?family=Roboto:300,400,500";
```

To import the style for all the available components do as following

```scss
// All components
@use "~@nicolabello/material-components-web/styles";
```

To import only the style for specific components do as following

```scss
// Button
@use "~@nicolabello/material-components-web/button/mdc-button";

// Chips
@use "~@nicolabello/material-components-web/chips/mdc-chips";
```

To access variables, mixins and functions do as following

```scss
// All components variables, mixins and functions
@use "~@nicolabello/material-components-web/members";

// Button variables, mixins and functions
@use "~@nicolabello/material-components-web/button";

.my-class {
  height: members.$button-height;
  // Equivalent to
  height: button.$height;
}

.my-other-clss{
  @include members.button-ink-color(red);
  // Equivalent to
  @include button.ink-color(red);
}
```

If you are unfamiliar with the syntax, read about [Sass Modules](https://sass-lang.com/blog/the-module-system-is-launched).

Please note: the `~` at the start of the imports paths tells the Webpack loader to resolve the import from the `node_modules` path.

### Including the JavaScript

```js
import { MDCCheckbox } from '@nicolabello/material-components-web';
const checkbox = new MDCCheckbox(document.querySelector('.mdc-checkbox'));
```

## Documentation

For more documentation please refer to the original repo's [readme](https://github.com/material-components/material-components-web#readme).

Please note that the imports in the documentation must be replaced as following:

- `@material/` -> `~@nicolabello/material-components-web/` for Sass imports
- `@material/` -> `@nicolabello/material-components-web/` for JavaScript and TypeScript imports
