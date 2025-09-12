import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { createDomain } from '../lib/api';
import DomainsPage from '../pages/Domains';

// Mock the API
vi.mock('../lib/api', () => ({
  createDomain: vi.fn(),
  fetchDomains: vi.fn(),
  deleteDomain: vi.fn(),
}));

// Mock react-router-dom if needed
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('Domains Page Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders domains page correctly', () => {
    render(<DomainsPage />);
    
    expect(screen.getByText(/domains/i)).toBeInTheDocument();
    expect(screen.getByText(/add domain/i)).toBeInTheDocument();
  });

  test('validates domain input correctly', async () => {
    render(<DomainsPage />);
    
    const addButton = screen.getByText(/add domain/i);
    fireEvent.click(addButton);
    
    const domainInput = screen.getByPlaceholderText(/enter domain/i);
    
    // Test invalid domain
    fireEvent.change(domainInput, { target: { value: 'invalid-domain' } });
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid domain/i)).toBeInTheDocument();
    });
  });

  test('cleans up protocol from domain input', async () => {
    render(<DomainsPage />);
    
    const addButton = screen.getByText(/add domain/i);
    fireEvent.click(addButton);
    
    const domainInput = screen.getByPlaceholderText(/enter domain/i);
    
    // Test protocol cleanup
    fireEvent.change(domainInput, { target: { value: 'https://example.com' } });
    
    await waitFor(() => {
      expect(domainInput.value).toBe('example.com');
    });
  });

  test('calls API with correct data when creating domain', async () => {
    const mockCreateDomain = vi.mocked(createDomain);
    mockCreateDomain.mockResolvedValue({
      id: 'test-id',
      domain: 'example.com',
      status: 'pending'
    });

    render(<DomainsPage />);
    
    const addButton = screen.getByText(/add domain/i);
    fireEvent.click(addButton);
    
    const domainInput = screen.getByPlaceholderText(/enter domain/i);
    const projectSelect = screen.getByRole('combobox');
    
    fireEvent.change(domainInput, { target: { value: 'example.com' } });
    fireEvent.change(projectSelect, { target: { value: 'test-project-id' } });
    
    const submitButton = screen.getByText(/create domain/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateDomain).toHaveBeenCalledWith({
        domain: 'example.com',
        project_id: 'test-project-id'
      });
    });
  });

  test('handles API errors gracefully', async () => {
    const mockCreateDomain = vi.mocked(createDomain);
    mockCreateDomain.mockRejectedValue(new Error('API Error'));

    render(<DomainsPage />);
    
    const addButton = screen.getByText(/add domain/i);
    fireEvent.click(addButton);
    
    const domainInput = screen.getByPlaceholderText(/enter domain/i);
    const projectSelect = screen.getByRole('combobox');
    
    fireEvent.change(domainInput, { target: { value: 'example.com' } });
    fireEvent.change(projectSelect, { target: { value: 'test-project-id' } });
    
    const submitButton = screen.getByText(/create domain/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error creating domain/i)).toBeInTheDocument();
    });
  });
});

describe('API Functions Tests', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  test('createDomain sends correct request format', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ id: 'test-id', domain: 'example.com' })
    };
    
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await createDomain({
      domain: 'example.com',
      project_id: 'test-project-id'
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/domains'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: 'example.com',
          project_id: 'test-project-id',
          projectId: 'test-project-id' // Compatibility field
        })
      })
    );
  });

  test('createDomain handles API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error')
    };
    
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(createDomain({
      domain: 'example.com',
      project_id: 'test-project-id'
    })).rejects.toThrow('HTTP error! status: 500');
  });
});
