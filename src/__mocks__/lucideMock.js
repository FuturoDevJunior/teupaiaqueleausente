// Mock implementation for lucide-react icons
const createIconMock = () => {
  const Icon = () => ({
    type: 'svg',
    props: {
      className: 'lucide-mock-icon'
    },
    $$typeof: Symbol.for('react.element'),
  });
  
  return Icon;
};

// Mock individual icons
const RefreshCw = createIconMock();
const Trash2 = createIconMock();
const Mail = createIconMock();
const File = createIconMock();
const ChevronDown = createIconMock();
const RotateCw = createIconMock();

// Export everything as both default and named exports
// to satisfy both import styles
module.exports = {
  RefreshCw,
  Trash2,
  Mail,
  File,
  ChevronDown,
  RotateCw,
  default: {
    RefreshCw,
    Trash2,
    Mail,
    File,
    ChevronDown,
    RotateCw,
  }
}; 