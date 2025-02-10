import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import BookMenuHeader from './BookMenuHeader';
import BookMenuTable from './BookMenuTable';
import DeleteMenuBookModal from './DeleteMenuBookModal';
import AddChapterDrawer from './AddChapterDrawer';
import AddExamDrawer from './AddExamDrawer';
import { useMenuBooks } from './useMenuBooks';
import { deleteMenuBook } from '../../../../api/menu-book';
import { useChapterSubmit } from './AddChapterDrawer/useChapterSubmit';
import { useExamSubmit } from './AddExamDrawer/useExamSubmit';
import type { MenuBook } from '../../../../api/menu-book/types';
import type { AddChapterFormValues } from './AddChapterDrawer/types';
import type { AddExamFormValues } from './AddExamDrawer/types';

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
  
  const [selectedMenuBook, setSelectedMenuBook] = useState<MenuBook | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddChapterDrawerOpen, setIsAddChapterDrawerOpen] = useState(false);
  const [isAddExamDrawerOpen, setIsAddExamDrawerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [parentChapter, setParentChapter] = useState<MenuBook | null>(null);
  
  const { isSubmitting: isSubmittingChapter, handleSubmit: handleChapterSubmit } = useChapterSubmit(id || '');
  const { isSubmitting: isSubmittingExam, handleSubmit: handleExamSubmit } = useExamSubmit(id || '');

  const handleDeleteMenuBook = (menuBook: MenuBook) => {
    setSelectedMenuBook(menuBook);
    setIsDeleteModalOpen(true);
    setDeleteError(null);
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
    const success = await handleExamSubmit(values, parentChapter?.id);
    if (success) {
      setIsAddExamDrawerOpen(false);
      setParentChapter(null);
      refetch();
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

      <AddChapterDrawer
        open={isAddChapterDrawerOpen}
        onClose={() => {
          setIsAddChapterDrawerOpen(false);
          setParentChapter(null);
        }}
        onSubmit={handleAddChapter}
        loading={isSubmittingChapter}
        parentChapter={parentChapter}
      />

      <AddExamDrawer
        open={isAddExamDrawerOpen}
        onClose={() => {
          setIsAddExamDrawerOpen(false);
          setParentChapter(null);
        }}
        onSubmit={handleAddExam}
        loading={isSubmittingExam}
        parentChapter={parentChapter}
      />
    </div>
  );
};

export default BookMenu;