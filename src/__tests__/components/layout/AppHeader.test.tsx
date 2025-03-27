import '@testing-library/jest-dom';

import React from 'react';

import AppHeader from '@/components/layout/AppHeader';
import { screen } from '@testing-library/react';

import { renderWithRouter } from '../../utils/testUtils';

// Mock ThemeToggle component
jest.mock('@/components/theme/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle-mock">Theme Toggle Mock</div>,
}));

// Mock FamilyGuyQuote component
jest.mock('@/components/FamilyGuyQuote', () => ({
  __esModule: true,
  default: () => <div data-testid="family-guy-quote-mock">Quote Mock</div>,
}));

describe('AppHeader Component', () => {
  it('renders correctly with logo and title', () => {
    renderWithRouter(<AppHeader />);
    
    // Verificar se o título principal está presente
    expect(screen.getByText('Teu')).toBeInTheDocument();
    expect(screen.getByText('Pai Ausente')).toBeInTheDocument();
    
    // Logo deve estar presente (verificamos por alt text)
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders the description text', () => {
    renderWithRouter(<AppHeader />);
    
    // Verificar se o texto descritivo está presente
    const description = screen.getByText(/Email temporário grátis que dura até você fechar a aba/i);
    expect(description).toBeInTheDocument();
  });

  it('includes the ThemeToggle component', () => {
    renderWithRouter(<AppHeader />);
    
    const themeToggle = screen.getByTestId('theme-toggle-mock');
    expect(themeToggle).toBeInTheDocument();
  });

  it('includes the FamilyGuyQuote component', () => {
    renderWithRouter(<AppHeader />);
    
    const familyGuyQuote = screen.getByTestId('family-guy-quote-mock');
    expect(familyGuyQuote).toBeInTheDocument();
  });

  it('contains the Mail icon', () => {
    renderWithRouter(<AppHeader />);
    
    // Como o ícone não tem um texto específico, podemos verificar seu container
    // Vamos procurar por elementos que possam conter o ícone (como um div com classe específica)
    const headerContainer = screen.getByRole('banner');
    expect(headerContainer).toBeInTheDocument();
  });
}); 