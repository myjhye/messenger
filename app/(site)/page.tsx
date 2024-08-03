// 홈

'use client';

import Image from "next/image";
import AuthForm from "./components/AuthForm";
import { useState } from "react";

type Variant = 'LOGIN' | 'REGISTER';

export default function Home() {

    // 현재 상태 - 로그인, 회원가입
    const [variant, setVariant] = useState<Variant>('LOGIN');

    return (
        // 페이지의 전체 레이아웃 설정 - 수직 중앙 정렬, 배경색 회색
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-100">
            <div className="sm:mx-auto sm:W-full sm:max-w-md">
                <Image 
                    alt="Logo"
                    height="48"
                    width="48"
                    className="mx-auto w-auto"
                    src="/images/logo.png"
                />
                {/* 현재 상태에 따라 제목 표시 */}
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    {variant === 'LOGIN' ? 'Sign In' : 'Create an account'}
                </h2>
            </div>
            {/* auth 컴포넌트 (회원가입, 로그인) */}
            <AuthForm 
                variant={variant}
                setVariant={setVariant}
            />
        </div>
    )
}