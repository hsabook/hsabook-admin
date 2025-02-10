import type { Book } from '../../../../api/books/types';

export interface BookFormProps {
  onSubmit: (values: BookFormValues) => void;
  initialValues?: Book | null;
}

export interface BookFormValues {
  title: string;
  categories?: string[];
  subjects?: string;
  authors?: string[];
  publisher?: string;
  summary?: string;
  cover?: any;
  expiration_date?: number;
  is_public?: boolean;
}

export interface BookFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BookFormValues) => void;
  initialValues?: Book | null;
  title?: string;
}

export interface BookFormModalProps extends Omit<BookFormDrawerProps, 'onClose'> {
  onCancel: () => void;
}