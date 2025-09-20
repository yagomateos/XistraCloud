import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../Settings';

// Mock de useUserData
vi.mock('@/hooks/useUserData', () => ({
  useUserData: () => ({
    userData: {
      name: 'Test User',
      email: 'test@example.com',
      avatar: '',
      bio: '',
      location: '',
      company: '',
      website: '',
      joinedAt: '2025-01-01T00:00:00Z',
    },
    userPlan: 'free',
  }),
}));

// Mock de toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings page with correct title', () => {
    renderWithRouter(<Settings />);
    
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByText('Gestiona tu cuenta y preferencias de XistraCloud')).toBeInTheDocument();
  });

  it('renders all tab sections', () => {
    renderWithRouter(<Settings />);
    
    // Verificar que todos los tabs están presentes
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Avisos')).toBeInTheDocument();
    expect(screen.getByText('Seguridad')).toBeInTheDocument();
    expect(screen.getByText('Plan')).toBeInTheDocument();
  });

  it('displays user information in profile tab', () => {
    renderWithRouter(<Settings />);
    
    // Verificar que la información del usuario se muestra
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('allows editing profile information', async () => {
    renderWithRouter(<Settings />);
    
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    expect(nameInput).toHaveValue('Updated Name');
  });

  it('shows notification preferences', () => {
    renderWithRouter(<Settings />);
    
    // Hacer clic en el tab de notificaciones
    fireEvent.click(screen.getByText('Avisos'));
    
    // Verificar que las preferencias de notificaciones están presentes
    expect(screen.getByText('Preferencias de Notificaciones')).toBeInTheDocument();
  });

  it('has proper spacing and layout', () => {
    renderWithRouter(<Settings />);
    
    const mainContainer = screen.getByText('Configuración').closest('div');
    expect(mainContainer).toHaveClass('pt-6', 'px-4', 'pb-4', 'lg:p-6');
  });
});