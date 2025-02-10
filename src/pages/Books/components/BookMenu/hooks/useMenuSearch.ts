import { useState, useCallback } from 'react';
import { getMenuBooks } from '../../../../../api/menu-book';
import type { MenuBook } from '../../../../../api/menu-book/types';

export const useMenuSearch = (bookId: string) => {
  const [searchText, setSearchText] = useState('');

  const fetchMenuBooks = useCallback(async () => {
    try {
      const response = await getMenuBooks({
        book_id: bookId,
        page: 1,
        take: 100,
        sort_type: 'ASC',
        sort_field: 'created_at',
        search: searchText.trim() // Add search parameter
      });
      
      return {
        data: response.data.data,
        total: response.data.pagination.total
      };
    } catch (error) {
      console.error('Error fetching menu books:', error);
      throw error;
    }
  }, [bookId, searchText]);

  return {
    searchText,
    setSearchText,
    fetchMenuBooks
  };
};