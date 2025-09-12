// Store para manejar datos del usuario de manera centralizada
import { supabase } from './supabase';

interface UserData {
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

class UserStore {
  private static instance: UserStore;
  private userData: UserData | null = null;
  private currentUserId: string | null = null;

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

    try {
      // Intentar cargar desde la base de datos primero
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

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
      // Fallback a datos por defecto
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
  }

  private saveToLocalStorage(): void {
    if (this.userData && this.currentUserId) {
      localStorage.setItem(`xistra-user-data-${this.currentUserId}`, JSON.stringify(this.userData));
    }
  }

  public getUserData(): UserData | null {
    return this.userData ? { ...this.userData } : null;
  }

  public async updateUserData(data: Partial<UserData>): Promise<void> {
    if (!this.userData || !this.currentUserId) {
      throw new Error('No user data loaded');
    }

    this.userData = { ...this.userData, ...data };
    
    try {
      // Actualizar en la base de datos
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

      // Guardar en localStorage
      this.saveToLocalStorage();
      
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('user-data-updated', { 
        detail: this.userData 
      }));
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
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
export type { UserData };
