import { Suspense } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import SearchConversations from '../components/Search';

export default async function Page() {
  return (
    <Sidebar>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchConversations />
      </Suspense>
    </Sidebar>
  );
}
