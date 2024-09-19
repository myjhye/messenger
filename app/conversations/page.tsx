// 대화가 선택되지 않았을 때 빈 상태(EmptyState)를 표시
// 대화가 선택되었을 때(isOpen) 빈 상태 사라짐

"use client"

import clsx from "clsx";
import EmptyState from "../components/EmptyState";
import useConversation from "../hooks/useConversation"

export default function Home() {
    const { isOpen } = useConversation();

    return (
        <div className={clsx("lg:pl-80 h-full lg:block", isOpen ? "block" : "hidden")}>
            <EmptyState />
        </div>
    )
}