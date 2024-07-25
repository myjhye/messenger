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
    const { conversationId } = useConversation();
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
  
    useEffect(() => {
      if (editMessage) {
        setValue("message", editMessage);
      }
    }, [editMessage, setValue]);
  
    const onSubmit: SubmitHandler<FieldValues> = (data) => {
      const payload = {
        ...data,
        conversationId: conversationId,
        messageId: editMessageId,  // 메시지 ID 추가
      };
      setValue("message", "", { shouldValidate: true });
      setEditMessage("");
      setEditMessageId(null);
      axios.post("/api/messages", payload);
    };
  
    const handleUpload = (result: any) => {
      axios.post("/api/messages", {
        image: result?.info?.secure_url,
        conversationId,
      });
    };
  
    const handleCancelEdit = () => {
      setEditMessage("");
      setEditMessageId(null);
      setValue("message", "");
    };
  
    return (
      <div className="py-4 px-4 bg-white border-t flex flex-col gap-2 w-full">
        {editMessage && (
          <div className="flex items-center bg-gray-100 p-2 rounded-md">
            <HiPencil size={24} className="text-blue-500 mr-2" />
            <div className="flex-1">
              <span className="text-blue-500 font-semibold">
                Editing
              </span>
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
            <HiPhoto size={30} className="text-sky-500" />
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
              <HiPaperAirplane size={18} className="text-white" />
            </button>
          </form>
        </div>
      </div>
    );
  }