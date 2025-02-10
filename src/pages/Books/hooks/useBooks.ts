import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { getBooks } from '../../../api/books/bookService';
import type { Book } from '../../../api/books/types';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalBooks, setTotalBooks] = useState(0);
  const [searchText, setSearchText] = useState('');

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBooks({
        take: 100,
        page: 1,
        sort_field: 'created_at',
        sort_type: 'DESC',
        search: searchText, // Add search text to query params
      });
      setBooks(response.data.data);
      setTotalBooks(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching books:', error);
      message.error('Không thể tải danh sách sách');
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchBooks();
    }, 300); // Debounce search for 300ms

    return () => clearTimeout(debounceTimer);
  }, [fetchBooks]);

  return {
    books,
    loading,
    totalBooks,
    searchText,
    setSearchText,
    refetch: fetchBooks
  };
};