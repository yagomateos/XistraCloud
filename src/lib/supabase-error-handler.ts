// Error handler para Supabase
import { supabase } from './supabase';

// Interceptor para manejar errores de Supabase
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error);
  
  // Si es un error 400 relacionado con columns, intentar con select
  if (error.message && error.message.includes('columns')) {
    console.warn('Detected columns parameter error, this might be a browser extension issue');
    return {
      success: false,
      error: 'Browser extension conflict detected',
      fallback: true
    };
  }
  
  // Si es un error de permisos
  if (error.code === 'PGRST301' || error.message?.includes('permission')) {
    console.warn('Permission error detected');
    return {
      success: false,
      error: 'Permission denied',
      fallback: true
    };
  }
  
  // Si es un error de tabla no encontrada
  if (error.code === 'PGRST204' || error.message?.includes('not found')) {
    console.warn('Table not found error detected');
    return {
      success: false,
      error: 'Table not found',
      fallback: true
    };
  }
  
  return {
    success: false,
    error: error.message || 'Unknown error',
    fallback: false
  };
};

// Función helper para consultas seguras
export const safeSupabaseQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  context: string,
  fallbackData: T | null = null
): Promise<{ data: T | null; error: any }> => {
  try {
    const result = await queryFn();
    
    if (result.error) {
      const errorInfo = handleSupabaseError(result.error, context);
      if (errorInfo.fallback) {
        return { data: fallbackData, error: null };
      }
    }
    
    return result;
  } catch (error) {
    const errorInfo = handleSupabaseError(error, context);
    return { 
      data: errorInfo.fallback ? fallbackData : null, 
      error: errorInfo.error 
    };
  }
};
