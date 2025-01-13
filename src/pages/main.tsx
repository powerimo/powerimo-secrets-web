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

const FormSchema = z.object({
    secretText: z.string().min(1, { message: 'Secret can not be empty' }),
    dateTime: z.date().refine((date) => date > new Date(), { message: 'The date must be in the future.' }),
    hitLimit: z.coerce.number({ message: 'Please enter a valid positive integer' }).int().positive(),
    password: z.string(),
    secretUrl: z.string(),
});

type Form = z.infer<typeof FormSchema>;

const today = new Date();
today.setHours(0, 0, 0, 0);

export function Main() {
    const form = useForm<Form>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: {
            secretText: '',
            dateTime: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
            hitLimit: 1,
            password: '',
            secretUrl: '',
        },
    });

    const { reset, getValues, setValue, handleSubmit, control } = form;

    const { toast } = useToast();

    const createSecret: SubmitHandler<Form> = async (data) => {
        const ttl = Math.round((data.dateTime.getTime() - Date.now()) / 1000);

        const response = await fetch(CONFIG.apiSecretsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret: data.secretText,
                hitLimit: data.hitLimit,
                ttl,
                password: data.password && data.password != "" ? data.password : null,
            }),
        });
        if (response.ok) {
            const { url } = await response.json();
            reset({ secretUrl: url });

            if (navigator.clipboard) {
                navigator.clipboard.writeText(url);
                toast({
                    title: 'Link to your secret created and copied to clipboard',
                    description: url,
                });
            } else {
                toast({
                    title: 'Link to your secret created',
                    description: url,
                });
            }
        } else {
            const errorData = await response.json();
            toast({
                title: `Error ${response.status}`,
                description: errorData.message || response.statusText,
                variant: 'destructive',
            });
        }
    };

    const handleToClipboard = () => {
        if (!navigator.clipboard) return;

        const secretUrl = getValues('secretUrl');

        if (secretUrl) {
            navigator.clipboard.writeText(secretUrl);
            toast({
                title: 'Link to your secret copied to clipboard',
                description: secretUrl,
            });
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setValue('dateTime', date, { shouldValidate: true });
        }
    };

    const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
        const currentDate = form.getValues('dateTime') || new Date();
        let newDate = new Date(currentDate);

        if (type === 'hour') {
            const hour = parseInt(value, 10);
            newDate.setHours(hour);
        } else if (type === 'minute') {
            newDate.setMinutes(parseInt(value, 10));
        }

        setValue('dateTime', newDate, { shouldValidate: true });
    };

    return (
        <div className='flex-1 container content-center px-4 md:px-6'>
            <Card className='w-full max-w-lg m-auto border-0'>
                <CardHeader>
                    <CardTitle>Create secret</CardTitle>
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
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Enter the secret</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder='your secret'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <div className='flex flex-row space-x-6'>
                                <FormField
                                    control={form.control}
                                    name='dateTime'
                                    render={({ field }) => (
                                        <FormItem className='flex-1'>
                                            <FormLabel>Expiration time</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={'outline'}
                                                            type='button'
                                                            className={cn(
                                                                'justify-start font-normal px-3 w-full',
                                                                !field.value && 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, 'dd.MM.yyyy HH:mm')
                                                            ) : (
                                                                <span>click to select</span>
                                                            )}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0'>
                                                    <div className='sm:flex'>
                                                        <Calendar
                                                            mode='single'
                                                            selected={field.value}
                                                            onSelect={handleDateSelect}
                                                            disabled={(date) => date < today}
                                                            initialFocus
                                                        />
                                                        <div className='flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x'>
                                                            <ScrollArea className='w-64 sm:w-auto'>
                                                                <div className='flex sm:flex-col p-2'>
                                                                    {Array.from({ length: 24 }, (_, i) => i).map(
                                                                        (hour) => (
                                                                            <Button
                                                                                key={hour}
                                                                                size='icon'
                                                                                variant={
                                                                                    field.value &&
                                                                                    field.value.getHours() === hour
                                                                                        ? 'default'
                                                                                        : 'ghost'
                                                                                }
                                                                                className='sm:w-full shrink-0 aspect-square'
                                                                                onClick={() =>
                                                                                    handleTimeChange(
                                                                                        'hour',
                                                                                        hour.toString(),
                                                                                    )
                                                                                }
                                                                            >
                                                                                {hour}
                                                                            </Button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                                <ScrollBar
                                                                    orientation='horizontal'
                                                                    className='sm:hidden'
                                                                />
                                                            </ScrollArea>
                                                            <ScrollArea className='w-64 sm:w-auto'>
                                                                <div className='flex sm:flex-col p-2'>
                                                                    {Array.from({ length: 12 }, (_, i) => i * 5).map(
                                                                        (minute) => (
                                                                            <Button
                                                                                key={minute}
                                                                                size='icon'
                                                                                variant={
                                                                                    field.value &&
                                                                                    field.value.getMinutes() === minute
                                                                                        ? 'default'
                                                                                        : 'ghost'
                                                                                }
                                                                                className='sm:w-full shrink-0 aspect-square'
                                                                                onClick={() =>
                                                                                    handleTimeChange(
                                                                                        'minute',
                                                                                        minute.toString(),
                                                                                    )
                                                                                }
                                                                            >
                                                                                {minute.toString().padStart(2, '0')}
                                                                            </Button>
                                                                        ),
                                                                    )}
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
                                    render={({ field }) => {
                                        return (
                                            <FormItem className='flex-1'>
                                                <FormLabel>Hit limit</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className='tabular-nums'
                                                        placeholder='input limit'
                                                        {...field}
                                                        value={field.value ?? ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>
                            <FormField
                                control={control}
                                name='password'
                                render={({ field }) => {
                                    return (
                                        <FormItem className='flex-1'>
                                            <FormLabel>Password (optional)</FormLabel>
                                            <FormControl>
                                                <PasswordInput
                                                    placeholder='password'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <Button
                                type='submit'
                                className='w-full'
                            >
                                Create secret
                            </Button>
                            <FormField
                                control={control}
                                name='secretUrl'
                                render={({ field }) => {
                                    return !!field.value ? (
                                        <>
                                            <Separator className='my-8' />
                                            <div className='flex w-full flex-col'>
                                                <span className='text-sm font-medium leading-none'>
                                                    Link to your secret
                                                </span>
                                                <div className='flex items-end space-x-2'>
                                                    <ScrollArea className='text-lg leading-9 font-semibold whitespace-nowrap'>
                                                        {field.value}
                                                        <ScrollBar orientation='horizontal' className='mt-2' />
                                                    </ScrollArea>

                                                    {navigator.clipboard && (
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            type='button'
                                                            className='flex-none'
                                                            onClick={handleToClipboard}
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
