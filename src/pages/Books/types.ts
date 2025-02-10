export interface Category {
  key: string;
  name: string;
  totalBooks: number;
  status: 'active' | 'inactive';
  description: string;
  children?: Category[];
}

export interface CategoryDetailsProps {
  category: Category | null;
  onClose: () => void;
  onEdit: (category: Category) => void;
  onDelete: (key: string) => void;
}

// Book subject types with API values
export const SubjectValues = {
  Toan: 'Toán',
  NguVan: 'Ngữ văn',
  NgoaiNgu: 'Ngoại ngữ',
  VatLy: 'Vật lý',
  HoaHoc: 'Hóa học',
  SinhHoc: 'Sinh học',
  LichSu: 'Lịch sử',
  DiaLy: 'Địa lý',
  GiaoDucCongDan: 'Giáo dục công dân',
  TinHoc: 'Tin học',
  CongNghe: 'Công nghệ',
  TheDuc: 'Thể dục',
  GiaoDucQuocPhong: 'Giáo dục quốc phòng và an ninh',
  HocNghe: 'Học nghề',
} as const;

export type SubjectKey = keyof typeof SubjectValues;
export type SubjectValue = typeof SubjectValues[SubjectKey];