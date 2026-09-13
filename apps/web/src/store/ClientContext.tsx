import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { ApiClient } from "@movietheater/shared/src/api/index.ts";

interface ClientContextType {
    client: ApiClient;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
    const client = useMemo(() => {
        return new ApiClient();
    }, []);

    return (
        <ClientContext.Provider value={{ client }}>
            {children}
        </ClientContext.Provider>
    );
};

export const useClient = () => {
    const context = useContext(ClientContext);
    if (context === undefined) {
        throw new Error('useClient must be used within a ClientProvider');
    }
    return context.client;
};
