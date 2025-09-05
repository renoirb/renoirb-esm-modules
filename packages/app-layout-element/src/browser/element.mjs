/*!
 * @renoirb/app-layout-element v1.0.0
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
 *   20250308: 3h Build script and deploy on https://dist.renoirb.com/
 */

import {
  /*                    */
  optimizedExternalStyles,
} from '@renoirb/element-utils'

import {
  /*                    */
  svgStringSplatterBack,
  svgStringSplatterTop,
} from './alpha-element-assets-svg.mjs'

const LIST_EXTERNAL_STYLE = [
  'https://renoirboulanger.com/_nuxt/vendors/app.css',
  'https://renoirboulanger.com/_nuxt/app.css',
]

const TEMPLATE = `
  <div id="__layout">
    <div class="layouts--homepage">
      ${/* Huge SVG file removed for brevity */ svgStringSplatterBack}
      <nav class="app-side-bar--component fixed z-40 w-full top" id="app-side-bar-nav" >
        <div
          class="zone__sandwich__top container flex items-center justify-between py-4 mx-auto"
          style="position: relative"
        >
          ${/* Huge SVG file removed for brevity */ svgStringSplatterTop}
          <div
            class="app-side-bar__identity md:px-5 flex items-center"
          >
            <button
              id="hamburger-menu"
              type="button"
              aria-expanded="false"
              aria-controls="app-side-bar"
              class="md:hidden ml-5 mr-2"
              data-toggle="slide-out-nav:open"
            >
              <svg
                title="Sidebar Menu"
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
          id="app-side-bar"
          data-cname-opened="translate-x-0"
          data-cname-closed="-translate-x-full"
          hidden
        >
          <div
            class="app-side-bar__identity flex items-center w-full h-16 p-4 border-b"

          >
            <button
              type="button"
              aria-label="close navigation"
              data-toggle="slide-out-nav:close"
            >&times;</button>
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

      <div class="fixed inset-0 transition-opacity hidden" id="slide-out__overlay">
        <div class="absolute inset-0 bg-black opacity-75" data-toggle="dismiss-overlay" role="button"></div>
      </div>

      <main class="zone__sandwich__meat middle container mx-auto is-under-slide-out__inertify">
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
      <div class="app-footer--component disposition-parent w-full bottom is-under-slide-out__inertify">
        <footer
          class="zone__sandwich__bottom container flex items-center justify-between p-10 mx-auto no-print"
          part="slot-parent-footer-left"
          style="position: relative"
        >
          <slot name="footer-left">
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
            </slot>
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

  .app-side-bar__aside {
    color: var(--color-primary);
    background-color: var(--color-container);
  }
  .app-side-bar__aside .identity__text {
    color: var(--color-sandwich-text);
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
  #isOpened = false

  get isOpen() {
    return this.#isOpened
  }

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
    this.setAttribute('class', 'nuxt-content')
    this.#onConstructorEnd()
  }

  async connectedCallback() {
    if (!this.isConnected) return
    if (this.shadowRoot) {
      this.$elAppLayout?.addEventListener('click', this.#onClickMaybeToggle)
      this.shadowRoot.ownerDocument.body.addEventListener('keydown', this.#onKeyboardEscape)

      try {
        const styles = await optimizedExternalStyles(
          window,
          LIST_EXTERNAL_STYLE,
          {
            componentName: this.localName,
            avoidDuplicates: true,
          },
        )

        // Apply to Shadow DOM
        if (styles.shadow instanceof CSSStyleSheet) {
          this.shadowRoot.adoptedStyleSheets = [styles.shadow]
        } else if (styles.shadow) {
          this.shadowRoot.appendChild(styles.shadow)
        }

        // Apply to document head if not already there
        if (styles.document && !styles.document.isConnected) {
          document.head.appendChild(styles.document)
        }
      } catch (error) {
        console.error('Style loading failed:', error)
      }
    }
  }

  async disconnectedCallback() {
    await Promise.resolve()
    if (this.shadowRoot) {
      if (this.$elAppLayout) {
        this.$elAppLayout.removeEventListener('click', this.#onClickMaybeToggle)
        this.shadowRoot.ownerDocument.body.removeEventListener('keydown', this.#onKeyboardEscape)
      }
    }
  }

  setSlideOutNavOpenState = (desiredState = false) => {
    if (this.shadowRoot) {
      if (this.$elSlideOutNav) {
        const $elSlideOutNav = this.$elSlideOutNav
        const cnameOpened = $elSlideOutNav.dataset.cnameOpened || '' // Should always be set, see #onConstructorEnd
        const cnameClosed = $elSlideOutNav.dataset.cnameClosed || ''
        if (desiredState) {
          $elSlideOutNav.removeAttribute('hidden')
          requestAnimationFrame(() => {
            $elSlideOutNav.classList.add(cnameOpened)
            $elSlideOutNav.classList.remove(cnameClosed)
          })
        } else {
          $elSlideOutNav.classList.remove(cnameOpened)
          $elSlideOutNav.classList.add(cnameClosed)
          $elSlideOutNav.addEventListener('transitionend', (e) => {
            // Only act on the target element (not child transitions)
            if (e.target === $elSlideOutNav && !this.#isOpened) {
              $elSlideOutNav.setAttribute('hidden', 'true')
              this.$elSlideOutNavOverlay?.classList.add('hidden')
            }
          }, { once: true })
        }
      }
      if (this.$elAppLayout) {
        const $elAppLayout = this.$elAppLayout
        if (desiredState) {
          $elAppLayout?.classList.add('is-opened')
        } else {
          $elAppLayout?.classList.remove('is-opened')
        }
      }
      if (this.$elSlideOutNavOverlay) {
        if (desiredState) {
          this.$elSlideOutNavOverlay.classList.remove('hidden')
        } else {
          this.$elSlideOutNavOverlay.classList.add('hidden')
        }
      }
      if(this.$elsSlideOutNavOverlayInertify) {
        this.$elsSlideOutNavOverlayInertify.forEach((el) => {
          if (desiredState) {
            el.setAttribute('inert', 'true')
            el.setAttribute('aria-hidden', 'true') // This looks like it is doing the same as inert
          } else {
            el.removeAttribute('inert')
            el.removeAttribute('aria-hidden')
          }
        })
      }
      if(this.$elSlideOutNavBtnOpen){
        this.$elSlideOutNavBtnOpen.setAttribute('aria-expanded', String(desiredState))
      }
      this.#isOpened = desiredState
    }
  }

  get $elAppLayout() {
    if (this.shadowRoot == null) return null
    return this.shadowRoot.getElementById('__layout')
  }

  get $elSlideOutNav() {
    if (this.shadowRoot == null) return null
    return this.shadowRoot.getElementById('app-side-bar')
  }

  get $elSlideOutNavOverlay() {
    if (this.shadowRoot == null) return null
    return this.shadowRoot.getElementById('slide-out__overlay')
  }

  /**
   * Elements we will want to become inert when slide-out navigation is open
   */
  get $elsSlideOutNavOverlayInertify() {
    if (this.shadowRoot == null) return null
    const els = this.shadowRoot.querySelectorAll('.is-under-slide-out__inertify')
    return Array.from(els)
  }

  /**
   * The button that opens the slide-out navigation
   */
  get $elSlideOutNavBtnOpen() {
    if (this.shadowRoot == null) return null
    const $elsBtnOpen = this.shadowRoot.querySelectorAll('button[data-toggle="slide-out-nav:open"]')
    if ($elsBtnOpen.length === 1) {
      return $elsBtnOpen[0]
    } else {
      const message = 'Expected at least one button[data-toggle="slide-out-nav:open"] element'
      throw new Error(message)
    }
  }

  #dispatch = (
    eventName,
    evt,
    {
      opened = this.isOpen /*: boolean */
    },
  ) => {
    this.dispatchEvent(
      new CustomEvent(this.localName, {
        detail: {
          eventName,
          opened,
          originalEvent: evt,
        },
        bubbles: true,
        composed: true,
      }),
    )
  }

  #onKeyboardEscape = (
    evt /*: HTMLBodyElementEventMap['keydown'] */,
  ) /*: void */ => {
    const { key } = evt ?? {}
    if (this.isOpen) {
      if (/escape/i.test(key)) {
        evt.preventDefault()
        evt.stopImmediatePropagation()
        const opened = false
        this.setSlideOutNavOpenState(opened)
        this.#dispatch('slide-out-nav:close', evt, { opened })
      }
    }
  }

  #onClickMaybeToggle = (
    evt /*: HTMLBodyElementEventMap['click'] */,
  ) /*: void */ => {
    let toggle = evt?.target?.dataset.toggle || null
    const btnEl = evt.target?.closest('button')
    if (!toggle) {
      toggle = btnEl?.dataset.toggle || null
    }
    if (toggle === 'dismiss-overlay') {
      evt.preventDefault()
      evt.stopImmediatePropagation()
      const opened = false
      this.setSlideOutNavOpenState(opened)
      this.#dispatch('slide-out-nav:close', evt, { opened })
      return
    }
    if (!(btnEl instanceof HTMLElement)) {
      return
    }
    if (toggle) {
      evt.preventDefault()
      evt.stopImmediatePropagation()
      const opened = !this.isOpen
      this.setSlideOutNavOpenState(opened)
      this.#dispatch(
        opened ? 'slide-out-nav:open' : 'slide-out-nav:close',
        evt,
        { opened },
      )
    }
    requestAnimationFrame(() => {
      this.$elSlideOutNav?.querySelector('button')?.focus()
    })
  }

  #onConstructorEnd = () => {
    this.#enforceOnlyChildOfParent()
    this.#mutateHostHeadMetaViewport()
    if (this.shadowRoot == null) {
      const message = 'No shadowRoot'
      throw new Error(message)
    }
    //
    // AppLayout is the root of this component that is designed to be the first child of body
    //
    if (this.$elAppLayout == null) {
      throw new Error('No $elAppLayout')
    }
    //
    // $elSlideOutNav is the slide-out navigation element
    // - It is expected to have data-cname-opened and data-cname-closed attributes to tell what class names to flip to show/hide
    // - It is expected to be hidden by default
    //
    const $elSlideOutNav = this.$elSlideOutNav
    if ($elSlideOutNav == null) {
      throw new Error('No $elSlideOutNav')
    }
    const { cnameOpened, cnameClosed } = $elSlideOutNav.dataset
    if (!cnameOpened || !cnameClosed) {
      const message = `Missing required data-cname-opened or data-cname-closed on $elSlideOutNav`
      throw new Error(message)
    }
    $elSlideOutNav.setAttribute('hidden', 'true')
    //
    // $elSlideOutNavOverlay is the overlay that goes behind the slide-out navigation
    //
    if (this.$elSlideOutNavOverlay == null) {
      throw new Error('No $elSlideOutNavOverlay')
    }
    //
    // $elsDismiss are the elements that can dismiss the overlay when clicked
    // - It is probably the only child of the $elSlideOutNavOverlay
    //
    const $elsDismiss = this.shadowRoot.querySelectorAll('[data-toggle="dismiss-overlay"]')
    if ($elsDismiss.length !== 1) {
      // Basically the child inside the overlay that gets stretched and we can capture clicks on.
      const message = 'Expected required one [data-toggle="dismiss-overlay"] element'
      throw new Error(message)
    } else if ($elsDismiss[0] instanceof HTMLElement) {
      // Add role button for accessibility, because it's clickable.
      $elsDismiss[0].setAttribute('role', 'button')
    }
    //
    // $elsInertify are the elements that should become inert when slide-out navigation is open
    // - It is expected to have at least one element
    // - It is intended to add/remove the [inert] attribute to these elements
    //
    const $elsInertify = this.$elsSlideOutNavOverlayInertify
    if ($elsInertify == null) {
      throw new Error('No $elsSlideOutNavOverlayInertify')
    }
    if (!($elsInertify instanceof Array)) {
      const message = `Expected $elsSlideOutNavOverlayInertify to be an Array, got ${typeof $elsInertify}`
      throw new Error(message)
    }
    if ($elsInertify.length == 0) {
      const len = $elsInertify.length
      const message = `Expected at least 2 .is-under-slide-out__inertify elements, got ${len}`
      throw new Error(message)
    }
    //
    // Hamburger slide-out navigation button
    //
    const $elsBtnOpen = this.shadowRoot.querySelectorAll('button[data-toggle="slide-out-nav:open"]')
    if ($elsBtnOpen.length >= 1) {
      const elBtn = $elsBtnOpen[0]
      elBtn.setAttribute('aria-expanded', 'false')
    } else {
      const message = 'Expected at least one button[data-toggle="slide-out-nav:open"] element'
      throw new Error(message)
    }
  }

  /**
   * Enforce idea that this component must be as first child of body to ensure
   * that this component takes up all the available space as designed
   */
  #enforceOnlyChildOfParent = () => {
    const isBody = this.parentElement?.localName === 'body'
    if (!isBody) {
      const message = `Invalid location to use <${this.localName} />, make sure it's a direct descendant of body`
      console.error(message)
      if (this.shadowRoot == null) return
      this.shadowRoot.innerHTML = `<div style="color: red;">${message}</div>`
      throw new Error(message)
    }
  }

  #mutateHostHeadMetaViewport = () => {
    if (this.shadowRoot == null) return
    const d = this.shadowRoot.ownerDocument
    const metaViewport = d.querySelector('head > meta[name="viewport"]')
    if (!metaViewport) {
      const newMetaViewport = d.createElement('meta')
      newMetaViewport.setAttribute('name', 'viewport')
      newMetaViewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no',
      )
      d.head.appendChild(newMetaViewport)
    }
  }
}
