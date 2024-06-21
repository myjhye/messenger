// 메세지 입력 폼

"use client"

import useConversation from "@/app/hooks/useConversation"
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";
import MessageInput from "./MessageInput";
import { CldUploadButton } from "next-cloudinary";

export default function Form() {

    const { conversationId } = useConversation();

    const { 
        register, 
        handleSubmit, 
        setValue,
        formState: {
            errors,
        }
    } = useForm<FieldValues>({
        defaultValues: {
            message: ''
        }
    });


    // 폼 제출 실행 함수
    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        // 메세지 필드 초기화
        setValue('message', '', { shouldValidate: true });
        // 서버에 메세지 전송
        axios.post('/api/messages', {
            // 1. 폼 데이터
            ...data,
            // 2. 현재 대화 ID
            conversationId: conversationId,
        })
    };

    const handleUpload = (result: any) => {
        axios.post('/api/messages', {
            image: result?.info?.secure_url,
            conversationId,
        })
    }

    return (
        <div className="py-4 px-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full">
            
            <CldUploadButton
                options={{ maxFiles: 1 }}
                onUpload={handleUpload}
                uploadPreset="mdg81ikp"
            >
                {/* 사진 업로드 버튼 */}
                <HiPhoto 
                    size={30}
                    className="text-sky-500"
                />
            </CldUploadButton>
            <form 
                onSubmit={handleSubmit(onSubmit)}
                className="flex items-center gap-2 lg:gap-4 w-full"
            >
                <MessageInput 
                    id="message"
                    register={register}
                    errors={errors}
                    required
                    placeholder="Write a message"
                />
                <button
                    type="submit"
                    className="rounded-full p-2 bg-sky-500 cursor-pointer hover:bg-sky-600 transition"
                >
                    <HiPaperAirplane 
                        size={18}
                        className="text-white"
                    />
                </button>
            </form>   
        </div>
    )
}