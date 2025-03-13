import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import BookMenuHeader from './BookMenuHeader';
import BookMenuTable from './BookMenuTable';
import DeleteMenuBookModal from './DeleteMenuBookModal';
import { AddDrawer } from './AddExamDrawer';
import EditDrawer from './EditDrawer';
import { useMenuBooks } from './useMenuBooks';
import { deleteMenuBook, getMenuBookById } from '../../../../api/menu-book';
import { useChapterSubmit } from './AddChapterDrawer/useChapterSubmit';
import { useExamSubmit } from './AddExamDrawer/useExamSubmit';
import { useMenuEdit } from './hooks/useMenuEdit';
import type { MenuBook } from '../../../../api/menu-book/types';
import type { AddChapterFormValues } from './AddChapterDrawer/types';
import type { AddExamFormValues } from './AddExamDrawer/types';

// Extended type for MenuBook with optional fields
interface ExtendedMenuBook extends MenuBook {
  description?: string;
  active_code_id?: boolean;
  video?: string;
}

const BookMenu: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    menuBooks, 
    loading, 
    totalItems, 
    searchText,
    setSearchText,
    refetch 
  } = useMenuBooks(id || '');
  
  const [selectedMenuBook, setSelectedMenuBook] = useState<ExtendedMenuBook | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddChapterDrawerOpen, setIsAddChapterDrawerOpen] = useState(false);
  const [isAddExamDrawerOpen, setIsAddExamDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [parentChapter, setParentChapter] = useState<MenuBook | null>(null);
  const [loadingMenuBookDetails, setLoadingMenuBookDetails] = useState(false);
  
  const { isSubmitting: isSubmittingChapter, handleSubmit: handleChapterSubmit } = useChapterSubmit(id || '');
  const { loading: isSubmittingExam, handleSubmit: handleExamSubmit } = useExamSubmit({ 
    bookId: id || '',
    onSuccess: () => {
      refetch();
    }
  });
  const { loading: isSubmittingEdit, handleSubmit: handleEditSubmit } = useMenuEdit({
    onSuccess: () => {
      refetch();
    }
  });

  const handleDeleteMenuBook = (menuBook: MenuBook) => {
    setSelectedMenuBook(menuBook as ExtendedMenuBook);
    setIsDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleEditMenuBook = async (menuBook: MenuBook) => {
    try {
      setLoadingMenuBookDetails(true);
      // First, set the basic menuBook data from the table
      setSelectedMenuBook(menuBook as ExtendedMenuBook);
      setIsEditDrawerOpen(true);
      
      // Then, fetch the full details
      const response = await getMenuBookById(menuBook.id);
      
      if (response?.data) {
        // Update the selected menu book with detailed info
        setSelectedMenuBook(response.data as ExtendedMenuBook);
      }
    } catch (error) {
      console.error('Failed to fetch menu book details:', error);
      message.error('Không thể lấy thông tin chi tiết');
    } finally {
      setLoadingMenuBookDetails(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMenuBook) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      await deleteMenuBook(selectedMenuBook.id);
      message.success('Xóa mục thành công');
      setIsDeleteModalOpen(false);
      setSelectedMenuBook(null);
      refetch();
    } catch (error: any) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddChapter = async (values: AddChapterFormValues) => {
    const success = await handleChapterSubmit(values, parentChapter?.id);
    if (success) {
      setIsAddChapterDrawerOpen(false);
      setParentChapter(null);
      refetch();
    }
  };

  const handleAddExam = async (values: AddExamFormValues) => {
    try {
      // Pass parent_id if parentChapter exists
      await handleExamSubmit({
        ...values,
        parent_id: parentChapter?.id
      });
      
      setIsAddExamDrawerOpen(false);
      setParentChapter(null);
    } catch (error) {
      console.error('Failed to add exam:', error);
    }
  };

  return (
    <div className="space-y-6">
      <BookMenuHeader 
        totalItems={totalItems}
        onRefresh={refetch}
        onAddChapter={() => {
          setParentChapter(null);
          setIsAddChapterDrawerOpen(true);
        }}
        onAddExam={() => {
          setParentChapter(null);
          setIsAddExamDrawerOpen(true);
        }}
        searchValue={searchText}
        onSearch={setSearchText}
      />
      
      <div className="bg-white rounded-lg shadow-sm">
        <BookMenuTable 
          data={menuBooks}
          loading={loading}
          onDelete={handleDeleteMenuBook}
          onEdit={handleEditMenuBook}
          onAddChapter={(chapter) => {
            setParentChapter(chapter);
            setIsAddChapterDrawerOpen(true);
          }}
          onAddExam={(chapter) => {
            setParentChapter(chapter);
            setIsAddExamDrawerOpen(true);
          }}
        />
      </div>

      <DeleteMenuBookModal
        menuBook={selectedMenuBook}
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedMenuBook(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        error={deleteError}
      />

      <AddDrawer
        type="CHUONG"
        open={isAddChapterDrawerOpen}
        onClose={() => {
          setIsAddChapterDrawerOpen(false);
          setParentChapter(null);
        }}
        onSubmit={handleAddChapter}
        loading={isSubmittingChapter}
        parentChapter={parentChapter}
        bookId={id || ''}
      />

      <AddDrawer
        type="DE"
        open={isAddExamDrawerOpen}
        onClose={() => {
          setIsAddExamDrawerOpen(false);
          setParentChapter(null);
        }}
        onSubmit={handleAddExam}
        loading={isSubmittingExam}
        parentChapter={parentChapter}
        bookId={id || ''}
      />

      <EditDrawer
        menuBook={selectedMenuBook}
        open={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setSelectedMenuBook(null);
        }}
        onSubmit={handleEditSubmit}
        loading={isSubmittingEdit || loadingMenuBookDetails}
      />
    </div>
  );
};

export default BookMenu;