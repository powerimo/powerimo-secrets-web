import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {useEffect, useRef, useState} from "react";
import {Link, useParams} from 'react-router-dom';
import { CONFIG } from '@/lib/config';
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Clipboard} from 'lucide-react';
import {toast} from "@/components/ui/use-toast.ts";

export function Secret() {
    const { code } = useParams();
    const [secret, setSecret] = useState<string>('');
    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState<boolean>(true);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (!code) return;

        const fetchData = async () => {
            try {
                const response = await fetch(`${CONFIG.apiSecretsUrl}/${code}`, {
                    method: 'GET',
                    headers: { 'Accept': 'text/html' },
                });

                const responseText = await response.text();

                if (response.ok) {
                    setSecret(responseText);
                    setErrorText("");
                } else {
                    setErrorText(responseText)
                    setSecret("")
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unexpected error occurred';
                console.error("Failed to fetch the secret:", errorMessage);
                setErrorText(errorMessage)
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [code]);

    useEffect(() => {
        if (!loading && textareaRef.current) {
            textareaRef.current.select(); // textarea content selection
        }
    }, [loading]);

    const buildMessage = () => {
        if (loading)
            return (<p>Loading...</p>)
        if (errorText)
            return (<p>{errorText}</p>)
        return (
            <>
                <p>Message will be deleted when you close the window!</p>
                <Textarea ref={textareaRef}  value={secret} readOnly={true}/>
                <Button
                    variant='ghost'
                    size='icon'
                    type='button'
                    onClick={copyToClipboard}>
                    <Clipboard/>
                </Button>
            </>)
    }

    const copyToClipboard = () => {
        if (secret) {
            navigator.clipboard.writeText(secret).then(() => {
                toast({ title: 'Copied to clipboard' });
            });
        }
    };

    return (
        <div className="flex-1 container content-center px-4 md:px-6">
            <Card className="w-full m-auto border-0">
                <CardHeader>
                    <CardTitle>The Secret</CardTitle>
                </CardHeader>
                <CardContent className="flex w-full flex-col space-y-6 divide-y">
                    {buildMessage()}
                    <Button
                        type='button'
                    >
                        <Link to={CONFIG.baseDir ? CONFIG.baseDir : '/'}>Close</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
