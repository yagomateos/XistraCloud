import { API_URL } from './api';

interface DeploymentConfig {
  templateId: string;
  name: string;
  environment?: Record<string, string>;
}

interface DeploymentResult {
  success: boolean;
  error?: string;
  deployment?: {
    id?: string;
    name?: string;
    urls?: string[];
    accessUrl?: string;
  };
}

export const deployApp = async (config: DeploymentConfig): Promise<DeploymentResult> => {
  try {
    console.log('🚀 Desplegando aplicación:', config);

    const response = await fetch(`${API_URL}/apps/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en despliegue:', errorText);
      return {
        success: false,
        error: errorText || 'Error desconocido al desplegar la aplicación'
      };
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Despliegue exitoso:', result);
      return {
        success: true,
        deployment: {
          id: result.deployment?.id,
          name: result.deployment?.name,
          urls: result.deployment?.urls,
          accessUrl: result.deployment?.accessUrl
        }
      };
    } else {
      console.error('❌ Despliegue fallido:', result);
      return {
        success: false,
        error: result.message || 'Error al desplegar la aplicación'
      };
    }
  } catch (error) {
    console.error('🚨 Error de red o inesperado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};
