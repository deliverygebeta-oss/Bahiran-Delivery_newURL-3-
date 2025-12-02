import { createContext, useState, useContext } from 'react';

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(false);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
