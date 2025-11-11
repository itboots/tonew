'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

type Theme = 'apple' | 'cyberpunk';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [theme, setThemeState] = useState<Theme>('apple');
  const [isLoading, setIsLoading] = useState(true);

  // 从服务器加载用户偏好
  useEffect(() => {
    if (user) {
      loadThemePreference();
    } else {
      // 未登录用户从 localStorage 加载
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
          setThemeState(savedTheme);
          applyTheme(savedTheme);
        }
      }
      setIsLoading(false);
    }
  }, [user]);

  const loadThemePreference = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      const data = await response.json();

      if (data.success && data.preferences?.theme) {
        const userTheme = data.preferences.theme as Theme;
        setThemeState(userTheme);
        applyTheme(userTheme);
      }
    } catch (error) {
      console.error('加载主题偏好失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }

    // 如果用户已登录，保存到服务器
    if (user) {
      try {
        await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: newTheme })
        });
      } catch (error) {
        console.error('保存主题偏好失败:', error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'apple' ? 'cyberpunk' : 'apple';
    setTheme(newTheme);
  };

  const applyTheme = (themeToApply: Theme) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeToApply);
    }
  };

  // 始终提供 context value，即使在 loading 期间
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
