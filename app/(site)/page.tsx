// 홈

'use client';

import Image from "next/image";
import AuthForm from "./components/AuthForm";
import { useState } from "react";

type Variant = 'LOGIN' | 'REGISTER';

export default function Home() {
    const [variant, setVariant] = useState<Variant>('LOGIN');

    return (
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-100">
            <div className="sm:mx-auto sm:W-full sm:max-w-md">
                <Image 
                    alt="Logo"
                    height="48"
                    width="48"
                    className="mx-auto w-auto"
                    src="/images/logo.png"
                />
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    {variant === 'LOGIN' ? 'Sign In' : 'Create an account'}
                </h2>
            </div>
            {/* auth 페이지 (회원가입, 로그인) */}
            <AuthForm 
                variant={variant}
                setVariant={setVariant}
            />
        </div>
    )
}