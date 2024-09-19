// 메세지 입력 필드

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface MessageInputProps {
    placeholder?: string;
    id: string;
    type?: string;
    required?: boolean;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
}

export default function MessageInput({ id, type, placeholder, register, required }: MessageInputProps) {
    return (
        <div className="relative w-full">
            <input 
                id={id}
                type={type}
                // autoComplete: 이전에 입력한 메세지 기억해서 자동 완성 제안
                autoComplete={id}
                // register: id에 해당하는 입력 필드 등록해서, 그 필드의 값 관리
                {...register(id, { required: required })}
                placeholder={placeholder}
                className="text-black font-light py-2 px-4 bg-neutral-100 w-full rounded-full focus:outline-none"
            />
        </div>
    )
}