// 대화 페이지 레이아웃

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

    // 대화 ID로 대화, 대화에 속한 전체 메세지 가져오기
    const conversation = await getConversationById(params.conversationId);
    const messages = await getMessages(params.conversationId);

    // 대화가 없으면 빈 상태 컴포넌트 렌더링
    if (!conversation) {
        return (
            <div className="lg:pl-80 h-full">
                <div className="h-full flex flex-col">
                    <EmptyState />
                </div>
            </div>
        );
    }

    // 대화 페이지
    return (
        <div className="lg:pl-80 h-full">
            {/* MessageProvider로 감쌈 -> 메세지 컨텍스트 */}
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
