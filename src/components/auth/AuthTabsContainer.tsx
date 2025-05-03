
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus } from 'lucide-react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

interface AuthTabsContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLoginSubmit: (data: { email: string, password: string }) => Promise<void>;
  onSignUpSubmit: (data: { email: string, password: string, confirmPassword: string }) => Promise<void>;
  isLoading: boolean;
}

const AuthTabsContainer: React.FC<AuthTabsContainerProps> = ({
  activeTab,
  setActiveTab,
  onLoginSubmit,
  onSignUpSubmit,
  isLoading
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="login" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Login
        </TabsTrigger>
        <TabsTrigger value="signup" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Cadastro
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <LoginForm onSubmit={onLoginSubmit} isLoading={isLoading} />
      </TabsContent>
      
      <TabsContent value="signup">
        <SignUpForm onSubmit={onSignUpSubmit} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
};

export default AuthTabsContainer;
