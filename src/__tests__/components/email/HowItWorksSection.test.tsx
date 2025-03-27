import '@testing-library/jest-dom';

import React from 'react';

import HowItWorksSection from '@/components/email/HowItWorksSection';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../utils/testUtils';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.HTMLProps<HTMLDivElement>) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

describe('HowItWorksSection', () => {
  it('renders the section title correctly', () => {
    renderWithProviders(<HowItWorksSection />);
    expect(screen.getByText('Como funciona')).toBeInTheDocument();
  });

  it('displays all features with the correct titles', () => {
    renderWithProviders(<HowItWorksSection />);
    
    expect(screen.getByText('Gere um email temporário')).toBeInTheDocument();
    expect(screen.getByText('Receba emails automaticamente')).toBeInTheDocument();
    expect(screen.getByText('Navegue com privacidade')).toBeInTheDocument();
  });

  it('includes descriptions for each feature', () => {
    renderWithProviders(<HowItWorksSection />);
    
    expect(screen.getByText(/Crie um endereço de email temporário/)).toBeInTheDocument();
    expect(screen.getByText(/Os emails são recebidos automaticamente/)).toBeInTheDocument();
    expect(screen.getByText(/Sua privacidade é preservada/)).toBeInTheDocument();
  });

  it('renders the correct number of feature items', () => {
    const { container } = renderWithProviders(<HowItWorksSection />);
    const steps = container.querySelectorAll('.flex.items-center.space-x-3');
    expect(steps).toHaveLength(3);
  });
}); 