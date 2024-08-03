import { Suspense } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import SearchConversations from '../components/Search';

export default async function Page() {
  return (
    <Sidebar>
      {/* Suspense: 검색 결과가 로드될 때까지 로딩 메세지(Loading...)를 표시 */}
      <Suspense fallback={<div>Loading...</div>}>
        <SearchConversations />
      </Suspense>
    </Sidebar>
  );
}
