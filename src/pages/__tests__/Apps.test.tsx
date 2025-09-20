import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Apps from '../Apps';

// Mock de window.open
const mockOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

// Mock de window.location
Object.defineProperty(window, 'location', 'value', {
  value: {
    href: 'http://localhost:3000',
  },
  writable: true,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Apps Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders apps page with correct title', () => {
    renderWithRouter(<Apps />);
    
    expect(screen.getByText('Apps Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Gestiona e instala tus apps desde el panel')).toBeInTheDocument();
  });

  test('renders all app cards', () => {
    renderWithRouter(<Apps />);
    
    // Verificar que las aplicaciones principales están presentes
    expect(screen.getByText('WordPress')).toBeInTheDocument();
    expect(screen.getByText('Nextcloud')).toBeInTheDocument();
    expect(screen.getByText('Portainer')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('Redis')).toBeInTheDocument();
  });

  test('displays app descriptions', () => {
    renderWithRouter(<Apps />);
    
    expect(screen.getByText('CMS líder con MySQL')).toBeInTheDocument();
    expect(screen.getByText('Colaboración y archivos')).toBeInTheDocument();
    expect(screen.getByText('Gestión Docker')).toBeInTheDocument();
  });

  test('has action buttons for each app', () => {
    renderWithRouter(<Apps />);
    
    const manageButtons = screen.getAllByText('Gestionar en panel');
    expect(manageButtons).toHaveLength(25); // Total de apps en el catálogo
  });

  test('opens panel when clicking manage button', () => {
    renderWithRouter(<Apps />);
    
    const firstManageButton = screen.getAllByText('Gestionar en panel')[0];
    fireEvent.click(firstManageButton);
    
    expect(mockOpen).toHaveBeenCalledWith('https://panel.xistracloud.com', '_blank');
  });

  test('has panel action buttons in header', () => {
    renderWithRouter(<Apps />);
    
    expect(screen.getByText('Abrir panel de apps')).toBeInTheDocument();
    expect(screen.getByText('Ir en esta pestaña')).toBeInTheDocument();
  });

  test('opens panel in new tab when clicking header button', () => {
    renderWithRouter(<Apps />);
    
    const openPanelButton = screen.getByText('Abrir panel de apps');
    fireEvent.click(openPanelButton);
    
    expect(mockOpen).toHaveBeenCalledWith('https://panel.xistracloud.com', '_blank');
  });

  test('has proper spacing and layout', () => {
    renderWithRouter(<Apps />);
    
    const mainContainer = screen.getByText('Apps Marketplace').closest('div');
    expect(mainContainer).toHaveClass('pt-6', 'px-4', 'pb-4', 'lg:p-6');
  });

  test('displays app icons', () => {
    renderWithRouter(<Apps />);
    
    // Verificar que los iconos están presentes
    expect(screen.getByText('📝')).toBeInTheDocument(); // WordPress
    expect(screen.getByText('☁️')).toBeInTheDocument(); // Nextcloud
    expect(screen.getByText('📦')).toBeInTheDocument(); // Portainer
  });

  test('has responsive grid layout', () => {
    renderWithRouter(<Apps />);
    
    const gridContainer = screen.getByText('WordPress').closest('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });
});
