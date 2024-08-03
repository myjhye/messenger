// auth 페이지 (회원가입, 로그인)

'use client';

import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import AuthSocialButton from "./AuthSocialButton";
import { BsGithub, BsGoogle } from "react-icons/bs";
import axios from "axios";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthFormProps {
    variant: 'LOGIN' | 'REGISTER';
    setVariant: (variant: 'LOGIN' | 'REGISTER') => void;
}

export default function AuthForm({ variant, setVariant }: AuthFormProps) {
    
    const session = useSession();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    // 로그인 된 상태면 /users 경로로 이동
    useEffect(() => {
        if (session?.status === 'authenticated') {
            router.push('/users')
        }
    }, [session?.status, router]);

    // 로그인, 회원가입 상태 토글 (상태 변경)
    const toggleVariant = useCallback(() => {
        if (variant === 'LOGIN') {
            setVariant('REGISTER');
        }
        else {
            setVariant('LOGIN');
        }
    }, [variant]);

    // useForm: 폼 상태, 유효성 검사 관리
    const {
        // 폼 필드 등록 (모든 input 필드 객체 ex. email, name, password)
        register, 
        // 폼 제출 시 호출되는 함수 래핑
        handleSubmit,
        // 유효성 검사 오류
        formState: {
            errors
        } 
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    });

    // 폼 제출
    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);

        // 회원가입
        if (variant === 'REGISTER') {
            axios.post('/api/register', data)
                // 가입 후 자동 로그인
                .then(() => signIn('credentials', data))
                .catch(() => toast.error('Something went wrong!'))
                .finally(() => setIsLoading(false))
        }

        // 로그인
        if (variant === 'LOGIN') {
            signIn('credentials', {
                ...data,
                redirect: false,
            })
            // 로그인 요청에 대한 콜백
            // callback: 반환하는 객체
            .then((callback) => {
                if (callback?.error) {
                    toast.error('Invalid credentials');
                }
                if (callback?.ok && !callback?.error) {
                    toast.success('Logged In!')
                }
            })
            .finally(() => setIsLoading(false))
        }
    }

    // 소셜 로그인 시 호출
    const socialAction = (action: string) => {
        setIsLoading(true);

        signIn(action, {
            redirect: false,
        })
        // callback: 로그인 결과
        .then((callback) => {
            if (callback?.error) {
                toast.error('Invalid credentials');
            }
            if (callback?.ok && !callback?.error) {
                toast.success('Logged In!')
            }
        })
        .finally(() => setIsLoading(false))
    }
 
    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                <form 
                    className="space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {/* 회원가입일 때만 이름 필드 표시 */}
                    {variant === 'REGISTER' && (
                        <Input
                            id="name"
                            label="Name"
                            register={register}
                            errors={errors}
                            disabled={isLoading} 
                        />
                    )}
                    <Input
                        id="email"
                        label="Email address"
                        type="email"
                        register={register}
                        errors={errors}
                        disabled={isLoading} 
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        register={register}
                        errors={errors}
                        disabled={isLoading} 
                    />
                    <div>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            type="submit"
                        >
                            {variant === 'LOGIN' 
                                ? 'Sign In' 
                                : 'Register'
                            }
                        </Button>
                    </div>
                </form>

                {/* 소셜 로그인 */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <AuthSocialButton 
                            icon={BsGithub}
                            onClick={() => socialAction('github')}
                        />
                        <AuthSocialButton 
                            icon={BsGoogle}
                            onClick={() => socialAction('google')}
                        />
                    </div>
                </div>

                <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
                    <div>
                        {variant === 'LOGIN' 
                            ? 'New to Messenger?' 
                            : 'Already have an account?'
                        }
                    </div>

                    <div
                        onClick={toggleVariant}
                        className="underline cursor-pointer"
                    >
                        {variant === 'LOGIN' 
                            ? 'Create an account' 
                            : 'Sign In'
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}