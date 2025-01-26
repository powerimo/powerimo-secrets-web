import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useParams } from 'react-router-dom';
import { CONFIG } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Clipboard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Spinner } from '@/components/ui/spinner';
import { PasswordInput } from '@/components/ui/password-input';
import { useTranslation } from 'react-i18next';

export function Secret() {
    const { t } = useTranslation('translation', { keyPrefix: 'Secret page' });

    const FormSchema = useMemo(
        () =>
            z
                .object({
                    password: z.string().optional(),
                })
                .refine((data) => data.password && data.password.trim() !== '', {
                    message: t('Password is required'),
                    path: ['password'],
                }),
        [t],
    );

    type FormValues = z.infer<typeof FormSchema>;

    type State = {
        secretText: string | null;
        errorText: string | null;
        needPassword: boolean;
        isLoading: boolean;
    };

    type Action =
        | { type: 'FETCH_SUCCESS'; payload: string }
        | { type: 'FETCH_NEED_PASSWORD'; payload: string }
        | { type: 'FETCH_ERROR'; payload: string }
        | { type: 'SET_LOADING'; payload: boolean };

    const initialState: State = {
        secretText: null,
        errorText: null,
        needPassword: false,
        isLoading: true,
    };

    function reducer(state: State, action: Action): State {
        switch (action.type) {
            case 'FETCH_SUCCESS':
                return { ...state, secretText: action.payload, errorText: null, needPassword: false, isLoading: false };
            case 'FETCH_NEED_PASSWORD':
                return { ...state, errorText: action.payload, needPassword: true, isLoading: false };
            case 'FETCH_ERROR':
                return { ...state, errorText: action.payload, needPassword: false, isLoading: false };
            case 'SET_LOADING':
                return { ...state, isLoading: action.payload };
            default:
                return state;
        }
    }

    const { code } = useParams();
    const { toast } = useToast();
    const [state, dispatch] = useReducer(reducer, initialState);

    const form = useForm<FormValues>({
        mode: 'onSubmit',
        resolver: zodResolver(FormSchema),
        defaultValues: {
            password: '',
        },
    });

    const { handleSubmit, control } = form;

    const fetchSecret = useCallback(
        async (password?: string) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const params = password ? `?password=${encodeURIComponent(password)}` : '';
                const response = await fetch(`${CONFIG.apiSecretsUrl}/${code}${params}`, {
                    method: 'GET',
                    headers: { Accept: 'text/html' },
                });

                const text = await response.text();

                if (response.status === 200) {
                    dispatch({ type: 'FETCH_SUCCESS', payload: text });
                } else if (response.status === 401) {
                    dispatch({ type: 'FETCH_NEED_PASSWORD', payload: t(text) });
                } else {
                    dispatch({ type: 'FETCH_ERROR', payload: text || t('Failed to fetch the secret') });
                }
            } catch (error) {
                dispatch({
                    type: 'FETCH_ERROR',
                    payload: error instanceof Error ? error.message : t('Unexpected error occurred'),
                });
            }
        },
        [code],
    );

    useEffect(() => {
        fetchSecret();
    }, [code]);

    const onSubmit = (data: FormValues) => {
        fetchSecret(data.password);
    };

    const handleCopyToClipboard = async () => {
        if (!state.secretText) return;

        try {
            await navigator.clipboard.writeText(state.secretText);
            toast({
                title: t('Copied to clipboard'),
                description: state.secretText,
            });
        } catch {
            toast({
                title: t('Error'),
                description: t('Failed to copy secret to clipboard'),
                variant: 'destructive',
            });
        }
    };

    return (
        <div className='flex-1 container content-center px-4 md:px-6'>
            <Card className='w-full max-w-lg m-auto border-0'>
                <CardHeader>
                    <CardTitle>{t('The Secret')}</CardTitle>
                </CardHeader>
                <CardContent className='flex w-full flex-col space-y-4'>
                    {state.errorText && <div className='text-red-500'>{state.errorText}</div>}
                    {state.isLoading ? (
                        <Spinner />
                    ) : state.secretText ? (
                        <div className='flex items-end space-x-2'>
                            <span className='text-lg leading-9 font-semibold w-full whitespace-pre-wrap break-words'>
                                {state.secretText}
                            </span>
                            <Button
                                variant='ghost'
                                size='icon'
                                type='button'
                                onClick={handleCopyToClipboard}
                            >
                                <Clipboard />
                            </Button>
                        </div>
                    ) : (
                        state.needPassword && (
                            <Form {...form}>
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className='space-y-4'
                                >
                                    <FormField
                                        control={control}
                                        name='password'
                                        render={({ field }) => (
                                            <FormItem className='flex-1'>
                                                <FormLabel>{t('Password')}</FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        placeholder={t('password')}
                                                        {...field}
                                                        autoComplete='off'
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type='submit'
                                        className='w-full'
                                    >
                                        {t('Submit')}
                                    </Button>
                                </form>
                            </Form>
                        )
                    )}
                    <Button
                        asChild
                        variant='secondary'
                    >
                        <Link to={CONFIG.baseDir || '/'}>{t('Close')}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
