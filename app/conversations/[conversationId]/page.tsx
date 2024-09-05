// 특정 대화 페이지

import getConversationById from "@/app/actions/getConversationById";
import getMessages from "@/app/actions/getMessages";
import EmptyState from "@/app/components/EmptyState";
import Header from "./components/Header";
import Body from "./components/Body";
import Form from "./components/Form";
import { MessageProvider } from "@/app/context/MessageContext"; // 추가

interface IParams {
    conversationId: string;
};

export default async function ConversationId({ params }: { params: IParams }) {

    // url 파라미터의 conversationId로 특정 대화 정보 조회
    const conversation = await getConversationById(params.conversationId);
    // url 파라미터의 conversationId로 특정 대화 내의 메세지 목록 조회
    const messages = await getMessages(params.conversationId);

    if (!conversation) {
        return (
            <div className="lg:pl-80 h-full">
                <div className="h-full flex flex-col">
                    <EmptyState />
                </div>
            </div>
        );
    }

    return (
        <div className="lg:pl-80 h-full">
            {/* MessageProvider: 메세지 컨텍스트 */}
            <MessageProvider> 
                <div className="h-full flex flex-col">
                    {/* 대화 헤더 */}
                    <Header conversation={conversation} />
                    {/* 대화 본문 */}
                    <Body initialMessages={messages} />
                    {/* 메세지 입력 폼 */}
                    <Form />
                </div>
            </MessageProvider>
        </div>
    );
}
