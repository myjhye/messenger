// 대화 세부 정보 보여주는 사이드 패널
// 대화 삭제 버튼으로 삭제

import useOtherUser from "@/app/hooks/useOtherUser";
import { Conversation, User } from "@prisma/client";
import { Fragment, useMemo, useState } from "react";
import { format } from "date-fns";
import { Dialog, Transition } from "@headlessui/react";
import { IoClose, IoTrash } from "react-icons/io5";
import Avatar from "@/app/components/Avatar";
import ConfirmModal from "./ConfirmModal";
import AvatarGroup from "@/app/components/AvatarGroup";

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    data: Conversation & {
        users: User[]
    }
}

// props: Header
// data: 특정 대화 정보
export default function ProfileDrawer({ isOpen, onClose, data }: ProfileDrawerProps) {

    // 대화에서 현재 사용자 외 다른 사용자 가져오기
    const otherUser = useOtherUser(data);
    // 삭제 확인 모달
    const [confirmOpen, setConfirmOpen] = useState(false);

    // 다른 사용자의 가입 날짜 포맷팅
    const joinedDate = useMemo(() => {
        return format(new Date(otherUser.createdAt), 'PP');
    }, [otherUser.createdAt]);

    // 대화 제목 또는 다른 사용자 이름
    const title = useMemo(() => {
        return data.name || otherUser.name;
    }, [data.name, otherUser.name]);

    // 그룹 대화인 경우 멤버 수 표시 / 그룹 대화가 아니면 Active 표시
    const statusText = useMemo(() => {
        if (data.isGroup) {
            return `${data.users.length} members`;
        }

        return 'Active';
    }, [data]);

    return (
        <>
            <ConfirmModal 
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
            />
            <Transition.Root 
                show={isOpen}
                as={Fragment}
            >
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={onClose}

                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-40">

                        </div>
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                <Transition.Child
                                    as={Fragment}
                                    enter="translate-x-full ease-in-out duration-500"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-500"
                                    leaveTo="translate-x-full"
                                >
                                    <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                        <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                            <div className="px-4 sm:px-6">
                                                <div className="flex items-start justify-end">
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            onClick={onClose}
                                                            type="button"
                                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                                                        >
                                                            <span className="sr-only">
                                                                Close panel
                                                            </span>
                                                            <IoClose size={24} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-2">
                                                    {data.isGroup ? (
                                                        <AvatarGroup users={data.users} />
                                                    ) : (
                                                        // 대화에서 상대방 아바타
                                                        <Avatar user={otherUser} />
                                                    )}
                                                    </div>
                                                    <div>
                                                        {title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {statusText}
                                                    </div>
                                                    {/* 삭제 버튼 */}
                                                    <div className="flex gap-10 my-8">
                                                        <div
                                                            onClick={() => setConfirmOpen(true)} 
                                                            className="flex flex-col gap-3 items-center cursor-pointer hover:opacity-75"
                                                        >
                                                            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                                                                <IoTrash size={20} />
                                                            </div>
                                                            <div className="text-sm font-light text-neutral-600">
                                                                Delete
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full pb-5 pt-5 sm:px-0 sm:pt-0">
                                                        <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
                                                            {data.isGroup && (
                                                                <div>
                                                                    <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                                                        Emails
                                                                    </dt>
                                                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                                                                        {data.users.map((user) => (
                                                                            <div 
                                                                                key={user.id}
                                                                                className="inline-block bg-gray-100 text-gray-800 py-1 px-2 rounded-full mr-1 mb-1"
                                                                            >
                                                                                {user.email}
                                                                            </div>
                                                                        ))}
                                                                    </dd>
                                                                </div>
                                                            )}
                                                            {!data.isGroup && (
                                                                <div>
                                                                    <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                                                        Email
                                                                    </dt>
                                                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                                                                        {otherUser.email}
                                                                    </dd>
                                                                </div>
                                                            )}
                                                            {!data.isGroup && (
                                                                <>
                                                                    <hr />
                                                                    <div>
                                                                        <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                                                            Joined
                                                                        </dt>
                                                                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                                                                            <time dateTime={joinedDate}>{joinedDate}</time>
                                                                        </dd>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </dl>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    )
}

{/*

전체 순서
1. Transition.Root
2. Dialog
3. Transition.Child (1번째: 배경)
4. 모달 컨테이너 (div 요소들)
5. Transition.Child (2번째: 모달 패널 전환 애니메이션)
6. Dialog.Panel
7. 모달 내부 구조 (div, button, AvatarGroup, Avatar, dl, dt, dd)

*/}