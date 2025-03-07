/*!
 * https://renoirb.com/esm-modules/app-layout-element.mjs v1.0.0
 *
 * Maintainer: Renoir Boulanger <contribs@renoirboulanger.com>
 *
 * MIT
 *
 * 2003-2025 Renoir Boulanger
 */

/**
 * Custom Element to manage application layout (what's dressing up the page).
 *
 * This was initially worked on https://github.com/renoirb/site/ as a Vue.js
 * and then extracted the rendered HTML to make a CustomElement.
 *
 * TODO:
 * - Ensure all CSS variants are moved here.
 *
 * Time spent below is since then.
 *
 * Time spent:
 *   20230211: 2h
 *   20250307: 2h Making it as part of a monorepo
 *   20250308: 3h Build script and deploy on https://code.renoirb.com/
 */

import {
  /*                    */
  createLinkStlesheets,
} from 'https://renoirb.com/esm-modules/element-utils/browser.mjs'

const LIST_EXTERNAL_STYLE = [
  'https://renoirboulanger.com/_nuxt/vendors/app.css',
  'https://renoirboulanger.com/_nuxt/app.css',
]

const TEMPLATE = `
  <div id="__layout">
    <div class="layouts--homepage">
      <nav class="app-side-bar--component fixed z-40 w-full top">
        <div
          class="zone__sandwich__top container flex items-center justify-between py-4 mx-auto"
          style="position: relative"
        >
          <div class="app-side-bar__identity md:px-5 flex items-center">
            <button aria-label="Open Menu" class="md:hidden ml-5 mr-2">
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                class="w-8 h-8"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <div part="slot-parent-top-left">
              <slot name="top-left">
                <a
                  href="https://renoirboulanger.com/"
                  class="identity__text text-2xl"
                >
                  Renoir Boulanger
                </a>
              </slot>
            </div>
          </div>
          <div class="app-side-bar__nav flex items-center" part="slot-parent-top-right">
            <slot name="top-right">
              <div
                class="md:flex md:justify-between md:bg-transparent text-is-italicized hidden"
              >
                <a
                  href="https://renoirboulanger.com/blog/"
                  class="hover:opacity-100 opacity-80 hover:underline flex items-center p-3 px-4 py-2 mr-2 font-medium text-center rounded"
                >
                  Blog </a
                ><a
                  href="https://renoirboulanger.com/resume/as-code/"
                  class="hover:opacity-100 opacity-80 hover:underline flex items-center p-3 px-4 py-2 mr-2 font-medium text-center rounded"
                >
                  Resume </a
                ><a
                  href="https://renoirboulanger.com/hello"
                  class="hover:opacity-100 opacity-80 hover:underline flex items-center p-3 px-4 py-2 mr-2 font-medium text-center rounded"
                >
                  About
                </a>
              </div>
            </slot>
          </div>
        </div>
        <aside
          class="md:invisible app-side-bar__aside fixed top-0 left-0 visible w-64 h-full overflow-auto transition-all duration-500 ease-in-out transform -translate-x-full"
        >
          <div
            class="app-side-bar__identity flex items-center w-full h-16 p-4 border-b"
          >
            <a
              href="https://renoirboulanger.com/"
              aria-current="page"
              class="identity__text nuxt-link-exact-active nuxt-link-active"
              >Renoir Boulanger</a
            >
          </div>
          <div part="left-bottom-sidebar">
            <slot name="left-bottom-sidebar">
              <a
                href="https://renoirboulanger.com/blog"
                class="hover:bg-teal-500 hover:text-white flex items-center p-4"
                ><span class="mr-2"> Blog </span></a
              ><a
                href="https://renoirboulanger.com/projects"
                class="hover:bg-teal-500 hover:text-white flex items-center p-4"
                ><span class="mr-2"> Projects </span></a
              ><a
                href="https://renoirboulanger.com/resume"
                class="hover:bg-teal-500 hover:text-white flex items-center p-4"
                ><span class="mr-2"> Resume </span></a
              ><a
                href="https://renoirboulanger.com/hello"
                class="hover:bg-teal-500 hover:text-white flex items-center p-4"
                ><span class="mr-2"> About </span></a
              >
            </slot>
          </div>
        </aside>
      </nav>
      <main class="zone__sandwich__meat middle container mx-auto">
        <div class="grid">
          <div class="m-20">
            <div class="pages__index--parent nuxt-content" part="slot-parent-default">
              <slot>
                <p><!-- Content goes here -->&hellip;</p>
              </slot>
            </div>
          </div>
        </div>
      </main>
      <div class="app-footer--component disposition-parent w-full bottom">
        <footer
          class="zone__sandwich__bottom container flex items-center justify-between p-10 mx-auto no-print"
          style="position: relative"
        >
          <dl class="contact items-item disposition-item no-print">
            <dt class="mb-4 font-serif text-2xl">Contact</dt>
            <dd>
              <a href="https://renoirboulanger.com">Renoir Boulanger</a> ✪ Full-Stack Developer &amp; Web Hosting systems
              reliability professional
            </dd>
            <dd class="underline">
              <a rel="me" href="https://mastodon.social/@renoirb"
                >@renoirb@mastodon.social</a
              >
            </dd>
            <dt>CV</dt>
            <dd>
              <a
                href="https://github.com/renoirb/site/blob/2020/content/resume/jsonresume-renoirb.yaml"
                target="_blank"
                >source stored on GitHub</a
              >
            </dd>
            <dd>
              <a
                href="https://renoirboulanger.com/files/resume/Resume-Renoir-Boulanger.doc"
                target="_blank"
                >Word</a
              >
            </dd>
            <dd>
              <a
                href="https://renoirboulanger.com/files/resume/Resume-Renoir-Boulanger.pdf"
                target="_blank"
                >PDF</a
              >
            </dd>
            <dd>
              <a href="http://registry.jsonresume.org/renoirb" target="_blank"
                >HTML</a
              >
            </dd>
          </dl>
          <div class="items-item disposition-item">
            <dl class="see-also">
              <dt>See also…</dt>
              <dd>
                <a href="https://renoirboulanger.com/glossary"> Glossary </a>
              </dd>
              <dd>
                <a href="https://renoirboulanger.com/code-review">
                  Code-Review notes
                </a>
              </dd>
            </dl>
          </div>
        </footer>
      </div>
    </div>
  </div>
  <div style="position: static !important"></div>
`

const STYLE = `
  :host {
    display: block;
  }
  /**
   * What was as part of a normal root document,
   * but breaks in a CustomElement
   */
  #app-layout {
    line-height: 1.15;
    -webkit-text-size-adjust:100%;
    line-height:1.5;
  }
  #app-layout > .app-layout-body {
    margin: 0;
    background-color: #e5e5e5;
    background-color: var(--bg);
    color: #262626;
    color: var(--color-title);
    transition: background-color .3s;
  }

  /**
   * Other customizations
   */
  .nuxt-content a {
    text-decoration: underline;
    color: initial;
  }
  .nuxt-content ul strong {
    font-weight: bold;
  }
`

const STYLE_PRINT = `
  :host {
    line-height: 1.2 !important;
  }
  #__layout .nuxt-content p {
    page-break-inside: avoid !important;
  }
  #__layout .fixed {
    position: initial;
  }
  #__layout footer.zone__sandwich__bottom .contact {
    color: initial;
  }
  :host,
  #__layout .zone__sandwich__meat.container,
  #__layout footer.zone__sandwich__bottom {
    background-color: initial !important;
  }
  #__layout footer.zone__sandwich__bottom {
    display: initial;
  }
  #__layout .nuxt-content .app-image,
  #__layout .app-side-bar__identity button,
  #__layout footer.zone__sandwich__bottom .see-also,
  #__layout .app-side-bar--component,
  .no-print {
    display: none !important;
  }
  #__layout .zone__sandwich__meat.container .grid .m-20 {
    margin: initial;
  }
  #__layout .zone__sandwich__meat.container {
    max-width: initial;
  }
  #__layout .zone__sandwich__top.container {
    background-color: initial;
    color: initial;
    width: 100% !important;
    max-width: initial !important;
  }
  a[href]:after {
    content:" (" attr(href) ")" !important;
  }
  abbr[title]:after {
    content:" (" attr(title) ")" !important;
  }
  a[href^="javascript:"]:after,
  a[href^="#"]:after {
    content:"" !important;
  }
`

export class AppLayoutAlphaElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    // We cannot use CSSStyleSheet, or maybe need more research
    let styleElement = document.createElement('style')
    styleElement.textContent = STYLE
    this.shadowRoot.appendChild(styleElement)
    styleElement = document.createElement('style')
    styleElement.setAttribute('media', 'print')
    styleElement.textContent = STYLE_PRINT
    this.shadowRoot.appendChild(styleElement)

    const templateElement = document.createElement('template')
    templateElement.innerHTML = TEMPLATE
    const elBody = templateElement.content.cloneNode(true)
    const elRoot = document.createElement('div')
    elRoot.setAttribute('class', 'app-layout-body')
    elRoot.dataset.componentLocalName = this.localName
    elRoot.setAttribute('id', 'app-layout')
    elRoot.appendChild(elBody)
    this.shadowRoot.appendChild(elRoot)

    /**
     * This is ugly, to add CSS to the parent. But whatever. For now.
     */
    this.shadowRoot.appendChild(
      createLinkStlesheets(window, this.localName, LIST_EXTERNAL_STYLE),
    )
    document.head.appendChild(
      createLinkStlesheets(window, this.localName, LIST_EXTERNAL_STYLE),
    )
    this.setAttribute('class', 'nuxt-content')
  }

  /**
   * Enforce idea that this component must be as first child of body to ensure
   * that this component takes up all the available space as designed
   *
  connectedCallback() {
    const parentElement = this.parentElement
    const isBody = parentElement.localName === 'body'
    if (!isBody) {
      const message = `Invalid location to use <${this.localName} />, make sure it's a direct descendant of body`
      this.shadowRoot.innerHTML = `<div style="color: red;">${message}</div>`
      throw new Error(message)
    }
  }
  */
}
