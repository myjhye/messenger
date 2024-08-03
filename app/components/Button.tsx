// 버튼 (재사용)

'use client';

import clsx from "clsx";

interface ButtonProps {
    type?: 'button' | 'submit' | 'reset' | undefined;
    fullWidth?: boolean;
    children?: React.ReactNode;
    onClick?: () => void;
    secondary?: boolean;
    danger?: boolean;
    disabled?: boolean;
};

export default function Button({
    disabled,
    fullWidth,
    type,
    children,
    onClick,
    secondary,
    danger,
}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={
                clsx(`flex justify-center rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`,
                // 비활성화 상태
                disabled && "opacity-50 cursor-default",
                // fullWidth가 true일 때 전체 너비 스타일 적용
                fullWidth && "w-full",
                // secondary가 true 상태일 때 텍스트 색상 설정
                secondary ? 'text-gray-900' : 'text-white',
                // danger가 true일 때 배경색과 hover, focus 스타일 적용
                danger && "bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600",
                // secondary와 danger가 모두 false일 때 기본 배경색과 hover, focus 스타일 적용
                !secondary && !danger && "bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600",
            )}
        >
            {/* 버튼 내부 텍스트 */}
            {children}
        </button>
    )
}