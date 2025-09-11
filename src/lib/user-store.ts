// Store para manejar datos del usuario de manera centralizada
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
}

// Datos por defecto del usuario (los que has configurado)
const DEFAULT_USER_DATA: UserData = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '',
  bio: 'Full-stack developer apasionado por crear aplicaciones web modernas y escalables.',
  location: 'Madrid, España',
  company: 'Tech Innovators S.L.',
  website: 'https://johndoe.dev',
  joinedAt: '2023-08-15',
  plan: 'Pro'
};

class UserStore {
  private static instance: UserStore;
  private userData: UserData;

  private constructor() {
    // Cargar datos del localStorage o usar valores por defecto
    const savedData = localStorage.getItem('xistra-user-data');
    this.userData = savedData ? JSON.parse(savedData) : { ...DEFAULT_USER_DATA };
  }

  public static getInstance(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  public getUserData(): UserData {
    return { ...this.userData };
  }

  public updateUserData(data: Partial<UserData>): void {
    this.userData = { ...this.userData, ...data };
    localStorage.setItem('xistra-user-data', JSON.stringify(this.userData));
    
    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('user-data-updated', { 
      detail: this.userData 
    }));
  }

  public updateProfile(profile: { name: string; email: string; bio: string; location: string; company: string; website: string }): void {
    this.updateUserData(profile);
  }

  public updateAvatar(avatarUrl: string): void {
    this.updateUserData({ avatar: avatarUrl });
  }
}

export const userStore = UserStore.getInstance();
export type { UserData };
