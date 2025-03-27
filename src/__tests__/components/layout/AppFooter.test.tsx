import '@testing-library/jest-dom';

import React from 'react';

import AppFooter from '@/components/layout/AppFooter';
import { screen } from '@testing-library/react';

import { renderWithRouter } from '../../utils/testUtils';

// Mock EasterEgg component
jest.mock('@/components/EasterEgg', () => ({
  __esModule: true,
  default: () => <div data-testid="easter-egg-mock">Easter Egg Mock</div>,
}));

// Mock current year
const CURRENT_YEAR = new Date().getFullYear();

describe('AppFooter Component', () => {
  it('renders correctly with company name and year', () => {
    renderWithRouter(<AppFooter />);
    
    // Verificar o texto principal do footer
    const companyText = screen.getByText(/Teu Pai aquele ausente/i);
    expect(companyText).toBeInTheDocument();
    
    // Verificar se o ano atual está presente
    const yearText = screen.getByText(new RegExp(String(CURRENT_YEAR)));
    expect(yearText).toBeInTheDocument();
  });

  it('renders the open source text', () => {
    renderWithRouter(<AppFooter />);
    
    const openSourceText = screen.getByText(/100% Open Source/i);
    expect(openSourceText).toBeInTheDocument();
  });

  it('renders social links correctly', () => {
    renderWithRouter(<AppFooter />);
    
    // Verificar se os links estão presentes
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    
    // Verificar se pelo menos um link tem o href para GitHub
    const githubLink = Array.from(links).find(link => 
      link.getAttribute('href')?.includes('github.com'));
    expect(githubLink).toBeDefined();
  });

  it('includes the EasterEgg component', () => {
    renderWithRouter(<AppFooter />);
    
    const easterEgg = screen.getByTestId('easter-egg-mock');
    expect(easterEgg).toBeInTheDocument();
  });
}); 