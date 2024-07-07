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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [userQueries, setUserQueries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchTerm) return;

    setUserQueries((prevQueries) => [...prevQueries, searchTerm]);
    setHasSearched(true);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/search', { searchTerm });
      setSearchResults(response.data);
      setIsLoading(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error searching messages:', error);
      setIsLoading(false);
    }
  };

  const handleMessageClick = (conversationId: string) => {
    router.push(`/conversations/${conversationId}`);
  };

  const renderMessagesWithDates = () => {
    const sortedResults = [...searchResults].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return sortedResults.map((result, index) => (
      <div key={index} className="flex flex-col items-start mb-4">
        <div className="flex flex-col gap-2 p-3 bg-white text-black rounded-lg cursor-pointer shadow-md" onClick={() => handleMessageClick(result.conversationId)}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">{result.senderName}</div>
            <div className="text-xs text-gray-400">{format(parseISO(result.createdAt), "p")}</div>
          </div>
          <div className="text-black">{result.body}</div>
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
        {userQueries.map((query, index) => (
          <div key={index} className="flex justify-end mb-4">
            <div className="flex flex-col gap-2 p-3 max-w-xs bg-pink-200 text-black rounded-lg">
              <div className="text-black">{query}</div>
            </div>
          </div>
        ))}
        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : (
          hasSearched && searchResults.length === 0 && (
            <p className="text-center">No results found</p>
          )
        )}
        {searchResults.length > 0 && renderMessagesWithDates()}
      </div>
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
