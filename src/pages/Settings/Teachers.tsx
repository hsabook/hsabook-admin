import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Upload, Input, Modal, Form, message, Spin, Image, Avatar } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined, DragOutlined, UserOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { uploadFile } from '../../api/upload';
import { getTeacherBanners, updateTeacherBanners } from '../../api/teachers';
import type { TeacherBanner } from '../../api/teachers/types';

// Sortable item component
const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
  };
  
  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
};

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherBanner | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduce activation distance for easier dragging
      }
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await getTeacherBanners();
      // Sort teachers by index
      const sortedTeachers = response.data.sort((a, b) => a.index - b.index);
      setTeachers(sortedTeachers);
    } catch (error) {
      console.error('Error fetching teacher banners:', error);
      message.error('Không thể tải danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setFileList([]);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditTeacher = (teacher: TeacherBanner) => {
    setEditingTeacher(teacher);
    form.setFieldsValue({
      name: teacher.name,
    });
    
    if (teacher.url) {
      setFileList([
        {
          uid: '-1',
          name: 'Current Image',
          status: 'done',
          url: teacher.url,
        },
      ]);
    } else {
      setFileList([]);
    }
    
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = (teacher: TeacherBanner) => {
    Modal.confirm({
      title: 'Xác nhận xóa giáo viên',
      content: `Bạn có chắc chắn muốn xóa giáo viên "${teacher.name || 'không tên'}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const newTeachers = teachers.filter(item => item.index !== teacher.index);
          // Reindex teachers
          const reindexedTeachers = newTeachers.map((item, index) => ({
            ...item,
            index,
          }));
          
          await updateTeacherBanners(reindexedTeachers);
          setTeachers(reindexedTeachers);
          message.success('Xóa giáo viên thành công');
        } catch (error) {
          console.error('Error deleting teacher:', error);
          message.error('Không thể xóa giáo viên');
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);
      
      let imageUrl = '';
      
      // If there's a new file, upload it
      if (fileList.length > 0 && fileList[0].originFileObj) {
        imageUrl = await uploadFile(fileList[0].originFileObj);
      } else if (editingTeacher && fileList.length > 0) {
        // Keep existing URL if editing and no new file
        imageUrl = editingTeacher.url;
      }
      
      if (!imageUrl) {
        message.error('Vui lòng tải lên hình ảnh');
        setUploading(false);
        return;
      }
      
      if (editingTeacher) {
        // Update existing teacher
        const updatedTeachers = teachers.map(item => 
          item.index === editingTeacher.index 
            ? { ...item, name: values.name || '', url: imageUrl }
            : item
        );
        
        await updateTeacherBanners(updatedTeachers);
        setTeachers(updatedTeachers);
        message.success('Cập nhật giáo viên thành công');
      } else {
        // Add new teacher
        const newTeacher: TeacherBanner = {
          index: teachers.length,
          name: values.name || '',
          url: imageUrl,
        };
        
        const updatedTeachers = [...teachers, newTeacher];
        await updateTeacherBanners(updatedTeachers);
        setTeachers(updatedTeachers);
        message.success('Thêm giáo viên mới thành công');
      }
      
      setIsModalOpen(false);
      setFileList([]);
      form.resetFields();
    } catch (error) {
      console.error('Error saving teacher:', error);
      message.error('Không thể lưu thông tin giáo viên');
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = teachers.findIndex(item => `${item.index}` === active.id);
      const newIndex = teachers.findIndex(item => `${item.index}` === over.id);
      
      const newTeachers = [...teachers];
      const [movedItem] = newTeachers.splice(oldIndex, 1);
      newTeachers.splice(newIndex, 0, movedItem);
      
      // Reindex teachers
      const reindexedTeachers = newTeachers.map((item, index) => ({
        ...item,
        index,
      }));
      
      try {
        // Update UI immediately
        setTeachers(reindexedTeachers);
        
        // Silently call API without showing loading state or success message
        await updateTeacherBanners(reindexedTeachers);
      } catch (error) {
        console.error('Error reordering teachers:', error);
        // Only show error message if the API call fails
        message.error('Không thể thay đổi vị trí');
        // Revert to original order if API call fails
        fetchTeachers();
      }
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    const imgWindow = window.open(file.url || file.preview);
    imgWindow?.document.write(`<img src="${file.url || file.preview}" style="max-width: 100%; height: auto;" />`);
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleRemoveImage = async () => {
    if (editingTeacher) {
      try {
        setUploading(true);
        
        // Update the teacher without an image
        const updatedTeachers = teachers.map(item => 
          item.index === editingTeacher.index 
            ? { ...item, url: '' }
            : item
        );
        
        await updateTeacherBanners(updatedTeachers);
        setTeachers(updatedTeachers);
        setFileList([]);
        message.success('Xóa ảnh thành công');
      } catch (error) {
        console.error('Error removing image:', error);
        message.error('Không thể xóa ảnh');
      } finally {
        setUploading(false);
      }
    } else {
      // Just remove from fileList if we're adding a new teacher
      setFileList([]);
    }
    return true;
  };

  const uploadProps: UploadProps = {
    onRemove: handleRemoveImage,
    beforeUpload: (file) => {
      // Check file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ chấp nhận file ảnh!');
        return Upload.LIST_IGNORE;
      }
      
      // Check file size (max 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Kích thước ảnh không được vượt quá 5MB!');
        return Upload.LIST_IGNORE;
      }
      
      setFileList([file]);
      return false;
    },
    fileList,
    onPreview: handlePreview,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
  };

  const columns = [
    {
      title: 'Thứ tự',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (index: number) => (
        <div className="flex items-center">
          <DragOutlined className="mr-2 text-gray-400" />
          <span>{index + 1}</span>
        </div>
      ),
    },
    {
      title: 'Ảnh đại diện',
      dataIndex: 'url',
      key: 'url',
      width: 120,
      render: (url: string) => (
        <Avatar
          src={url}
          alt="Teacher"
          size={80}
          icon={<UserOutlined />}
          className="border-2 border-[#45b630]"
        />
      ),
    },
    {
      title: 'Tên giáo viên',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span className="font-medium">{name || <span className="text-gray-400">Chưa có tên</span>}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: any, record: TeacherBanner) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditTeacher(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTeacher(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Quản lý giáo viên nổi bật"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddTeacher}
          className="bg-[#45b630]"
        >
          Thêm giáo viên
        </Button>
      }
    >
      {/* Preview Section - Moved to the top */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Xem trước</h3>
        <p className="text-gray-500 mb-4">Dưới đây là cách hiển thị giáo viên nổi bật trên trang chủ</p>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-[#45b630] mb-4">Đội ngũ giáo viên chất lượng</h2>
          <div className="flex overflow-x-auto gap-4 pb-4">
            {teachers.map((teacher) => (
              <div key={teacher.index} className="flex-shrink-0 w-[140px] relative">
                <div className="bg-[#45b630]/10 rounded-lg overflow-hidden pb-2">
                  <div className="relative">
                    <Image 
                      src={teacher.url} 
                      alt={teacher.name}
                      className="w-full h-[140px] object-cover"
                      preview={true}
                    />
                  </div>
                  <div className="text-center mt-2 px-2">
                    <p className="font-medium text-sm">{teacher.name}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {teachers.length === 0 && (
              <div className="w-full py-8 text-center text-gray-500">
                Chưa có giáo viên nào. Hãy thêm giáo viên để xem trước.
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={teachers.map(item => `${item.index}`)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              dataSource={teachers}
              columns={columns}
              rowKey="index"
              pagination={false}
              components={{
                body: {
                  row: ({ children, ...props }: any) => {
                    return (
                      <SortableItem id={`${props['data-row-key']}`}>
                        {children}
                      </SortableItem>
                    );
                  },
                },
              }}
            />
          </SortableContext>
        </DndContext>
      )}

      <Modal
        title={editingTeacher ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={uploading}
        okText={editingTeacher ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-[#45b630]' }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên giáo viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên giáo viên!' }]}
          >
            <Input placeholder="Nhập tên giáo viên" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Ảnh đại diện"
            rules={[{ required: true, message: 'Vui lòng tải lên ảnh đại diện!' }]}
          >
            <div className="avatar-upload-container">
              <div className="avatar-preview">
                {fileList.length > 0 ? (
                  <div className="avatar-image">
                    <Image 
                      src={fileList[0].url || (fileList[0].originFileObj ? URL.createObjectURL(fileList[0].originFileObj) : '')} 
                      alt="Preview" 
                      className="avatar-img"
                      preview={true}
                    />
                    <div className="avatar-actions">
                      <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<DeleteOutlined />} 
                        size="small"
                        onClick={() => handleRemoveImage()}
                        className="bg-red-500 hover:bg-red-600"
                      />
                    </div>
                  </div>
                ) : (
                  <Upload
                    {...uploadProps}
                    showUploadList={false}
                    className="avatar-uploader"
                  >
                    <div className="avatar-placeholder">
                      <UserOutlined className="avatar-icon" />
                      <p className="avatar-text">Tải lên ảnh đại diện</p>
                      <p className="avatar-hint">Kích thước tối đa: 5MB</p>
                    </div>
                  </Upload>
                )}
              </div>
              
              <div className="avatar-tips">
                <h4 className="tips-title">Lưu ý:</h4>
                <ul className="tips-list">
                  <li>Nên sử dụng ảnh chân dung rõ nét</li>
                  <li>Tỷ lệ ảnh tốt nhất là 1:1 (vuông)</li>
                  <li>Định dạng: JPG, PNG, GIF</li>
                </ul>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        /* Avatar upload container */
        .avatar-upload-container {
          display: flex;
          gap: 24px;
        }
        
        /* Avatar preview section */
        .avatar-preview {
          width: 200px;
          flex-shrink: 0;
        }
        
        /* Avatar image container */
        .avatar-image {
          width: 200px;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          border: 2px solid #f0f0f0;
          background: #fafafa;
        }
        
        /* Avatar image */
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* Avatar actions overlay */
        .avatar-actions {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 8px;
        }
        
        /* Avatar uploader */
        .avatar-uploader {
          width: 100%;
          height: 100%;
        }
        
        .avatar-uploader .ant-upload {
          width: 200px !important;
          height: 200px !important;
          border-radius: 8px;
          background: #fafafa;
          border: 2px dashed #d9d9d9;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .avatar-uploader .ant-upload:hover {
          border-color: #45b630;
          background: #f6ffed;
        }
        
        /* Avatar placeholder */
        .avatar-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
        }
        
        .avatar-icon {
          font-size: 48px;
          color: #bfbfbf;
          margin-bottom: 16px;
        }
        
        .avatar-text {
          font-size: 16px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .avatar-hint {
          font-size: 12px;
          color: #999;
        }
        
        /* Tips section */
        .avatar-tips {
          flex: 1;
        }
        
        .tips-title {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #666;
        }
        
        .tips-list {
          padding-left: 16px;
          margin: 0;
        }
        
        .tips-list li {
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
        }
        
        /* Table styles */
        .teacher-upload .ant-upload-list-item {
          width: 100% !important;
          height: 100% !important;
          padding: 8px !important;
        }
        
        .teacher-upload .ant-upload-list-item-thumbnail {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .teacher-upload .ant-upload-list-item-thumbnail img {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          max-width: 100% !important;
          max-height: 100% !important;
        }
        
        .teacher-upload .ant-upload-list-item-container {
          width: 100% !important;
          height: 100% !important;
        }
        
        .teacher-upload .ant-upload-select {
          width: 100% !important;
          height: 100% !important;
        }
        
        .teacher-upload .ant-upload-list-picture-card-container {
          width: 100% !important;
          height: 200px !important;
        }
        
        .teacher-upload .ant-upload.ant-upload-select {
          width: 100% !important;
          height: 200px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        /* Hide the upload button when there's an image */
        .teacher-upload .ant-upload-list-item-container + .ant-upload {
          display: none !important;
        }
        
        .upload-button-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 20px;
        }
        
        /* Fix for drag and drop */
        .ant-table-row {
          cursor: move;
        }
        
        /* Make sure action buttons don't trigger drag */
        .ant-table-row button {
          cursor: pointer;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .avatar-upload-container {
            flex-direction: column;
          }
          
          .avatar-preview {
            width: 100%;
          }
          
          .avatar-image, .avatar-uploader .ant-upload {
            width: 100% !important;
            max-width: 200px;
            margin: 0 auto;
          }
        }
      `}</style>
    </Card>
  );
};

export default Teachers;