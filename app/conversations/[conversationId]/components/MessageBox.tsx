// 개별 대화 메세지 박스

"use client";

import Avatar from "@/app/components/Avatar";
import { FullMessageType } from "@/app/types";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import ImageModal from "./ImageModal";
import { useMessage } from "@/app/context/MessageContext";
import axios from "axios";

interface MessageBoxProps {
  data: FullMessageType;
  isLast?: boolean;
  onDelete: (id: string) => void;
}

// props: Body (대화에 속한 모든 메세지)
export default function MessageBox({ data, isLast, onDelete }: MessageBoxProps) {
  const session = useSession();
  // 메세지 편집 상태
  const { setEditMessage, setEditMessageId } = useMessage();
  // 이미지 모달 열림 상태
  const [imageModalOpen, setImageModalOpen] = useState(false);
  // 수정/삭제 버튼 열림 상태
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  if (!data) {
    return null;
  }

  // 현재 사용자가 메세지 발신자인지 여부
  const isOwn = session?.data?.user?.email === data.sender.email;

  // 해당 메세지를 본 사용자 목록 (현재 사용자 제외)
  const seenList = (data.seen || [])
    .filter((user) => user.email !== data.sender.email)
    .map((user) => user.name)
    .join(", ");

  // 메세지 컨테이너 스타일
  const container = clsx(
    "flex gap-3 p-4 relative group",
    // 현재 사용자의 메세지는 오른쪽 정렬
    isOwn && "justify-end"
  );

  // 현재 사용자 메세지 아바타 오른쪽 정렬
  const avatar = clsx(isOwn && "order-2");
  // 현재 사용자 메세지 내용 오른쪽 정렬
  const body = clsx("flex flex-col gap-2", isOwn && "items-end");
  const message = clsx(
    "text-sm w-fit overflow-hidden relative",
    // 현재 사용자 메세지 파란색 배경, 흰색 텍스트
    // 다른 사용자 메세지 회색 배경, 검정 텍스트
    isOwn ? "bg-sky-500 text-white" : "bg-gray-100",
    data.image ? "rounded-md p-0" : "rounded-full py-2 px-3"
  );

  const hamburger = clsx(
    "absolute top-0 right-full mr-2 mt-1 text-gray-500 hover:text-gray-700",
    !menuOpen && "hidden group-hover:block"
  );

  
  useEffect(() => {
    // 메뉴 외부 클릭 시 메뉴 닫기
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

  // 수정/삭제 버튼 클릭 시 상태 토글
  const handleHamburgerClick = () => {
    setMenuOpen((prev) => !prev);
  };

  // 메세지 수정 버튼 클릭 시 수정할 메세지와 메세지 id 설정
  const handleEditClick = () => {
    if (data.body) {
      // 편집할 메세지 내용 설정
      setEditMessage(data.body);
      // 수정할 메시지 id 설정
      setEditMessageId(data.id);  
    }
    setMenuOpen(false);
  };

  // 메세지 삭제 버튼 클릭 핸들러
  const handleDeleteClick = async () => {
    try {
      const response = await axios.delete(`/api/messages/${data.id}`, {
        data: { 
          conversationId: data.conversationId 
        }
      });
      if (response.status === 200) {
        // 메세지 삭제 후 콜백 함수(메세지 목록에서 삭제한 메세지 제외해서 화면 표시) 호출
        onDelete(data.id);
      } else {
        console.error("Error deleting message: unexpected status", response.status);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
    setMenuOpen(false);
  };
  

  return (
    <div className={container}>
      <div className={avatar}>
        {/* 발신자 아바타 */}
        <Avatar user={data.sender} />
      </div>
      <div className={body}>
        <div className="flex items-center gap-1">
          <div className="text-sm text-gray-500">
            {/* 발신자 이름 */}
            {data.sender.name}
          </div>
          <div className="text-xs text-gray-400">
            {/* 메세지 생성 시간 */}
            {format(new Date(data.createdAt), "p")}
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
                {/* 메세지 내용 */}
                {data.body}
                {data.edited && (
                  <span className="text-xs italic text-gray-500 ml-2">
                    edited
                  </span>
                )}
              </div>
            )}
          </div>
          {isOwn && (
            <div className={hamburger}>
              {/* 수정/삭제 버튼 */}
              <button onClick={handleHamburgerClick}>
                &#x2630;
              </button>
              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                >
                  <button
                    className="block w-full px-4 py-2 text-left text-black-700 hover:bg-gray-100"
                    onClick={handleEditClick}
                  >
                    수정
                  </button>
                  <button className="block w-full px-4 py-2 text-left text-black-700 hover:bg-gray-100" onClick={handleDeleteClick}>
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {isLast && isOwn && seenList.length > 0 && (
          <div className="text-xs font-light font-gray-500">
            {/* 메세지를 읽은 사용자 목록 */}
            {`Seen by ${seenList}`}
          </div>
        )}
      </div>
    </div>
  );
}
