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

export default function MessageInput({ placeholder, id, type, required, register, errors }: MessageInputProps) {
    return (
        <div className="relative w-full">
            <input 
                id={id}
                type={type}
                autoComplete={id}
                {...register(id, { required: required })}
                placeholder={placeholder}
                className="text-black font-light py-2 px-4 bg-neutral-100 w-full rounded-full focus:outline-none"
            />
        </div>
    )
}