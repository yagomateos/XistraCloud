import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function LoginSimple() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = 'http://localhost:3001';
      console.log('🔗 API URL:', apiUrl);
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const user = {
          name: data.user.name,
          email: data.user.email,
        };
        
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authToken', data.token);
        
        console.log('✅ Login successful:', user);
        
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        });
        
        // Redirigir al dashboard local
        window.location.href = 'http://localhost:3002/dashboard';
      } else {
        const error = await response.json();
        toast({
          title: "Error de inicio de sesión",
          description: error.error || 'Error desconocido',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Accede a tu cuenta de XistraCloud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>¿No tienes cuenta? <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer">Regístrate aquí</button></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
