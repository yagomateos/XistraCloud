import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DatabaseServices from '../DatabaseServices';

// Mock de fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock de toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock de window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Database Services Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  test('renders database services page with correct title', () => {
    renderWithRouter(<DatabaseServices />);
    
    expect(screen.getByText('Servicios de Base de Datos')).toBeInTheDocument();
    expect(screen.getByText('Gestiona tus bases de datos MySQL, PostgreSQL y Redis')).toBeInTheDocument();
  });

  test('renders deploy buttons for all database types', () => {
    renderWithRouter(<DatabaseServices />);
    
    expect(screen.getByText('Desplegar MySQL')).toBeInTheDocument();
    expect(screen.getByText('Desplegar PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('Desplegar Redis')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    renderWithRouter(<DatabaseServices />);
    
    expect(screen.getByText('Cargando servicios...')).toBeInTheDocument();
  });

  test('shows empty state when no services', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<DatabaseServices />);
    
    await waitFor(() => {
      expect(screen.getByText('No tienes servicios de base de datos desplegados')).toBeInTheDocument();
    });
  });

  test('displays deployed services', async () => {
    const mockServices = [
      {
        id: '1',
        name: 'mysql-db',
        type: 'mysql',
        status: 'running',
        admin_port: 8080,
        created_at: '2025-01-01T00:00:00Z',
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockServices,
    });

    renderWithRouter(<DatabaseServices />);
    
    await waitFor(() => {
      expect(screen.getByText('mysql-db')).toBeInTheDocument();
      expect(screen.getByText('MySQL')).toBeInTheDocument();
    });
  });

  test('allows deploying MySQL service', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithRouter(<DatabaseServices />);
    
    const deployButton = screen.getByText('Desplegar MySQL');
    fireEvent.click(deployButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/apps/deploy'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('mysql-standalone'),
        })
      );
    });
  });

  test('allows deploying PostgreSQL service', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithRouter(<DatabaseServices />);
    
    const deployButton = screen.getByText('Desplegar PostgreSQL');
    fireEvent.click(deployButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/apps/deploy'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('postgresql-standalone'),
        })
      );
    });
  });

  test('allows deploying Redis service', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithRouter(<DatabaseServices />);
    
    const deployButton = screen.getByText('Desplegar Redis');
    fireEvent.click(deployButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/apps/deploy'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('redis-standalone'),
        })
      );
    });
  });

  test('shows admin panel link for deployed services', async () => {
    const mockServices = [
      {
        id: '1',
        name: 'mysql-db',
        type: 'mysql',
        status: 'running',
        admin_port: 8080,
        created_at: '2025-01-01T00:00:00Z',
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockServices,
    });

    renderWithRouter(<DatabaseServices />);
    
    await waitFor(() => {
      expect(screen.getByText('Panel Admin')).toBeInTheDocument();
    });
  });

  test('allows deleting services with confirmation', async () => {
    const mockServices = [
      {
        id: '1',
        name: 'mysql-db',
        type: 'mysql',
        status: 'running',
        admin_port: 8080,
        created_at: '2025-01-01T00:00:00Z',
      },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    mockConfirm.mockReturnValue(true);

    renderWithRouter(<DatabaseServices />);
    
    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /🗑️/i });
      fireEvent.click(deleteButton);
    });
    
    expect(mockConfirm).toHaveBeenCalled();
  });

  test('has proper spacing and layout', () => {
    renderWithRouter(<DatabaseServices />);
    
    const mainContainer = screen.getByText('Servicios de Base de Datos').closest('div');
    expect(mainContainer).toHaveClass('pt-6', 'px-4', 'pb-4', 'lg:p-6');
  });
});
