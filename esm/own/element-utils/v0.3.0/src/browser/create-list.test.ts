import { assertEquals, assertThrows } from 'jsr:@std/assert'
import {
  createListElement,
  createDefinitionListElement,
} from './create-list.mjs'

// Mock document for Deno environment
const mockDocument = {
  createElement(tag: string) {
    return {
      tagName: tag.toUpperCase(),
      children: [] as HTMLElement[],
      textContent: '',
      appendChild(child: HTMLElement) {
        this.children.push(child)
      },
    }
  },
} as Document
globalThis.document = mockDocument

Deno.test('createListElement - creates unordered list', () => {
  const items = ['item1', 'item2']
  const ul = createListElement(items, 'ul')
  assertEquals(ul.tagName, 'UL')
  assertEquals(ul.children.length, 2)
  assertEquals(ul.children[0].textContent, 'item1')
  assertEquals(ul.children[1].textContent, 'item2')
})

Deno.test('createListElement - creates ordered list', () => {
  const items = ['item1', 'item2']
  const ol = createListElement(items, 'ol')
  assertEquals(ol.tagName, 'OL')
  assertEquals(ol.children.length, 2)
})

Deno.test('createListElement - throws on invalid type', () => {
  assertThrows(() => createListElement([], 'invalid'))
})

Deno.test('createDefinitionListElement - creates definition list', () => {
  const items = [
    ['term1', 'def1'],
    ['term2', 'def2'],
  ]
  const dl = createDefinitionListElement(items)
  assertEquals(dl.tagName, 'DL')
  assertEquals(dl.children.length, 4)
  assertEquals(dl.children[0].textContent, 'term1')
  assertEquals(dl.children[1].textContent, 'def1')
})

Deno.test('createDefinitionListElement - handles empty strings', () => {
  const items = [
    ['term1', ''],
    ['', 'def2'],
  ]
  const dl = createDefinitionListElement(items)
  assertEquals(dl.children.length, items.length)
})
