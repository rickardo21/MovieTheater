import { createContext, useContext, useState, type ReactNode } from 'react';

interface NavBarContextType {
    activeTab: number;
    setActiveTab: (index: number) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const NavBarContext = createContext<NavBarContextType | undefined>(undefined);

export const NavBarProvider = ({ children }: { children: ReactNode }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <NavBarContext.Provider value={{ activeTab, setActiveTab, searchQuery, setSearchQuery }}>
            {children}
        </NavBarContext.Provider>
    );
};

export const useNavBar = () => {
    const context = useContext(NavBarContext);
    if (context === undefined) {
        throw new Error('useNavBar must be used within a NavBarProvider');
    }
    return context;
};
