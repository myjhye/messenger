// 채팅방 생성 모달

"use client"

import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import Input from "@/app/components/inputs/Input";
import Select from "@/app/components/inputs/Select";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface GroupChatModalProps {
    isOpen?: boolean;
    onClose: () => void;
    users: User[];
}

// props: ConversationList
// users: 현재 사용자 제외한 모든 사용자 목록 (그룹 채팅 생성 모달에서 사용자 목록 조회 용도)
export default function GroupChatModal({ isOpen, onClose, users }: GroupChatModalProps) {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        },
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            members: [],
        }
    });

    const members = watch('members');

    // 폼 제출
    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);

        // 서버로 폼 데이터(name, members) 전송해 그룹 대화 생성
        axios.post('/api/conversations', {
            ...data,
            // 그룹 대화 생성임을 명시
            isGroup: true
        })
        .then(() => {
            onClose();
        })
        .catch(() => toast.error('Something went wrong!'))
        .finally(() => setIsLoading(false))
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">
                            Create a group chat
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            Create a chat with more than 2 people
                        </p>
                        <div className="mt-10 flex flex-col gap-y-8">
                            {/* 그룹 이름 입력 필드 */}
                            <Input 
                                label="Name"
                                id="name"
                                required
                                register={register}
                                errors={errors}
                                disabled={isLoading}
                            />
                            {/* 그룹 멤버 선택 필드 */}
                            <Select 
                                disabled={isLoading}
                                label="Members"
                                options={users.map((user) => ({
                                    value: user.id,
                                    label: user.name,
                                }))}
                                onChange={(value) => setValue('members', value, {
                                    shouldValidate: true
                                })}
                                // 선택된 멤버 값
                                value={members}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    {/* 취소 버튼 */}
                    <Button
                        disabled={isLoading}
                        onClick={onClose}
                        type="button"
                        secondary
                    >
                        Cancel
                    </Button>
                    {/* 그룹 생성 버튼 */}
                    <Button
                        disabled={isLoading}
                        type="submit"
                    >
                        Create
                    </Button>
                </div>
            </form>
        </Modal>
    )
}