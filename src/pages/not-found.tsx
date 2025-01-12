import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator';
import { CONFIG } from '@/lib/config';

export function NotFound() {
    return (
        <div className='flex-1 container content-center px-4 md:px-6'>
            <div className='w-full max-w-lg m-auto'>
                <h3 className='scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0'>
                    Error 404
                </h3>
                <Separator className='my-10'/>
                <h1 className='scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mb-8'>
                    We're sorry<br/>
                    Your link not found or expired
                </h1>
                <a href={`${CONFIG.baseDir}/`} className={buttonVariants({ variant: 'secondary' })}>
                    Create another link
                </a>
            </div>
        </div>
    );
}