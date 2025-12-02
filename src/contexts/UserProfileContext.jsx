import { createContext, useState, useContext } from 'react';

const UserProfileContext = createContext();

export const UserProfileProvider = ({ child }) => {
  const [userProfile, setUserProfile] = useState(false);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
      {child}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
