import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import { getActiveGroup } from '../services/groupService';
import MediaDashboard from '../components/MediaDashboard';
import HeartParticles from '../components/HeartParticles';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication on initial load
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const authStatus = await isAuthenticated();
        console.log('Auth status:', authStatus);
        setAuthenticated(authStatus);

        if (!authStatus) {
          navigate('/login');
          return;
        }

        // Verifica se o usuário tem um grupo ativo
        const activeGroup = await getActiveGroup();
        if (!activeGroup) {
          navigate('/group-setup');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthenticated(false);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes from localStorage
    const handleStorageChange = () => {
      checkAuth();
    };
    
    // Also add a custom event listener for authentication changes
    const handleAuthChange = (e: Event) => {
      console.log("Auth change event detected", e);
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [navigate]);
  
  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-love-darker">
        <div className="animate-heart-beat">
          <svg className="h-16 w-16 text-love-light drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-love-darker">
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDAgQzExMC40NTcgMCAxMjAgOC45NTQzIDEyMCAyMCBDMTIwIDMxLjA0NTcgMTEwLjQ1NyA0MCAxMDAgNDAgQzg5LjU0MyA0MCA4MCAzMS4wNDU3IDgwIDIwIEM4MCA4Ljk1NDMgODkuNTQzIDAgMTAwIDAgWiIgZmlsbD0iIzlCODdGNSIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-30"></div>
      </div>
      <HeartParticles />
      
      <div className="relative z-10">
        <MediaDashboard />
      </div>
    </div>
  );
};

export default Index;
