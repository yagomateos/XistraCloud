import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '@/lib/api';

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const email = searchParams.get('email');
    
    if (!email) {
      setError('No se proporcionó un correo electrónico');
      setIsLoading(false);
      return;
    }

    async function acceptInvitation() {
      try {
        const response = await fetch(`${API_URL}/team/invitations/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'x-user-email': localStorage.getItem('userEmail') || ''
          },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
          // Invitación aceptada con éxito
          navigate('/dashboard/team', { 
            state: { 
              message: 'Invitación aceptada exitosamente', 
              type: 'success' 
            } 
          });
        } else {
          // Manejar diferentes tipos de errores
          switch (data.code) {
            case 'INVITATION_NOT_FOUND':
              setError('La invitación no existe o ya ha expirado.');
              break;
            default:
              setError(data.error || 'No se pudo aceptar la invitación');
          }
        }
      } catch (err) {
        console.error('Error al aceptar invitación:', err);
        setError('Hubo un problema al procesar la invitación');
      } finally {
        setIsLoading(false);
      }
    }

    acceptInvitation();
  }, [searchParams, navigate]);

  if (isLoading) {
    return <div>Procesando invitación...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-red-500 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/dashboard/team')} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Volver al equipo
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}


