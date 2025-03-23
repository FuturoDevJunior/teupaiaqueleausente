// Declaration file to extend module typings
import * as React from 'react';

// Fix framer-motion exports
declare module 'framer-motion' {
  interface MotionProps {
    initial?: object;
    animate?: object;
    exit?: object;
    transition?: object;
    className?: string;
    [key: string]: unknown;
  }

  type MotionComponent<P = object> = React.ForwardRefExoticComponent<
    React.PropsWithChildren<P & MotionProps>
  >;

  export const motion: {
    div: MotionComponent<React.HTMLAttributes<HTMLDivElement>>;
    span: MotionComponent<React.HTMLAttributes<HTMLSpanElement>>;
    p: MotionComponent<React.HTMLAttributes<HTMLParagraphElement>>;
    a: MotionComponent<React.HTMLAttributes<HTMLAnchorElement>>;
    [key: string]: MotionComponent;
  };

  export const AnimatePresence: React.FC<{
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
    children?: React.ReactNode;
  }>;
}

// Fix lucide-react exports
declare module 'lucide-react' {
  type IconProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  };
  
  type IconComponent = React.ForwardRefExoticComponent<IconProps>;
  
  export const ChevronDown: IconComponent;
  export const Clock: IconComponent;
  export const Copy: IconComponent;
  export const Cookie: IconComponent;
  export const ExternalLink: IconComponent;
  export const Github: IconComponent;
  export const Info: IconComponent;
  export const Linkedin: IconComponent;
  export const Mail: IconComponent;
  export const MailOpen: IconComponent;
  export const Search: IconComponent;
  export const Terminal: IconComponent;
  export const Trash2: IconComponent;
  export const X: IconComponent;
  export const Code: IconComponent;
}

// Fix sonner exports
declare module 'sonner' {
  interface ToastOptions {
    description?: string;
    icon?: string | React.ReactNode;
    duration?: number;
    position?: string;
    [key: string]: unknown;
  }

  interface ToastApi {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
    [key: string]: unknown;
  }

  export const toast: ToastApi;
} 