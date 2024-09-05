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
import { Variant } from "../page";

interface AuthFormProps {
    variant: Variant;
    setVariant: (variant: Variant) => void;
}

export default function AuthForm({ variant, setVariant }: AuthFormProps) {
    
    // 세션 정보 (클라이언트 용도)
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

    const {
        register, 
        handleSubmit,
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
            // data: register에 등록된 필드 값들
            axios.post('/api/register', data)
                // 가입 후 자동 로그인
                // credentials: 이메일, 비밀번호 사용한 로그인
                .then(() => signIn('credentials', data))
                .catch(() => toast.error('Something went wrong!'))
                .finally(() => setIsLoading(false))
        }

        // 로그인
        if (variant === 'LOGIN') {
            // signIn 사용(회원가입처럼 api url 방식 X, 기본 제공 함수) 
            signIn('credentials', {
                // 입력한 이메일, 비밀번호 (register에 등록된 필드 값)
                ...data,
                // 로그인 후 다른 화면으로 이동 X
                redirect: false,
            })
            .then((callback) => {
                // 로그인 실패
                if (callback?.error) {
                    toast.error('Invalid credentials');
                }
                // 로그인 성공
                if (callback?.ok && !callback?.error) {
                    toast.success('Logged In!')
                }
            })
            .finally(() => setIsLoading(false));
        }
    }

    // 소셜 로그인
    const socialAction = (action: string) => {
        setIsLoading(true);

        signIn(action, {
            redirect: false,
        })
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
                            type="submit"
                            disabled={isLoading}
                            fullWidth
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