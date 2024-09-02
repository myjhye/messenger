// 프로필 설정 모달 (이름, 프로필 사진)

"use client"

import { User } from "@prisma/client"
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../Modal";
import Input from "../inputs/Input";
import Image from "next/image";
import { CldUploadButton } from "next-cloudinary";
import Button from "../Button";

interface SettingsModalProps {
    currentUser: User | null;
    isOpen?: boolean;
    onClose: () => void;
};

// props: DesktopSidebar
export default function SettingsModal({ currentUser, isOpen, onClose }: SettingsModalProps) {
    
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 폼 상태 관리
    const {
        register,
        handleSubmit,
        // 필드 값 수동 업데이트
        setValue,
        // 필드 값 실시간 추적하고 변경 될 때마다 자동 업데이트
        watch,
        formState: {
            errors,
        },
    } = useForm<FieldValues>({
        defaultValues: {
            name: currentUser?.name,
            //image: currentUser?.image,
        }
    });

    // 이미지 필드에서 현재 이미지 값 가져오기
    const image = watch('image');

    // 이미지 업로드 핸들러
    const handleUpload = (result: any) => {
        setValue('image', result?.info?.secure_url, {
            shouldValidate: true,
        })
    }

    // 폼 제출 핸들러 (useForm으로 폼 데이터를 자동 수집해 간단 처리)
    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);
        
        axios.post('/api/settings', data)
            .then(() => {
                router.refresh();
                onClose();
            })
            .catch(() => toast.error('Something went wrong!'))
            .finally(() => setIsLoading(false))
    };
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">
                            Profile
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            Edit your public information
                        </p>
                        <div className="mt-10 flex flex-col gap-y-8">
                            <Input 
                                disabled={isLoading}
                                label="Name"
                                id="name"
                                errors={errors}
                                required
                                // 필드 연결 (기본 값 설정)
                                register={register}
                            />
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    Photo
                                </label>
                                <div className="mt-2 flex items-center gap-x-3">
                                    <Image 
                                        width="48"
                                        height="48"
                                        className="rounded-full"
                                        src={image || currentUser?.image || '/images/placeholder.jpg'}
                                        alt="Avatar"
                                    />
                                    <CldUploadButton
                                        options={{ maxFiles: 1 }}
                                        onUpload={handleUpload}
                                        uploadPreset="mdg81ikp"
                                    >
                                        <Button
                                            disabled={isLoading}
                                            secondary
                                            type="button"
                                        >
                                            Change
                                        </Button>
                                    </CldUploadButton>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center justify-end gap-x-6">  
                        <Button
                            disabled={isLoading}
                            secondary
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isLoading}
                            type="submit"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </form>    
        </Modal>
    )
}