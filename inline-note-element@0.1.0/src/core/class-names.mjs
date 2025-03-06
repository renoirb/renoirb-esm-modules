export const classNameMap = new Map([
  ['insertBg', 'bg-green-200'],
  ['deleteBg', 'bg-red-200'],
  ['rounded', 'rounded'],
  ['insertIndicator', 'bg-green-500'],
  ['deleteIndicator', 'bg-red-500'],
  ['indicator', 'inline-block w-3 h-3 rounded cursor-pointer'],
  [
    'tooltip',
    'absolute z-10 p-2 bg-gray-800 text-white text-xs rounded shadow-lg transition-opacity duration-300',
  ],
  ['tooltipHidden', 'opacity-0 invisible -translate-y-2'],
  ['tooltipVisible', 'opacity-100 visible translate-y-0'],
])
