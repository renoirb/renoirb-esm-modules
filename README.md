# Renoir’s ECMAScript MJS Modules Published over HTTP

This repository is to write, publish, and maintain code I write in ECMAscript or
TypeScript and publish on NPM, or as an URL we can import on the Web or with
Deno.

It is currently an experiment with the idea of Monorepos techniques that I have
learned using RushJS, but this time only using Deno scripts.

The output of this repository is either to run `npm pack` and typical Node
publishing, OR write files in a directory so that I can publish over the web.

The intention is to allow, among other things, to support versioned releases to
mirror the versions I may publish on NPM. It is possible I bring back RushJS
later, but for the moment, let's see if we can make something simple.

The main goal is to have consistent and simple Web Pages and modules leveraging
Web Components and native code, the implementation here shouldn't rely on
external dependencies but they may depend between them.

For example, I want to publish a note at a given location, and it matches my
online identity, I can import a few modules and components and let the document
prioritize the contents and not its presentation.

```html
<my-cool-app-layout>
  <div>
    <notice-card variant="warn">
      <strong slot="header">Document status DRAFT</strong>
    </notice-card>
    <p>The contents of this page is currently ...</p>
  </div>
</my-cool-app-layout>

<script type="module">
  import AppLayout from 'https://renoirb.com/esm-modules/app-layout-element.mjs'
  import NoticeBox from 'https://renoirb.com/esm-modules/notice-box-element.mjs'
  import { registerCustomElement } from 'https://renoirb.com/esm-modules/element-utils.mjs'
  registerCustomElement('my-cool-app-layout', AppLayout)
  registerCustomElement('notice-card', NoticeBox)
</script>
```

This example shows how I am currently publishing modules and importing them from
web pages, I have a few others like this.

The problem is that it's currently hard to maintain and I want to be able to use
the code into other runtime environment than a browser, and I want to have
versions.

Intended usage

```html
<my-cool-app-layout>
  <div>
    <notice-card variant="warn">
      <strong slot="header">Document status DRAFT</strong>
    </notice-card>
    <p>The contents of this page is currently ...</p>
  </div>
</my-cool-app-layout>

<script type="module">
  import AppLayout from 'https://renoirb.com/esm-modules/app-layout-element@1.0.0/main.mjs'
  import NoticeBox from 'https://renoirb.com/esm-modules/notice-box-element@1.2.0/main..mjs'
  import { registerCustomElement } from 'https://renoirb.com/esm-modules/element-utils@0.4.1/main..mjs'
  registerCustomElement('my-cool-app-layout', AppLayout)
  registerCustomElement('notice-card', NoticeBox)
</script>
```

## Conventions

Each package should be written in a way to not depend on external dependencies
and allow liberty to chose which library to fill the requirement for the
feature. For example, a module that parses Markdown and will take care of
updating a section of a page can be written in such a way to allow us to receive
the markdown contents, and a way to load our own library, do the conversion, and
give back the requested information.

### Custom Elements

Each Custom Elements should be published as a simple native class extending
`HTMLElement`, we do not force a tag name to keep the liberty to import in
different other projects and be able to not change the code base we're importing
the component into.

There will probably have a need to have categories of elements, with normalized:

- Input parameters we can pass to the tag
- Events it emits and can react to
- Slot names

## Packages And Their Statuses

The following are modules I currently have code available, and will need to be
taken in charge from this present project.

### Notice Box Element

That's the simplest example, and the perfect to start with.

A simple square with an optional title, and we can insert text. We can choose
the color to use.

### Application Layout Element

The first (of probably future many) custom elements that hides away into a
native HTMLElement class that we can import, name, and use freely.

An Application Layout is essentially something we can see in many pages of the
same web site. It's the top bar, the logo, the navigation, the actions we can do
like login and logout, and all other things that a typical web site or
application has. But instead of having to re-implement the same "look and feel"
in all the same organization’s projects, let's have an importable component and
pass it in the definition of the navigation menus, other options, slots and
attach event listeners that they may emit like when clicking on a menu item.

### Content Edition Element

Probably a misnomer. But that's to allow highlighting text in a web page, and a
tooltip when we leave the cursor on it.

### Value Boolean Element

When we want to display a status icon for something that we can use an icon to
illustrate instead of a word.

```html
<dl>
  <dt>Read</dt>
  <dd><value-boolean value="true"></value-boolean></dd>
</dl>
```

The person could see equivalent of

```html
<dl>
  <dt>Read</dt>
  <dd><span label="Yes">👍</span></dd>
</dl>
```

### Context API

The bare minimum to implement the
[<abbr title="World Wide Web Consortium">W3C</abbr> Web Components Community Group](https://github.com/webcomponents-cg)
[**ContextAPI**](https://github.com/webcomponents-cg/community-protocols/blob/d81a5fb5/proposals/context.md)
[community protocol](https://github.com/webcomponents-cg/community-protocols?tab=readme-ov-file)

It might eventually contain helper functions to help more complex use cases.

At the moment, it is simply a DOM Event class

```ts
export class ContextRequestEvent extends Event {
  /**
   * @param context the context key to request
   * @param callback the callback that should be invoked when the context with the specified key is available
   * @param subscribe an optional argument, if true indicates we want to subscribe to future updates
   */
  constructor(context, callback, subscribe) {
    super('context-request', { bubbles: true, composed: true })
    this.context = context
    this.callback = callback
    this.subscribe = subscribe
  }
}
```

Using this pattern, we can make components ask for more data, we can define an
object shape and have many components make use of the same object shape.

### Markdown Content Element

A "_battery not included_" element in which we can write markdown and have it
rendered as HTML.

By _not included_, we mean that the component warns us when we have contents
inside the element, and an event will be emitted with the contents, so we can
give it back the HTML string using our favourite parser.

This is an example of a component that's using the **Context API**

```html
<kool-mark-a-dawn> # My Cool Page Hello **World** </kool-mark-a-dawn>

<script type="module">
  import { ContextRequest_MarkdownContent }, MarkdownContentElement from 'https://renoirb.com/esm-modules/markdown-content.mjs'
  import { registerCustomElement } from 'https://renoirb.com/esm-modules/element-utils.mjs'


  // Let's use this version of showdown to parse markdown
  import showdown from 'https://ga.jspm.io/npm:showdown@2.1.0/dist/showdown.js'

  // Register our elements
  registerCustomElement('kool-mark-a-dawn', MarkdownContentElement)

  // Prepare the dependencies
  const converter = new showdown.Converter()

  const handleContextRequest_MarkdownContent = (event) => {
    if (event.context === ContextRequest_MarkdownContent) {
      event.stopPropagation()
      const markdown = event.target.innerHTML
      // Assuming we've confirmed we checked it's text, let's grab the innerHTML and carry on.
      const html = converter.makeHtml(markdown)
      event.callback({ markdown, html })
    }
  }
  document.addEventListener('context-request', handleContextRequest_MarkdownContent)
</script>
```

### Load From GitHub Gist

Basically allow filling a part of a page with HTML version of a markdown file
stored as one file in a Gist.

```html
<!DOCTYPE html>
<html>
  <body>
    <article>
      <h1>Dune Chapterhouse</h1>
      <h2>The conversation between Lucilla and The Great Honored Matre</h2>
      <div id="dune-chapterhouse-lucilla-last-moments"></div>
    </article>
    <script type="module">
      import loadFromGitHub from 'https://renoirb.com/esm-modules/load-from-github.mjs'
      loadFromGitHub(
        document.querySelector('#dune-chapterhouse-lucilla-last-moments'),
        '9218acc4925d4186b3dc8920b8ab0745' /* The gists’ ID */,
        'dune-chapterhouse-lucilla-last-moments.md',
        true,
      )
    </script>
  </body>
</html>
```
