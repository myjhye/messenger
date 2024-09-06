// 이미지 모달 (이미지 메세지 클릭 시 표시)

"use client"

import Modal from "@/app/components/Modal";
import Image from "next/image";

interface ImageModalProps {
    src?: string | null;
    isOpen?: boolean;
    onClose: () => void;
};

// props: MessageBox
// src: 이미지 url
export default function ImageModal({ src, isOpen, onClose }: ImageModalProps) {

    if (!src) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="w-80 h-80">
                <Image
                    alt="image modal"
                    className="object-contain"
                    fill
                    src={src}
                />
            </div>
        </Modal>
    )
}