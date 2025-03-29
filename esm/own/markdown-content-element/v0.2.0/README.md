# MarkdownContentElement

A versatile web component for rendering Markdown content with flexible loading states. This component seamlessly transforms Markdown text into HTML using a Context API pattern, allowing for separation of rendering logic from the display component.

## Features

- **Dynamic Markdown Rendering**: Automatically converts Markdown content to HTML when placed in the component
- **Context-Based Transformation**: Uses the Context API pattern to delegate Markdown processing to application-level handlers
- **Configurable Transition States**: Choose between a loading spinner or immediate source display during transformation
- **Progressive Enhancement**: Falls back to displaying raw Markdown if no context handler responds
- **Shadow DOM Encapsulation**: Styling is contained within the component for reliable rendering
- **Slot-Based Content**: Uses standard slot elements for content and custom loading indicators

## Usage

Basic usage with default spinner transition:

```html
<markdown-content>
  # Hello World
  
  This is **Markdown** content that will be transformed to HTML.
</markdown-content>
```

With immediate source display (no spinner):

```html
<markdown-content data-transition="none">
  # Hello World
  
  This is **Markdown** content that will be shown as-is until transformed.
</markdown-content>
```

Custom loading indicator:

```html
<markdown-content>
  <div slot="skeleton">Loading your content...</div>
  
  # This content will be processed
</markdown-content>
```

## Attributes

- `data-transition`: Controls the loading state appearance
  - `"spinner"`: Shows an animated spinner while content is being processed (default)
  - `"none"`: Shows the raw Markdown source until processing completes

## Events

The component dispatches a `context-request` event with the context name `markdown-content` when content is added or changed. Application code should listen for this event and respond with transformed HTML.

## Integration

This component works best when paired with a Context API handler:

```javascript
// In your application initialization
document.addEventListener('context-request', event => {
  if (event.context === 'markdown-content') {
    const markdown = event.contextTarget.textContent;
    const html = markdownToHtml(markdown); // Your preferred markdown processor
    event.callback({ html });
  }
});
```

This separation of concerns allows the component to focus on presentation while delegating the actual Markdown processing to application code.

