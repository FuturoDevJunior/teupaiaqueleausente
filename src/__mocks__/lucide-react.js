// Mock implementation for lucide-react icons
const createIconMock = (iconName) => {
  const Icon = () => ({
    type: 'svg',
    props: {
      className: 'lucide-mock-icon',
      'data-testid': `lucide-${iconName}`,
      'aria-hidden': 'true'
    },
    $$typeof: Symbol.for('react.element'),
  });
  
  Icon.displayName = iconName;
  return Icon;
};

// Common icons
const icons = {
  RefreshCw: createIconMock('RefreshCw'),
  Trash2: createIconMock('Trash2'),
  Mail: createIconMock('Mail'),
  File: createIconMock('File'),
  ChevronDown: createIconMock('ChevronDown'),
  RotateCw: createIconMock('RotateCw'),
  Printer: createIconMock('Printer'),
  X: createIconMock('X'),
  MoreHorizontal: createIconMock('MoreHorizontal'),
  Sun: createIconMock('Sun'),
  Moon: createIconMock('Moon'),
  Copy: createIconMock('Copy'),
  ExternalLink: createIconMock('ExternalLink'),
  Info: createIconMock('Info'),
  Cookie: createIconMock('Cookie'),
};

// Create a proxy to handle any icon imports dynamically
const handler = {
  get: function(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    // Create a mock for any other icon that might be imported
    return createIconMock(prop.toString());
  }
};

module.exports = new Proxy(icons, handler); 