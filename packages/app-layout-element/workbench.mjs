export function moveElementsIntoTarget(
  targetElementName = 'the-tested-component',
) {
  // Get the target container
  const targetElement = document.querySelector(targetElementName)

  if (!targetElement) {
    console.error(`Target element <${targetElementName}> not found`)
    return
  }

  // Create a document fragment to hold the elements (more efficient)
  const fragment = document.createDocumentFragment()

  // Get all direct children of body
  const bodyChildren = Array.from(document.body.childNodes)

  // Collect elements to move
  const elementsToMove = bodyChildren.filter((node) => {
    // Skip scripts and styles
    if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') {
      return false
    }

    // Skip the target element itself
    if (node === targetElement) {
      return false
    }

    // Skip empty text nodes (whitespace)
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
      return false
    }

    // Move everything else
    return true
  })

  // Clear the target element's content first
  targetElement.innerHTML = ''

  // Move all elements to the fragment first
  elementsToMove.forEach((element) => {
    fragment.appendChild(element)
  })

  // Then append the fragment to the target (one DOM operation)
  targetElement.appendChild(fragment)

  console.log(
    `Moved ${elementsToMove.length} elements into <${targetElementName}>`,
  )
}
