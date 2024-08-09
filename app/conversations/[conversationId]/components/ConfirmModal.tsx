// 대화 삭제 확인 모달

"use client"

import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import useConversation from "@/app/hooks/useConversation";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmModalProps {
    isOpen?: boolean;
    onClose: () => void;
};

// props: ProfileDrawer
export default function ConfirmModal({ isOpen, onClose }: ConfirmModalProps) {

    const router = useRouter();
    const { conversationId } = useConversation();
    const [isLoading, setIsLoading] = useState(false);

    // 대화 삭제
    const onDelete = useCallback(() => {
        setIsLoading(true);

        // 대화 삭제 요청 
        axios.delete(`/api/conversations/${conversationId}`)
            .then(() => {
                // 모달 닫기
                onClose();
                // 대화 목록 페이지로 이동
                router.push('/conversations');
                // 페이지 새로고침
                router.refresh();
            })
            .catch(() => toast.error('Something went wrong!'))
            .finally(() => setIsLoading(false))


    // conversationId: 사용자가 다른 대화 선택 시
    // router: 페이지 이동이나 새로고침 시
    // onClose: 모달 닫는 함수가 변경 시
    }, [conversationId, router, onClose]);


    return (
        <div>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
            >
                <div className="sm:flex sm:justify-center sm:gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10">
                        <FiAlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                        <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                        >
                            Delete conversation
                        </Dialog.Title>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete this conversation? <br />
                                This action cannot be undone.
                            </p>
                        </div>    
                    </div>  
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <Button
                        disabled={isLoading}
                        danger
                        onClick={onDelete}
                    >
                        Delete
                    </Button>
                    <Button
                        disabled={isLoading}
                        secondary
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
