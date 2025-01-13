import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useReducer } from 'react';
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

const FormSchema = z
    .object({
        password: z.string().optional(),
    })
    .refine((data) => data.password && data.password.trim() !== '', {
        message: 'Password is required.',
        path: ['password'],
    });

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
            return { ...state, errorText: action.payload, isLoading: false };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
}

export function Secret() {
    const { code } = useParams();
    const { toast } = useToast();
    const [state, dispatch] = useReducer(reducer, initialState);

    const form = useForm<FormValues>({
        mode: 'onSubmit',
        resolver: zodResolver(FormSchema),
    });

    const { handleSubmit, control } = form;

    const fetchSecret = async (password?: string) => {
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
                dispatch({ type: 'FETCH_NEED_PASSWORD', payload: text });
            } else {
                dispatch({ type: 'FETCH_ERROR', payload: text || 'Failed to fetch the secret.' });
            }
        } catch (error) {
            dispatch({
                type: 'FETCH_ERROR',
                payload: error instanceof Error ? error.message : 'Unexpected error occurred.',
            });
        }
    };

    useEffect(() => {
        if (!code) {
            dispatch({ type: 'FETCH_ERROR', payload: 'No secret code provided.' });
            return;
        }
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
                title: 'Copied to clipboard',
                description: state.secretText,
            });
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to copy text to clipboard.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className='flex-1 container content-center px-4 md:px-6'>
            <Card className='w-full max-w-lg m-auto border-0'>
                <CardHeader>
                    <CardTitle>The Secret</CardTitle>
                </CardHeader>
                <CardContent className='flex w-full flex-col space-y-4'>
                    {state.errorText && <div className='text-red-500'>{state.errorText}</div>}
                    {state.isLoading ? (
                        <Spinner />
                    ) : state.secretText ? (
                        <div className='flex items-end space-x-2'>
                            <span className='text-lg leading-9 font-semibold w-full'>{state.secretText}</span>
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
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <PasswordInput
                                                        placeholder='password'
                                                        {...field}
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
                                        Submit
                                    </Button>
                                </form>
                            </Form>
                        )
                    )}
                    <Button
                        asChild
                        variant='secondary'
                    >
                        <Link to={CONFIG.baseDir || '/'}>Close</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
