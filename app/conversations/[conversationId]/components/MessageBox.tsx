"use client";

import Avatar from "@/app/components/Avatar";
import { FullMessageType } from "@/app/types";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import ImageModal from "./ImageModal";

interface MessageBoxProps {
    data: FullMessageType;
    isLast?: boolean;
}

export default function MessageBox({ data, isLast }: MessageBoxProps) {
    const session = useSession();
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const isOwn = session?.data?.user?.email === data?.sender?.email;

    const seenList = (data.seen || [])
        .filter((user) => user.email !== data?.sender?.email)
        .map((user) => user.name)
        .join(', ');

    const container = clsx("flex gap-3 p-4 relative group", isOwn && "justify-end");
    const avatar = clsx(isOwn && "order-2");
    const body = clsx("flex flex-col gap-2", isOwn && "items-end");
    const message = clsx("text-sm w-fit overflow-hidden relative",
        isOwn ? "bg-sky-500 text-white" : "bg-gray-100",
        data.image ? "rounded-md p-0" : "rounded-full py-2 px-3"
    );

    const hamburger = clsx(
        "absolute top-0 right-full mr-2 mt-1 text-gray-500 hover:text-gray-700",
        !menuOpen && "hidden group-hover:block"
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleHamburgerClick = () => {
        setMenuOpen((prev) => !prev);
    };

    return (
        <div className={container}>
            <div className={avatar}>
                <Avatar user={data.sender} />
            </div>
            <div className={body}>
                <div className="flex items-center gap-1">
                    <div className="text-sm text-gray-500">
                        {data.sender.name}
                    </div>
                    <div className="text-xs text-gray-400">
                        {format(new Date(data.createdAt), 'p')}
                    </div>
                </div>
                <div className="relative">
                    <div className={message}>
                        <ImageModal 
                            src={data.image}
                            isOpen={imageModalOpen}
                            onClose={() => setImageModalOpen(false)}
                        />
                        {data.image ? (
                            <Image
                                onClick={() => setImageModalOpen(true)} 
                                alt="Image"
                                height="288"
                                width="288"
                                src={data.image}
                                className="object-cover cursor-pointer hover:scale-110 transition translate"
                            />
                        ) : (
                            <div>
                                {data.body}
                            </div>
                        )}
                    </div>
                    {isOwn && (
                        <div className={hamburger}>
                            <button onClick={handleHamburgerClick}>
                                &#x2630;
                            </button>
                            {menuOpen && (
                                <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                    <button 
                                        className="block w-full px-4 py-2 text-left text-black-700 hover:bg-gray-100"
                                        onClick={() => { setMenuOpen(false); /* Add your edit logic here */ }}
                                    >
                                        수정
                                    </button>
                                    <button 
                                        className="block w-full px-4 py-2 text-left text-black-700 hover:bg-gray-100"
                                        onClick={() => { setMenuOpen(false); /* Add your delete logic here */ }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {isLast && isOwn && seenList.length > 0 && (
                    <div className="text-xs font-light font-gray-500">
                        {`Seen by ${seenList}`}
                    </div>
                )}
            </div>
        </div>
    );
}
