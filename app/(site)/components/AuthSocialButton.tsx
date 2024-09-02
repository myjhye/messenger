// 소셜 로그인 버튼 (재사용)

import { IconType } from "react-icons"

interface AuthSocialButtonProps {
    // IconType: 소셜 로그인 아이콘 타입
    icon: IconType,
    onClick: () => void;
}

export default function AuthSocialButton({ 
    icon: Icon, 
    onClick 
}: AuthSocialButtonProps) {
    return (
        <button
            // 버튼 타입 (button)
            type="button"
            // 버튼 클릭 시 실행 함수
            onClick={onClick}
            className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
        >
            {/* 버튼 내 아이콘 */}
            <Icon />
        </button>
    )
}