import React, { useState } from 'react';
import { message } from 'antd';
import BookListHeader from './components/BookListHeader';
import BookSearch from './components/BookSearch';
import BookTable from './components/BookTable';
import BookFormDrawer from './components/BookForm';
import BookPrintDrawer from './components/BookPrintDrawer';
import BookOverviewDrawer from './components/BookOverviewDrawer';
import DeleteBookModal from './components/DeleteBookModal';
import { useBooks } from './hooks/useBooks';
import { deleteBook } from '../../api/books';
import type { Book } from '../../api/books/types';
import type { BookFormValues } from './components/BookForm/types';

const BookList: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrintDrawerOpen, setIsPrintDrawerOpen] = useState(false);
  const [isOverviewDrawerOpen, setIsOverviewDrawerOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { 
    books, 
    loading, 
    totalBooks, 
    searchText,
    setSearchText,
    refetch 
  } = useBooks();

  const handleRefresh = () => {
    refetch();
  };

  const handleAddNew = () => {
    setEditingBook(null);
    setIsDrawerOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsDrawerOpen(true);
  };

  const handlePrintBook = (book: Book) => {
    setSelectedBook(book);
    setIsPrintDrawerOpen(true);
  };

  const handleViewOverview = (book: Book) => {
    setSelectedBook(book);
    setIsOverviewDrawerOpen(true);
  };

  const handlePrintConfirm = (quantity: number) => {
    console.log('Printing', quantity, 'copies of', selectedBook?.name);
    setIsPrintDrawerOpen(false);
    setSelectedBook(null);
  };

  const handleDeleteBook = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      await deleteBook(selectedBook.id);
      message.success('Xóa sách thành công');
      setIsDeleteModalOpen(false);
      setSelectedBook(null);
      refetch();
    } catch (error: any) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDrawerSubmit = async (values: BookFormValues) => {
    try {
      setIsDrawerOpen(false);
      await refetch();
    } catch (error) {
      // Error is already handled in useBookSubmit
      setIsDrawerOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <BookListHeader 
        totalBooks={totalBooks}
        onRefresh={handleRefresh}
        onAddNew={handleAddNew}
      />

      <div className="bg-white rounded-lg shadow">
        <BookSearch 
          value={searchText}
          onChange={setSearchText}
        />
        <BookTable 
          data={books}
          loading={loading}
          onEdit={handleEditBook}
          onPrint={handlePrintBook}
          onDelete={handleDeleteBook}
          onViewOverview={handleViewOverview}
        />
      </div>

      <BookFormDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleDrawerSubmit}
        initialValues={editingBook}
        title={editingBook ? 'Sửa thông tin sách' : 'Thêm sách mới'}
      />

      {selectedBook && (
        <>
          <BookPrintDrawer
            open={isPrintDrawerOpen}
            onClose={() => {
              setIsPrintDrawerOpen(false);
              setSelectedBook(null);
            }}
            onConfirm={handlePrintConfirm}
            bookTitle={selectedBook.name}
            publishDate={selectedBook.updated_at}
            currentQuantity={selectedBook.quantity || 0}
          />

          <BookOverviewDrawer
            book={selectedBook}
            open={isOverviewDrawerOpen}
            onClose={() => {
              setIsOverviewDrawerOpen(false);
              setSelectedBook(null);
            }}
          />
        </>
      )}

      <DeleteBookModal
        book={selectedBook}
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedBook(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default BookList;