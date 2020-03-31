# Material Components Web (MDC Web)

This package has been forked from the original Google project [material-components-web](https://github.com/material-components/material-components-web).

All the internal imports have been transformed to relative to make importing the library easier, without the need of adding `includePath` to the SASS compiler options.

## Installation

```
npm install @nicolabello/material-components-web
```

or

```
yarn add @nicolabello/material-components-web
```

## Usage

### Including the Sass

```scss
@use "~@nicolabello/material-components-web/material-components-web";
```

The `~` at the start of the path tells the Webpack loader to resolve the import from the `node_modules` path.

### Including the Javascript

```js
import * as mdc from '@nicolabello/material-components-web';
const checkbox = new mdc.checkbox.MDCCheckbox(document.querySelector('.mdc-checkbox'));
// OR
import {checkbox} from '@nicolabello/material-components-web';
const checkbox = new checkbox.MDCCheckbox(document.querySelector('.mdc-checkbox'));
```

## Documentation

For more documentation please refer to the [original repo readme](https://github.com/material-components/material-components-web#readme) and to the [official documentation](https://material.io/develop/web).

Please note that all the imports in the format `@material/` must be replaced with `~@nicolabello/material-components-web/components/`.
