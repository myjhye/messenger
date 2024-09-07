// 사용자 대화 기록 메세지 검색

'use client';

import { useState } from 'react';
import axios from 'axios';
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import clsx from 'clsx';

interface SearchResult {
  body: string;
  senderName: string;
  createdAt: string;
  conversationId: string;
}

export default function SearchConversations() {
  // 사용자가 입력한 검색어
  const [searchTerm, setSearchTerm] = useState('');
  // 검색된 메세지 결과
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  // 사용자가 입력한 검색어 목록 (화면에 누적 표시 용도)
  const [userQueries, setUserQueries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  // 검색 함수
  const handleSearch = async () => {
    if (!searchTerm) return;

    // 이전 검색어 목록 유지하면서, 현재 입력된 검색어 기록에 추가
    setUserQueries((prevQueries) => [...prevQueries, searchTerm]);
    // 검색 수행됨 (검색 결과나 검색 결과 없음 텍스트 표시)
    setHasSearched(true);
    // 검색 중 표시
    setIsLoading(true);

    try {
      //* 서버에 검색 요청 (입력한 검색어 전달)
      const response = await axios.post('/api/search', { searchTerm });
      setSearchResults(response.data);
      setIsLoading(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error searching messages:', error);
      setIsLoading(false);
    }
  };

  // 메세지 클릭 함수
  const handleMessageClick = (conversationId: string) => {
    // 해당 대화 페이지 이동
    router.push(`/conversations/${conversationId}`);
  };

  // 검색된 메세지 목록 (말풍선 형태)
  // 발신자, 전송 시간, 본문 내용, 생성 날짜 포함
  // 시간 순 정렬 (과거에서 최신)
  const renderMessagesWithDates = () => {
    // 검색 결과를 생성 날짜(createdAt) 기준으로 오름차순 정렬
    const sortedResults = [...searchResults].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return sortedResults.map((result, index) => (
      <div key={index} className="flex flex-col items-start mb-4">
        <div 
          className="flex flex-col gap-2 p-3 bg-white text-black rounded-lg cursor-pointer shadow-md" 
          onClick={() => handleMessageClick(result.conversationId)}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {result.senderName}
            </div>
            <div className="text-xs text-gray-400">
              {format(parseISO(result.createdAt), "p")}
            </div>
          </div>
          <div className="text-black">
            {result.body}
          </div>
        </div>
        <div className="text-center my-2 text-gray-500 text-xs">
          {format(parseISO(result.createdAt), "yyyy년 M월 d일")}
          <hr className="mt-1 border-gray-300"/>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-screen justify-between p-4 bg-gray-100">
      <div className="overflow-y-auto mb-4 flex-1 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Search Conversations</h1>
        {/* 검색 전 표시 텍스트 */}
        {!hasSearched && (
           <div className="flex flex-col items-center justify-center h-full">
            <p className="text-center text-gray-500">
              Enter a search term and click the search button to search through your conversations.
            </p>
          </div>
        )}
        {/* 사용자가 입력한 검색어 목록 */}
        {userQueries.map((query, index) => (
          <div key={index} className="flex justify-end mb-4">
            <div className="flex flex-col gap-2 p-3 max-w-xs bg-pink-200 text-black rounded-lg">
              <div className="text-black">
                {query}
              </div>
            </div>
          </div>
        ))}
        {/* 로딩 & 검색 결과 없음 */}
        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : (
          hasSearched && searchResults.length === 0 && (
            <p className="text-center">No results found</p>
          )
        )}
        {/* 검색된 메세지 목록 */}
        {searchResults.length > 0 && renderMessagesWithDates()}
      </div>
      {/* 검색어 입력 & 검색 버튼 */}
      <div className="flex items-center p-4 border-t bg-white">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter search term..."
          className="border p-2 flex-1 rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white p-2 rounded ml-2"
        >
          Search
        </button>
      </div>
    </div>
  );
};
