// 입력 필드 (재사용)

"use client";

import clsx from "clsx";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
    label: string;
    id: string;
    type?: string;
    required?: boolean;
    register: UseFormRegister<FieldValues>,
    errors: FieldErrors,
    disabled?: boolean,
};

export default function Input({ 
    label, 
    id, 
    type, 
    required, 
    register, 
    errors, 
    disabled 
}: InputProps) {
    return (
        <div>
            <label
                className="block text-sm font-medium leading-6 text-gray-900" 
                htmlFor={id}
            >
                {label}
            </label>
            <div className="mt-2">
                <input 
                    id={id}
                    type={type}
                    autoComplete="id"
                    disabled={disabled}
                    // id: 필드 연결 (name)
                    // required: 유효성 검사
                    {...register(id, {
                        required: required,
                    })}
                    className={
                        // clsx: 조건부 클래스 적용
                        clsx(
                            // 기본 스타일
                            `form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6`, 
                            // 오류 발생: 빨간색 테두리 클래스 적용
                            errors[id] && "focus:ring-rose-500",
                            // 비활성화 상태: 불투명도와 커서 스타일 적용  
                            disabled && 'opacity-50 cursor-default'  
                        )
                    }
                />
            </div>
        </div>
    )
}