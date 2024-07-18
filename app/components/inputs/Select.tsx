// 그룹 대화에 추가할 멤버를 선택하는 드롭다운

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
export default function Select({ disabled, label, options, onChange, value}: SelectProps) {
    return (
        // z-index로 다른 요소들보다 앞에 표시되게 
        <div className="z-[100]">
            <label className="block text-sm font-medium leading-6 text-gray-900">
                {label}
            </label>
            <div className="mt-2">
                {/* 드롭다운 메뉴 */}
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