/*!
 * AppLayoutGreyElement
 *
 * 2013 Version of My Web Site Design 
 *
 * Maintainer: Renoir Boulanger <contribs@renoirboulanger.com>
 *
 * 2003-2025 Renoir Boulanger
 *
 * Time spent:
 * - 20230810: 2h
 * - 20250905: 0.25h Import as a variant bundled in one package prior to see how to have abstract app-layout
 */


/**
 * Context:
 * This was written around 2013, and has simply been re-packaged as a Web Component.
 */

import {
  /*                    */
  optimizedExternalStyles,
} from '@renoirb/element-utils'

const LIST_EXTERNAL_STYLE = [
  'https://renoirboulanger.com/wp-content/themes/renoirb/assets/css/main.min.css?for=app-layout-grey-element',
]

const TEMPLATE = `
  <div class="page">
    <header>
        <div class="zone">
            <div class="zone-tools container">
                <div class="row">&nbsp;
                    <!--nav class="span12">
                        <ul class="nav nav-pills pull-right">
                            <li><a href="http://feeds.feedburner.com/RenoirBoulanger"><i class="icon-rss"></i> RSS</a></li>
                            <li class="tooltipify" title="Me rejoindre"><a href="/fr/me-joindre"><i class="icon-envelope"></i> Me joindre</a></li>
                        </ul>
                    </nav-->
                </div>
            </div>
        </div>
        <div class="zone">
            <div class="zone-top container">
                <div class="row">
                  <div part="slot-parent-top-left">
                    <slot name="top-left">
                        <div class="span4">
                            <h1>
                                <a href="https://renoirboulanger.com/">Renoir Boulanger</a>
                            </h1>
                        </div>
                    </slot>
                  </div>
                  <div part="slot-parent-top-right">
                    <slot name="top-right">
                        <div class="span8 behavior-fade">
                            <!-- Same margin and line-height as title, it's fine to tagsoup here I say. -->
                            <p class="pull-right" style="font-size: 1.5em; font-weight: 100; margin: 10px 0px;">FULL-STACK-DEVELOPER &amp; DEVOPS ENGINEER</p>
                        </div>
                    </slot>
                </div>
            </div>
        </div>
    </header>
    <div id="main" role="main" class="zone">
      <div class="zone-content container">
        <div class="wrap container" role="document">
          <div class="content row">
            <div class="main span12" role="main">
              <div class=boxes>

                <slot></slot>

              </div><!-- /.boxes -->
            </div><!-- /.main -->
          </div><!-- /.content -->
        </div><!-- /.wrap -->
      </div><!-- end of .zone-content.container -->
    </div><!-- end of #main.zone -->
    <footer id="content-info" role="contentinfo">
        <div class="zone">
            <div class="zone-bottom container">
                <div class="zone-bottom-padding">&nbsp;</div>
            </div>
        </div>
    </footer>
  </div>
`

const STYLES = `
  :host {
    display: block;
  }

  /* Far reaching ones */
  body { line-height: 30px; font-size: 16px; }
  li { line-height: 30px; }
  .table li { line-height: 20px; }


  /* Too much padding for the resume version of the main layout */
  .resume .zone .zone-top { padding: 20px; }


  /* Hopefully I won't get more spam than I already get */
  [foudelapouitte]:after {
    unicode-bidi:bidi-override;
    direction: rtl;
  }


  /* Definition list, they all get no padding or margin adjustment. */
  dt,
  dd {
    line-height: 24px;
  }
  dd + dt { margin-top: 16px; }
  dd { margin-left: 0; }
  /* /Definition list, they all get no padding... */


  /* Page top warning */
  .warn {
    padding:10px;
    background:#333;
    color:#FFF;
    font-size:0.9em;
    content: "";
    line-height:18px;
  }
  /* /Page top warning */


  /* summary arrow replacement */
  .details details summary::-webkit-details-marker {
    /* Hide summary arrow at beginning.
       Non blink/webkit browsers will have two arrows. */
      display:none;
  }
  .details details summary:after {
    content: '>';
    display: block;
  }
  .details details[open] summary:after { content: '|'; }
  .details details[open] summary { margin-left: -30px; }
  .details details[open] { margin-left: 30px; }
  .details details summary { cursor: zoom-in; }
  .details details[open] { cursor: zoom-out; }
  /* /summary arrow replacement */


  /* Float dl on the right */
  #summary dl,
  .detailed #work-experience dl,
  .detailed #selected-projects dl {
    float: right;
    width: 45%;
    margin: 0 0 20px 20px;
    border-left: 1px dashed #ddd;
    padding: 0 20px;
  }
  .detailed #work-experience dl,
  .detailed #selected-projects dl  {
    margin-top: -36px; /* Which is line-height of h1,h2,h3 */
    padding-top: 0;
  }
  .detailed #work-experience details,
  .detailed #selected-project details {
    clear:none;
  }
  #work-experience section,
  #selected-projects section {
    overflow: hidden;
  }
  #work-experience section + section,
  #selected-projects section + section {
    border-top: 1px dashed #ddd;
    margin-top: 10px;
    padding-top: 10px;
  }
  /* /Float dl on the right */

  /* On non detailed resume, compact things up */
  .not-detailed section:not(#summary) dl { margin-top: -10px; }
  .not-detailed section:not(#summary) dt:first-child { display:none; }
  .not-detailed section:not(#summary) dt { float:left; padding-right: 10px; }
  .not-detailed section:not(#summary) dt:after { content: ":   "; }
  .not-detailed section:not(#summary) dd + dt { margin-top: 0 !important; }

  /* On non detailed resume, remove line separator between sections */
  .not-detailed #work-experience section + section,
  .not-detailed #selected-projects section + section {
    border-top: none !important;
    margin-top: 0;
    padding-top: 0;
  }

  /* On non detailed resume, let's put experience in two columns */
  .not-detailed #work-experience, .not-detailed #technologies { clear: both; }
  .not-detailed #work-experience section {
    float: left;
    width: 50%;
  }
  .not-detailed #work-experience section:nth-child(2n+0) {
    clear: left;
  }

  /* Adjust past-employers SVG logos to harmonize them visually */
  #past-employers img {
    max-height: 80px;
    filter: grayscale(1);
    -webkit-filter: grayscale(1);
    -moz-filter: grayscale(1);
    -o-filter: grayscale(1);
    -ms-filter: grayscale(1);
    opacity: 0.7;
  }
  #past-employers a:hover img {
    filter: grayscale(0);
    -webkit-filter: grayscale(0);
    -moz-filter: grayscale(0);
    -o-filter: grayscale(0);
    -ms-filter: grayscale(0);
    opacity: 1;
  }
  #past-employers img[alt="Mozilla"] { max-height:57px; }
  #past-employers img[alt="W3C"] { max-height:57px; }
  #past-employers a:hover { background: none; }
  #past-employers a + a {
    margin-left: 4%;
  }
  #past-employers p {
    text-align: center;
  }
  /* /Adjust past-employers SVG logos */

  .label {
    border-radius: 5px;
  }
`

const STYLES_PRINT = `
  /*@media print {*/
    @page {
      margin: 1.1cm;
    }

    /* Hide some links location in print media */
    a[href*="renoirboulanger"]:after,
    a[href^="tel"]:after,
    a[href^="/"]:after,
    a[href^="#"]:after,
    .no-print ,
    .details .detailed summary:before {
      display:none;
    }

    .details .detailed details:not([open]) summary:after {
      content: "  (More details available online, you can expand this section if you load my resume in your Web browser)";
      font-size: 0.8em;
    }
  /*}*/
`

export class AppLayoutGreyElement extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    let style = document.createElement('style')
    style.textContent = STYLES
    shadow.appendChild(style)
    style = document.createElement('style')
    style.setAttribute('media', 'print')
    style.textContent = STYLES_PRINT
    shadow.appendChild(style)

    const template = document.createElement('template')
    template.innerHTML = TEMPLATE
    const elBody = template.content.cloneNode(true)
    const elRoot = document.createElement('div')
    elRoot.setAttribute('class', 'app-layout-body')
    elRoot.dataset.componentLocalName = this.localName
    elRoot.setAttribute('id', 'app-layout')
    elRoot.appendChild(elBody)
    shadow.appendChild(elRoot)

    this.#onConstructorEnd()
  }

  async connectedCallback() {
    if (!this.isConnected) return
    await this.#mutateHostForStyleSheets()
  }

  #onConstructorEnd = () => {
    this.#enforceOnlyChildOfParent()
    this.#mutateHostHeadMetaViewport()
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
      newMetaViewport.setAttribute('data-comment-for', this.localName)
      d.head.appendChild(newMetaViewport)
    }
  }

  #mutateHostForStyleSheets = async () => {
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

export default AppLayoutGreyElement


