// Store para manejar datos del usuario de manera centralizada
import { supabase } from './supabase';
import { safeSupabaseQuery } from './supabase-error-handler';

export interface UserData {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  company: string;
  website: string;
  joinedAt: string;
  plan: string;
  userId?: string;
}

// Datos mock para desarrollo
const MOCK_USER_DATA: UserData = {
  name: 'Yago Mateos',
  email: 'yago@xistracloud.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  bio: 'Desarrollador Full Stack especializado en aplicaciones cloud',
  location: 'Madrid, España',
  company: 'XistraCloud',
  website: 'https://xistracloud.com',
  joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 días atrás
  plan: 'pro',
  userId: 'mock-user-123'
};

class UserStore {
  private static instance: UserStore;
  private userData: UserData | null = null;
  private currentUserId: string | null = null;
  private useMockData: boolean = false; // DESACTIVADO - solo datos reales

  private constructor() {
    // No cargar datos automáticamente - se cargarán cuando se autentique el usuario
  }

  public static getInstance(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  // Limpiar datos cuando el usuario cierra sesión
  public clearUserData(): void {
    this.userData = null;
    this.currentUserId = null;
    
    // Limpiar localStorage específico del usuario anterior
    if (this.currentUserId) {
      localStorage.removeItem(`xistra-user-data-${this.currentUserId}`);
    }
    
    // Disparar evento de limpieza
    window.dispatchEvent(new CustomEvent('user-data-cleared'));
  }

  // Cargar datos específicos del usuario autenticado
  public async loadUserData(userId: string): Promise<void> {
    if (this.currentUserId === userId && this.userData) {
      return; // Ya tenemos los datos cargados
    }

    this.currentUserId = userId;

    // Si estamos en modo mock, usar datos mock
    if (this.useMockData) {
      console.log('🔄 Loading mock user data');
      this.userData = { ...MOCK_USER_DATA, userId };
      
      // Disparar evento de carga
      window.dispatchEvent(new CustomEvent('user-data-loaded', { 
        detail: this.userData 
      }));
      return;
    }

    try {
      // Intentar cargar desde la base de datos primero con manejo de errores
      const { data: dbUser, error } = await safeSupabaseQuery(
        () => supabase
          .from('users')
          .select('id, email, full_name, avatar_url, bio, location, company, website, plan_type, created_at')
          .eq('id', userId)
          .single(),
        'loadUserData'
      );

      if (!error && dbUser) {
        // Usuario existe en la BD
        this.userData = {
          name: dbUser.full_name || dbUser.email?.split('@')[0] || 'Usuario',
          email: dbUser.email,
          avatar: dbUser.avatar_url || '',
          bio: dbUser.bio || '',
          location: dbUser.location || '',
          company: dbUser.company || '',
          website: dbUser.website || '',
          joinedAt: dbUser.created_at,
          plan: dbUser.plan_type || 'free',
          userId: userId
        };
      } else {
        // Usuario nuevo - crear datos por defecto
        const { data: authUser } = await supabase.auth.getUser();
        this.userData = {
          name: authUser.user?.email?.split('@')[0] || 'Usuario',
          email: authUser.user?.email || '',
          avatar: '',
          bio: '',
          location: '',
          company: '',
          website: '',
          joinedAt: new Date().toISOString(),
          plan: 'free',
          userId: userId
        };

        // Crear usuario en la BD
        await supabase
          .from('users')
          .insert([{
            id: userId,
            email: this.userData.email,
            full_name: this.userData.name,
            plan_type: 'free'
          }])
          .single();
      }

      // Guardar en localStorage específico del usuario
      this.saveToLocalStorage();
      
      // Disparar evento de datos cargados
      window.dispatchEvent(new CustomEvent('user-data-loaded', { 
        detail: this.userData 
      }));

    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Si hay un error específico de Supabase, intentar obtener datos básicos del auth
      try {
        const { data: authUser } = await supabase.auth.getUser();
        this.userData = {
          name: authUser.user?.email?.split('@')[0] || 'Usuario',
          email: authUser.user?.email || '',
          avatar: '',
          bio: '',
          location: '',
          company: '',
          website: '',
          joinedAt: new Date().toISOString(),
          plan: 'free',
          userId: userId
        };
      } catch (authError) {
        console.error('Error getting auth user:', authError);
        // Fallback final a datos por defecto
        this.userData = {
          name: 'Usuario',
          email: '',
          avatar: '',
          bio: '',
          location: '',
          company: '',
          website: '',
          joinedAt: new Date().toISOString(),
          plan: 'free',
          userId: userId
        };
      }
      
      // Disparar evento de datos cargados incluso con fallback
      window.dispatchEvent(new CustomEvent('user-data-loaded', { 
        detail: this.userData 
      }));
    }
  }

  private saveToLocalStorage(): void {
    if (this.userData && this.currentUserId) {
      localStorage.setItem(`xistra-user-data-${this.currentUserId}`, JSON.stringify(this.userData));
    }
  }

  public getUserData(): UserData | null {
    // Si no hay datos, devolver datos por defecto para que la interfaz funcione
    if (!this.userData) {
      const defaultData = {
        name: 'Usuario',
        email: 'usuario@ejemplo.com',
        avatar: '',
        bio: '',
        location: '',
        company: '',
        website: '',
        plan: 'free',
        joinedAt: new Date().toISOString(),
        userId: 'mock-user-id'
      };
      
      // Establecer los datos por defecto para evitar futuras llamadas
      this.userData = defaultData;
      return { ...defaultData };
    }
    return { ...this.userData };
  }

  public async updateUserData(data: Partial<UserData>): Promise<void> {
    // Si no hay datos de usuario, crear datos por defecto
    if (!this.userData) {
      this.userData = {
        name: 'Usuario',
        email: 'usuario@ejemplo.com',
        avatar: '',
        bio: '',
        location: '',
        company: '',
        website: '',
        plan: 'free',
        joinedAt: new Date().toISOString(),
        userId: 'mock-user-id'
      };
    }

    // Actualizar los datos localmente
    this.userData = { ...this.userData, ...data };
    
    try {
      // Solo intentar actualizar en la base de datos si hay un usuario real autenticado
      if (this.currentUserId && this.currentUserId !== 'mock-user-id') {
        const updateData: any = {};
        if (data.name) updateData.full_name = data.name;
        if (data.bio) updateData.bio = data.bio;
        if (data.location) updateData.location = data.location;
        if (data.company) updateData.company = data.company;
        if (data.website) updateData.website = data.website;
        if (data.avatar) updateData.avatar_url = data.avatar;
        if (data.plan) updateData.plan_type = data.plan;

        await supabase
          .from('users')
          .update(updateData)
          .eq('id', this.currentUserId);
      } else {
        console.log('Usuario no autenticado, guardando cambios solo localmente');
      }

      // Guardar en localStorage
      this.saveToLocalStorage();
      
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('user-data-updated', { 
        detail: this.userData 
      }));
    } catch (error) {
      console.error('Error updating user data:', error);
      // No lanzar el error, solo loguearlo para que la interfaz funcione
      console.log('Continuando con actualización local solamente');
      
      // Disparar evento de actualización aunque falle la base de datos
      window.dispatchEvent(new CustomEvent('user-data-updated', { 
        detail: this.userData 
      }));
    }
  }

  public async updateProfile(profile: { name: string; email: string; bio: string; location: string; company: string; website: string }): Promise<void> {
    await this.updateUserData(profile);
  }

  public async updateAvatar(avatarUrl: string): Promise<void> {
    await this.updateUserData({ avatar: avatarUrl });
  }
}

export const userStore = UserStore.getInstance();
