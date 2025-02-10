import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { getMenuBooks } from '../../../../api/menu-book';
import type { MenuBook } from '../../../../api/menu-book/types';

export const useMenuBooks = (bookId: string) => {
  const [menuBooks, setMenuBooks] = useState<MenuBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [searchText, setSearchText] = useState('');

  const fetchMenuBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMenuBooks({
        book_id: bookId,
        page: 1,
        take: 100,
        sort_type: 'ASC',
        sort_field: 'created_at',
        search: searchText
      });
      setMenuBooks(response.data.data);
      setTotalItems(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching menu books:', error);
      message.error('Không thể tải danh sách menu');
    } finally {
      setLoading(false);
    }
  }, [bookId, searchText]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenuBooks();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, fetchMenuBooks]);

  return {
    menuBooks,
    loading,
    totalItems,
    searchText,
    setSearchText,
    refetch: fetchMenuBooks
  };
};