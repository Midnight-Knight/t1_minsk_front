"use client";
import {useEffect, useRef} from "react";

interface Props {
    url: string;
    disabled: boolean;
    callback: ((data: {accuracy: number
        audience: string
        category: string
        subCategory: string
        priority: string
        question: string
        answer: string
        id: string}[]) => void) | null;
}

export default function ChatClient({url, disabled, callback}: Props) {
    const chatRef = useRef(null);

    useEffect(() => {
        (async () => {
            // @ts-ignore
            await import("./../../../public/chat-client.js");
            if (chatRef.current) {
                // @ts-ignore
                chatRef.current.callback = callback;
                // @ts-ignore
                chatRef.current.disabled = disabled;
            }
        })()
    }, []);

    // @ts-ignore
    return (
        <>
            {/* @ts-ignore*/}
            <chat-client ref={chatRef} url={url}></chat-client>
        </>
    );
}
