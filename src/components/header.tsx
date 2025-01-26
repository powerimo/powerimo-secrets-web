import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n-config';

export function Header() {
    const { theme, setTheme } = useTheme();
    const { i18n } = useTranslation();

    return (
        <header className='sticky top-0 flex h-16 gap-4 border-b bg-background'>
            <div className='flex container items-center px-4 md:px-6'>
                <h1 className='flex-1 shrink-0 whitespace-nowrap text-xl font-semibold'>Powerimo Secrets</h1>
                <div className='flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4'>
                    <Select
                        value={i18n.language}
                        onValueChange={(l) => i18n.changeLanguage(l)}
                    >
                        <SelectTrigger className='w-full'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map((l) => (
                                <SelectItem
                                    key={l.code}
                                    value={l.code}
                                >
                                    {l.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
                        <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
                    </Button>
                </div>
            </div>
        </header>
    );
}
