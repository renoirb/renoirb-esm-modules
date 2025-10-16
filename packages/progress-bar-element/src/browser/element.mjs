import { getClassMap } from '../core/index.mjs'

export const STYLE = `
  :host {
    display: block;

    /** TODO Make configurable **/
    --color-sandwich-bg: #000;
    --color-sandwich-left-splat-bg: #bdbdbd;
    --color-sandwich-text: #fff;
    --color-container: #f9f9f9;
    --color-backdrop: #e5e5e5;
    --bg: var(--color-backdrop);
    --color: #577f79;
    --color-title: #262626;
    --color-subtitle: #999;
    --color-primary: #214761;
    --color-secondary: #bb3f3f;
    --color-tertiary: #cb7723;
    --bg-secondary: #e5e5e5;
    --border-color: #aaa;
    --color-taxonomy-bg: #bdbdbd;
    --color-taxonomy-bg-hover: #959595;
    --color-taxonomy-text-hover: #fff;
    --color-taxonomy-text: #fff;
    --color-container-text-link: var(--color-primary);
    --color-container-text-link-hover: var(--color-secondary);
  }

	.absolute {
    position: absolute;
	}
	.text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
	}
	.items-center {
    align-items: center;
	}
	.inset-0 {
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
	}
	.flex {
    display: flex;
	}
	.rounded {
    border-radius: 0.25rem;
	}
	.bg-gray-100 {
    --tw-bg-opacity: 1;
    background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));
	}
	.w-full {
    width: 100%;
	}
	.h-10 {
    height: 2.5rem;
	}
	.mb-2 {
    margin-bottom: 0.5rem;
	}
	.relative {
    position: relative;
	}
	.text-neutral-grey-medium {
    color: hsl(var(--neutral-grey-medium));
	}
	.uppercase {
    text-transform: uppercase;
	}
	.text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
	}
	.mb-3 {
    margin-bottom: 0.75rem;
	}
	* {
    border-color: hsl(var(--border));
	}
	.flex-col {
    flex-direction: column;
	}
	.pt-2 {
    padding-top: 0.5rem;
	}
	.w-1\/2 {
    width: 50%;
	}
	.p-8 {
    padding: 2rem;
	}
	.gap-4 {
    gap: 1rem;
	}
	.place-content-center {
    place-content: center;
	}
	.grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0px, 1fr));
	}
	.grid {
    display: grid;
	}
	.flex-row {
    flex-direction: row;
	}
	.items-center {
    align-items: center;
	}
	.justify-center {
    justify-content: center;
	}
	.gap-2 {
    gap: 0.5rem;
	}
	.text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
	}
	.uppercase {
    text-transform: uppercase;
	}
	.text-neutral-grey-medium {
    color: hsl(var(--neutral-grey-medium));
	}
	.text-dark-purple {
    color: hsl(var(--dark-purple));
	}
	img, svg, video, canvas, audio, iframe, embed, object {
    display: block;
    vertical-align: middle;
	}
	.fill-orange-400 {
    fill: rgb(251, 146, 60);
	}
	.mr-2 {
    margin-right: 0.5rem;
	}
	.bg-pink-200 {
    --tw-bg-opacity: 1;
    background-color: rgb(251 207 232 / var(--tw-bg-opacity, 1));
	}
	.font-medium {
    font-weight: 500;
	}
	.text-gray-700 {
    --tw-text-opacity: 1;
    color: rgb(55 65 81 / var(--tw-text-opacity, 1));
	}
	.bg-purple-200 {
    --tw-bg-opacity: 1;
    background-color: rgb(233 213 255 / var(--tw-bg-opacity, 1));
	}
	.text-orange-600 {
    --tw-text-opacity: 1;
    color: rgb(234 88 12 / var(--tw-text-opacity, 1));
	}
`

export const TEMPLATE = `<div
			class="relative w-full h-10 mb-2"
			role="meter"
			aria-valuemin="0"
			aria-valuemax="100"
			data-update-percent="aria-valuenow"
			aria-valuenow="0"
		>
			<!-- Layer 1: Background (gradient markers go here later) -->
			<div class="absolute inset-0 bg-gray-100 rounded" />

			<!-- Layer 2: SVG filled bar only -->
			<svg
				class="absolute inset-0"
				width="100%"
				height="100%"
				preserveAspectRatio="none"
			>
				<rect
					x="0"
					y="0"
					height="100%"
					data-update-percent="width"
					data-map-key="svgFillColor"
					rx="4"
				/>
			</svg>

			<!-- Layer 3: Text with CSS layout -->
			<div
				class="absolute inset-0 flex items-center text-sm"
			>
				<div
					class="mr-2 font-medium text-gray-700 bg-pink-200"
					id="description"
				>
					<slot>...</slot>
				</div>
				<div
					data-map-key="textColor"
					id="meter-size"
				>
				</div>
			</div>
		</div>
`

export class ProgressBarElement extends HTMLElement {
  static get observedAttributes() {
    return ['percent', 'color-code']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const templateElement = document.createElement('template')
    templateElement.innerHTML = TEMPLATE
    this.shadowRoot.appendChild(templateElement.content.cloneNode(true))
    const styleElement = new CSSStyleSheet()
    styleElement.replaceSync(STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attributeChangedCallback', { name, oldValue, newValue })
    if (name === 'percent' && oldValue !== newValue) {
      this.#updatePercent(newValue)
    } else if (name === 'color-code' && oldValue !== newValue) {
      this.#updateColorCode(newValue)
    }
  }

  #updatePercent = (v) => {
    const screenReaderOnly = `Horizontal bar at ${v}% filled`
		const firstChild = this.shadowRoot.querySelector(':first-child')
    firstChild.setAttribute('title', screenReaderOnly);
    firstChild.setAttribute('aria-valuenow', v);
    const nodes = this.shadowRoot.querySelectorAll('[data-update-percent]')
    const meterSize = this.shadowRoot.querySelector('#meter-size')
		const percentSign = `${v}%`
    meterSize.setAttribute('style', `left: ${percentSign}; margin-left: 8px;`);
		meterSize.textContent = percentSign;
    console.log('#updatePercent', {
      value: v,
      nodes,
			firstChild,
      meterSize,
      screenReaderOnly,
    })


    for (const node of [...nodes]) {
      const { updatePercent } = node.dataset
			const localName = node?.localName
			const value = localName === 'rect' ? `${v}%` : v
			node.setAttribute(updatePercent, value);
			console.log('#updatePercent for', {
				key: updatePercent,
				nodes,
				localName,
			})
		}
  }

  #updateColorCode = (v) => {
    const classMap = getClassMap(v)
    classMap.textColor += ' font-medium absolute bg-purple-200 mr-2'

    const nodes = this.shadowRoot.querySelectorAll('[data-map-key]')

    console.log('#updateColorCode', {
      value: v,
      nodes,
      classMap,
    })

    for (const node of [...nodes]) {
      const { mapKey } = node.dataset
      const classNames = Reflect.get(classMap, mapKey)
      if (classNames) {
        node.setAttribute('class', classNames)
      }
      console.log('#updateColorCode for', { node, mapKey, classNames })
    }
  }
}
