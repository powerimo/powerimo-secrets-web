import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import * as React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex min-h-screen w-full flex-col'>
            <Header />
            {children}
            <Footer />
        </div>
    );
}
