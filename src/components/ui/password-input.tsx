import * as React from 'react';
import { EyeIcon, EyeOffIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(({ className, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const disabled = props.value === '' || props.value === undefined || props.disabled;

    const handleClear = () => {
        // Создаем искусственное событие onChange, чтобы синхронизировать родителя
        const event = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(event); // Вызываем переданный onChange, если он есть
    };

    return (
        <div className='relative w-full'>
            <Input
                type={showPassword ? 'text' : 'password'}
                className={cn('hide-password-toggle pr-10', className)}
                ref={ref}
				onChange={onChange}
                {...props}
            />
            <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-6 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={handleClear}
                disabled={disabled}
            >
                <X
                    className='h-4 w-4'
                    aria-hidden='true'
                />
            </Button>
            <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={disabled}
            >
                {showPassword && !disabled ? (
                    <EyeIcon
                        className='h-4 w-4'
                        aria-hidden='true'
                    />
                ) : (
                    <EyeOffIcon
                        className='h-4 w-4'
                        aria-hidden='true'
                    />
                )}
                <span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
            </Button>

            {/* hides browsers password toggles */}
            <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
        </div>
    );
});
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
