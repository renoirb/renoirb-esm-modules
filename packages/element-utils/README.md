# Element Utils

Helper functions for Web Component registration and common DOM operations.

```javascript
import { registerCustomElement } from 'https://renoirb.com/esm-modules/element-utils/browser.mjs'
```

## More To Come

### Patterns To Re-Use between Web Components

Particularily what's related to Form, Palpable and Web Components (CustomElements)

#### In Lightning Web Component

- Accessibility, including what's related to [Focus](https://lwc.dev/guide/accessibility#focus) and `delegateFocus`
- [Event Propagation between Shadow](https://lwc.dev/guide/events#configure-event-propagation)
- [ElementInternals](https://lwc.dev/guide/custom_forms) — Fast also has notes too.

```ts
export default class extends LightningElement {
  constructor() {
    super();
    const internals = this.attachInternals();
    internals.role = "button";
    internals.ariaLabel = "My button";
  }
}
```

#### In Microsoft Fast

They have a great code base and there's a few utilities that's needed for handling CustomElement states

- [Setting display CSS helper](https://github.com/microsoft/fluentui/blob/7844b293/packages/web-components/src/utils/display.ts)
- Coercers [isHiddenElement, isFocussableElement, ...](https://github.com/microsoft/fluentui/blob/master/packages/web-components/src/utils/focusable-element.ts)
- [Palpable](https://html.spec.whatwg.org/dev/dom.html#palpable-content-2) (focus, focusout, input)
  [state handling](https://github.com/microsoft/fluentui/blob/7844b293/packages/web-components/src/utils/display.ts),
  [toggleState, swapStates](https://github.com/microsoft/fluentui/blob/7844b293/packages/web-components/src/utils/element-internals.ts)
- [autofocus, focusinhandler, inputHandler, keydownHandler](https://github.com/microsoft/fluentui/blob/7844b293/packages/web-components/src/text-input/text-input.ts#L467)
- Proper [click, keydown](https://github.com/microsoft/fluentui/blob/master/packages/web-components/src/link/link.template.ts#L12-L13),
  [keypress](https://github.com/microsoft/fluentui/blob/7844b293/packages/web-components/src/button/button.ts#L344-L355) handler
  ([also](https://github.com/microsoft/fluentui/blob/master/packages/web-components/src/listbox/listbox.ts#L146-L154),
  [and that](https://github.com/microsoft/fluentui/blob/master/packages/web-components/src/text-input/text-input.ts))

#### In WHATWG

- [Creating a form-associated custom element](https://html.spec.whatwg.org/dev/custom-elements.html#custom-elements-face-example)
- [Creating a custom element with default accessible roles, states, and properties](https://html.spec.whatwg.org/dev/custom-elements.html#custom-elements-accessibility-example)


##### Particularly about: [Drawbacks of autonomous custom elements](https://html.spec.whatwg.org/dev/custom-elements.html#custom-elements-autonomous-drawbacks)

That I want to be handled right.

Quoting WHATWG:

> As specified below, and alluded to above, simply defining and using an element called taco-button does not mean that such elements represent buttons.
> That is, tools such as web browsers, search engines, or accessibility technology will not automatically treat the resulting element as a button just based on its defined name.
>
> To convey the desired button semantics to a variety of users, while still using an autonomous custom element, a number of techniques would need to be employed:

So we should have proper state transition and management and things to do when it's being interacted with
(not only "click"! — An [activation](https://html.spec.whatwg.org/dev/interaction.html#activation)),
including [focus](https://html.spec.whatwg.org/dev/interaction.html#focus).

Again, from WHATWG:

```js
class TacoButton extends HTMLElement {
  static observedAttributes = ["disabled"];

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = "button";

    this.addEventListener("keydown", e => {
      if (e.code === "Enter" || e.code === "Space") {
        this.dispatchEvent(new PointerEvent("click", {
          bubbles: true,
          cancelable: true
        }));
      }
    });

    this.addEventListener("click", e => {
      if (this.disabled) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });
    // ...
  }

  connectedCallback() {
    this.setAttribute("tabindex", "0");
    // ...
  }

  // ...

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(flag) {
    this.toggleAttribute("disabled", Boolean(flag));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.disabled) {
      this.removeAttribute("tabindex");
      this._internals.ariaDisabled = "true";
    } else {
      this.setAttribute("tabindex", "0");
      this._internals.ariaDisabled = "false";
    }
  }
}
```