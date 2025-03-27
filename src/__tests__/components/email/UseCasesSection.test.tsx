import '@testing-library/jest-dom';

import React from 'react';

import UseCasesSection from '@/components/email/UseCasesSection';
import {
  render,
  screen,
} from '@testing-library/react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.HTMLProps<HTMLDivElement>) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

describe('UseCasesSection', () => {
  it('renders the section title correctly', () => {
    render(<UseCasesSection />);
    expect(screen.getByText('Usos populares')).toBeInTheDocument();
  });

  it('displays all three use cases with correct titles', () => {
    render(<UseCasesSection />);
    
    // Check for the three use case titles
    expect(screen.getByText('Fóruns & Comentários')).toBeInTheDocument();
    expect(screen.getByText('Testes & Trials')).toBeInTheDocument();
    expect(screen.getByText('Downloads & PDFs')).toBeInTheDocument();
  });

  it('includes descriptions for each use case', () => {
    render(<UseCasesSection />);
    
    // Check for descriptions
    expect(screen.getByText(/Evite spam ao participar de discussões online/)).toBeInTheDocument();
    expect(screen.getByText(/Teste novos serviços e períodos de avaliação/)).toBeInTheDocument();
    expect(screen.getByText(/Baixe e-books, PDFs e outros conteúdos/)).toBeInTheDocument();
  });

  it('renders the correct number of use case cards', () => {
    const { container } = render(<UseCasesSection />);
    
    // There should be 3 cards
    const cards = container.querySelectorAll('.bg-accent\\/50');
    expect(cards).toHaveLength(3);
  });
}); 