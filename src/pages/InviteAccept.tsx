import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const InviteAccept = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Procesando invitación...');

  useEffect(() => {
    const email = searchParams.get('email');
    if (!email) {
      setMessage('Enlace inválido: falta email');
      return;
    }
    const API_URL = (localStorage.getItem('VITE_API_URL') || 'http://localhost:3001');
    fetch(`${API_URL}/team/invitations/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // x-user-email: usamos el usuario actual para asociar al owner que acepta
        ...(JSON.parse(localStorage.getItem('user') || '{}')?.email
          ? { 'x-user-email': JSON.parse(localStorage.getItem('user') || '{}')?.email }
          : {})
      },
      body: JSON.stringify({ email })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(() => {
        setMessage('Invitación aceptada. Redirigiendo...');
        setTimeout(() => navigate('/dashboard/team'), 800);
      })
      .catch(() => {
        setMessage('No se pudo aceptar la invitación. Es posible que expirara.');
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center text-foreground">{message}</div>
    </div>
  );
};

export default InviteAccept;


