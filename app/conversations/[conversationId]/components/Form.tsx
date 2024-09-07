// 전체 폼
// 채팅 방 내 메세지 입력, 수정, 이미지 업로드, 메세지 전송

"use client";

import useConversation from "@/app/hooks/useConversation";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { HiPaperAirplane, HiPhoto, HiPencil } from "react-icons/hi2";
import { MdCancel } from "react-icons/md";
import MessageInput from "./MessageInput";
import { CldUploadButton } from "next-cloudinary";
import { useEffect } from "react";
import { useMessage } from "@/app/context/MessageContext";

export default function Form() {
    // 현재 대화 id
    const { conversationId } = useConversation();
    // 메세지 수정 컨텍스트
    const { editMessage, setEditMessage, editMessageId, setEditMessageId } = useMessage();
  
    const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
    } = useForm<FieldValues>({
      defaultValues: {
        message: "",
      },
    });
  
    // editMessage 값이 변경될 때마다 메세지 입력 필드에 수정 중인 메세지 내용 설정
    useEffect(() => {
      if (editMessage) {
        setValue("message", editMessage);
      }
    }, [editMessage, setValue]);
  
    // 폼 제출
    const onSubmit: SubmitHandler<FieldValues> = (data) => {
      const payload = {
        ...data,
        // 현재 대화 id
        conversationId,
        // 수정할 메세지 id
        messageId: editMessageId,  
      };

      // 메세지 입력 필드 초기화
      setValue("message", "", { 
        shouldValidate: true 
      });

      // 수정 중인 메세지 내용 초기화
      setEditMessage("");

      // 수정 중인 메세지 id 초기화
      setEditMessageId(null);

      // 서버에 메세지 전송 요청
      axios.post("/api/messages", payload);
    };
  

    // 이미지 업로드 함수
    const handleUpload = (result: any) => {
      axios.post("/api/messages", {
        // 업로드된 이미지 url
        image: result?.info?.secure_url,
        conversationId,
      });
    };
  
    // 메세지 수정 취소 함수
    const handleCancelEdit = () => {
      setEditMessage("");
      setEditMessageId(null);
      setValue("message", "");
    };
  
    return (
      <div className="py-4 px-4 bg-white border-t flex flex-col gap-2 w-full">
        {editMessage && (
          <div className="flex items-center bg-gray-100 p-2 rounded-md">
            <HiPencil 
              size={24} 
              className="text-blue-500 mr-2" 
            />
            <div className="flex-1">
              <span className="text-blue-500 font-semibold">
                Editing
              </span>
              {/* 수정할 메시지 원본 */}
              <span className="text-gray-700 block">
                {editMessage}
              </span>
            </div>
            <MdCancel
              size={24}
              className="text-gray-500 cursor-pointer"
              onClick={handleCancelEdit}
            />
          </div>
        )}
        <div className="flex items-center gap-2 lg:gap-4 w-full">
          <CldUploadButton
            options={{ maxFiles: 1 }}
            onUpload={handleUpload}
            uploadPreset="mdg81ikp"
          >
            <HiPhoto 
              size={30} 
              className="text-sky-500" 
            />
          </CldUploadButton>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-center gap-2 lg:gap-4 w-full"
          >
            <MessageInput
              id="message"
              register={register}
              errors={errors}
              required
              placeholder="Write a message"
            />
            <button
              type="submit"
              className="rounded-full p-2 bg-sky-500 cursor-pointer hover:bg-sky-600 transition"
            >
              <HiPaperAirplane 
                size={18} 
                className="text-white" 
              />
            </button>
          </form>
        </div>
      </div>
    );
  }