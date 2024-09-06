// 드롭다운 (그룹 대화에 추가할 멤버 선택)

"use client"

import ReactSelect from "react-select";

interface SelectProps {
    disabled?: boolean;
    label: string;
    options: Record<string, any>[];
    onChange: (value: Record<string, any>) => void;
    value?: Record<string, any>;
};

// props: GroupChatModal
// disabled: 로딩 시 비활성화
// label: 선택 필드 위 표시되는 텍스트 ("Members")
// options: 선택 항목 배열 (value(실제 사용 값, user.id), label(사용자에게 표시되는 값, user.name)로 구성)
// onChange: 사용자가 선택 변경 시 호출되는 콜백 함수, 폼 필드 값 업데이트 (members)
// value: 현재 선택된 값
export default function Select({ disabled, label, options, onChange, value}: SelectProps) {
    return (
        // z-index로 모달 앞에 표시
        <div className="z-[100]">
            <label className="block text-sm font-medium leading-6 text-gray-900">
                {label}
            </label>
            <div className="mt-2">
                {/* 드롭다운 */}
                <ReactSelect 
                    isDisabled={disabled}
                    // 현재 선택된 옵션 값
                    value={value}
                    onChange={onChange}
                    // 다중 선택 가능
                    isMulti
                    // 선택 가능한 옵션 목록
                    options={options}
                    // 메뉴 포탈 타겟을 body로 설정해 z-index 문제 해결
                    menuPortalTarget={document.body}
                    styles={{
                        menuPortal: (base) => ({
                            // 기본 스타일 유지
                            ...base,
                            // 드롭다운 메뉴가 다른 요소들보다 위에 표시
                            zIndex: 9999,
                        })
                    }}
                    classNames={{
                        control: () => "text-sm"
                    }}
                />
            </div>
        </div>
    )
}