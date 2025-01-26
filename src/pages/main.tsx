import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { CONFIG } from '@/lib/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clipboard } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { PasswordInput } from '@/components/ui/password-input';
import { useTranslation } from 'react-i18next';

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const HOURS = [...Array(24).keys()];
const MINUTES = [...Array(12)].map((_, i) => i * 5);

export function Main() {
    const { t } = useTranslation('translation', { keyPrefix: 'Main page' });

    const FormSchema = useMemo(
        () =>
            z.object({
                secretText: z.string().min(1, { message: t('Secret cannot be empty') }),
                dateTime: z
                    .date()
                    .refine((date) => date > new Date(), { message: t('Expiration time must be in the future') }),
                hitLimit: z.coerce.number({ message: 'Please enter a valid positive integer' }).int().positive(),
                password: z.string().optional(),
                secretUrl: z.string().optional(),
            }),
        [t],
    );

    type FormValues = z.infer<typeof FormSchema>;

    const form = useForm<FormValues>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: {
            secretText: '',
            dateTime: new Date(TODAY.getFullYear() + 1, TODAY.getMonth(), TODAY.getDate()),
            hitLimit: 1,
            password: '',
            secretUrl: '',
        },
    });

    const { reset, getValues, setValue, handleSubmit, control } = form;
    const { toast } = useToast();

    const createSecret: SubmitHandler<FormValues> = useCallback(
        async (data: FormValues) => {
            try {
                const ttl = Math.round((data.dateTime.getTime() - Date.now()) / 1000);

                const response = await fetch(CONFIG.apiSecretsUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        secret: data.secretText,
                        hitLimit: data.hitLimit,
                        ttl,
                        password: data.password && data.password !== '' ? data.password : null,
                    }),
                });

                if (response.ok) {
                    const { url } = await response.json();
                    reset({ secretUrl: url });

                    if (navigator.clipboard) {
                        await navigator.clipboard.writeText(url);
                        toast({
                            title: t('Link to your secret created and copied to clipboard'),
                            description: url,
                        });
                    } else {
                        toast({
                            title: t('Link to your secret created'),
                            description: url,
                        });
                    }
                } else {
                    const errorData = await response.json();
                    toast({
                        title: `${t('Error')} ${response.status}`,
                        description: errorData.message || response.statusText,
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Failed to create secret:', error);
                toast({
                    title: t('Unexpected error'),
                    description: t('Please try again later'),
                    variant: 'destructive',
                });
            }
        },
        [reset],
    );

    const copyToClipboard = useCallback(() => {
        const secretUrl = getValues('secretUrl');
        if (secretUrl && navigator.clipboard) {
            navigator.clipboard.writeText(secretUrl);
            toast({
                title: t('Link copied to clipboard'),
                description: secretUrl,
            });
        }
    }, [getValues]);

    const updateDateTime = useCallback(
        (type: 'hour' | 'minute', value: number) => {
            const currentDate = getValues('dateTime') || new Date();
            const updatedDate = new Date(currentDate);

            if (type === 'hour') {
                updatedDate.setHours(value);
            } else {
                updatedDate.setMinutes(value);
            }

            setValue('dateTime', updatedDate, { shouldValidate: true });
        },
        [getValues, setValue],
    );

    return (
        <div className='flex-1 container content-center px-4 md:px-6'>
            <Card className='w-full max-w-lg m-auto border-0'>
                <CardHeader>
                    <CardTitle>{t('New secret')}</CardTitle>
                </CardHeader>
                <CardContent className='flex w-full flex-col'>
                    <Form {...form}>
                        <form
                            onSubmit={handleSubmit(createSecret)}
                            className='space-y-4'
                        >
                            <FormField
                                control={control}
                                name='secretText'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('Enter the secret')}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t('Your secret')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='flex flex-row space-x-6'>
                                <FormField
                                    control={control}
                                    name='dateTime'
                                    render={({ field }) => (
                                        <FormItem className='flex-1'>
                                            <FormLabel>{t('Expiration time')}</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant='outline'
                                                            type='button'
                                                            className={cn(
                                                                'justify-start font-normal px-3 w-full',
                                                                !field.value && 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {field.value
                                                                ? format(field.value, 'dd.MM.yyyy HH:mm')
                                                                : t('Click to select')}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0'>
                                                    <div className='sm:flex'>
                                                        <Calendar
                                                            mode='single'
                                                            selected={field.value}
                                                            onSelect={(date) =>
                                                                date &&
                                                                setValue('dateTime', date, { shouldValidate: true })
                                                            }
                                                            disabled={(date) => date < TODAY}
                                                            initialFocus
                                                        />
                                                        <div className='flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x'>
                                                            <ScrollArea className='w-64 sm:w-auto'>
                                                                <div className='flex sm:flex-col p-2'>
                                                                    {HOURS.map((hour) => (
                                                                        <Button
                                                                            key={hour}
                                                                            size='icon'
                                                                            variant={
                                                                                field.value?.getHours() === hour
                                                                                    ? 'default'
                                                                                    : 'ghost'
                                                                            }
                                                                            className='sm:w-full shrink-0 aspect-square'
                                                                            onClick={() => updateDateTime('hour', hour)}
                                                                        >
                                                                            {hour}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                                <ScrollBar
                                                                    orientation='horizontal'
                                                                    className='sm:hidden'
                                                                />
                                                            </ScrollArea>
                                                            <ScrollArea className='w-64 sm:w-auto'>
                                                                <div className='flex sm:flex-col p-2'>
                                                                    {MINUTES.map((minute) => (
                                                                        <Button
                                                                            key={minute}
                                                                            size='icon'
                                                                            variant={
                                                                                field.value?.getMinutes() === minute
                                                                                    ? 'default'
                                                                                    : 'ghost'
                                                                            }
                                                                            className='sm:w-full shrink-0 aspect-square'
                                                                            onClick={() =>
                                                                                updateDateTime('minute', minute)
                                                                            }
                                                                        >
                                                                            {minute.toString().padStart(2, '0')}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                                <ScrollBar
                                                                    orientation='horizontal'
                                                                    className='sm:hidden'
                                                                />
                                                            </ScrollArea>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name='hitLimit'
                                    render={({ field }) => (
                                        <FormItem className='flex-1'>
                                            <FormLabel>{t('Hit limit')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className='tabular-nums'
                                                    placeholder='Input limit'
                                                    {...field}
                                                    value={field.value ?? ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem className='flex-1'>
                                        <FormLabel>{t('Password (optional)')}</FormLabel>
                                        <FormControl>
                                            <PasswordInput
                                                placeholder={t('Password')}
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
                                {t('Create')}
                            </Button>
                            <FormField
                                control={control}
                                name='secretUrl'
                                render={({ field }) => {
                                    return field.value ? (
                                        <>
                                            <Separator className='my-8' />
                                            <div className='flex w-full flex-col'>
                                                <span className='text-sm font-medium leading-none'>
                                                    {t('Link to your secret')}
                                                </span>
                                                <div className='flex items-end space-x-2'>
                                                    <ScrollArea className='text-lg leading-9 font-semibold whitespace-nowrap'>
                                                        {field.value}
                                                        <ScrollBar
                                                            orientation='horizontal'
                                                            className='mt-2'
                                                        />
                                                    </ScrollArea>
                                                    {navigator.clipboard && (
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            type='button'
                                                            className='flex-none'
                                                            onClick={copyToClipboard}
                                                        >
                                                            <Clipboard />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <></>
                                    );
                                }}
                            />
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
