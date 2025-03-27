import '@testing-library/jest-dom';

import React from 'react';

import PrivacySection from '@/components/email/PrivacySection';
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

describe('PrivacySection', () => {
  it('renders the section title correctly', () => {
    renderWithProviders(<PrivacySection />);
    expect(screen.getByText('Privacidade garantida')).toBeInTheDocument();
  });

  it('displays all privacy points with correct headings', () => {
    renderWithProviders(<PrivacySection />);
    
    expect(screen.getByText('Sem cadastro')).toBeInTheDocument();
    expect(screen.getByText('Sem retenção de dados')).toBeInTheDocument();
    expect(screen.getByText('Privacidade respeitada')).toBeInTheDocument();
  });

  it('includes descriptions for each privacy point', () => {
    renderWithProviders(<PrivacySection />);
    
    expect(screen.getByText(/Não é necessário criar conta/)).toBeInTheDocument();
    expect(screen.getByText(/Não armazenamos seus emails/)).toBeInTheDocument();
    expect(screen.getByText(/Seus dados não são vendidos/)).toBeInTheDocument();
  });

  it('renders the correct number of privacy features', () => {
    const { container } = renderWithProviders(<PrivacySection />);
    const features = container.querySelectorAll('.space-y-2');
    expect(features.length).toBeGreaterThan(2);
  });
}); 