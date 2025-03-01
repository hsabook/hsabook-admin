import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Upload, Input, Modal, Form, message, Spin, Image } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined, DragOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { uploadFile } from '../../api/upload';
import { getImages, updateImages } from '../../api/images';
import type { ImageItem } from '../../api/images/types';

const { confirm } = Modal;

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

const Images: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
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
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await getImages();
      // Sort images by index
      const sortedImages = response.data.sort((a, b) => a.index - b.index);
      setImages(sortedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      message.error('Không thể tải danh sách hình ảnh');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    setEditingImage(null);
    setFileList([]);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditImage = (image: ImageItem) => {
    setEditingImage(image);
    form.setFieldsValue({
      name: image.name,
    });
    
    if (image.url) {
      setFileList([
        {
          uid: '-1',
          name: 'Current Image',
          status: 'done',
          url: image.url,
        },
      ]);
    } else {
      setFileList([]);
    }
    
    setIsModalOpen(true);
  };

  const handleDeleteImage = (image: ImageItem) => {
    Modal.confirm({
      title: 'Xác nhận xóa hình ảnh',
      content: `Bạn có chắc chắn muốn xóa hình ảnh "${image.name || 'không tên'}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const newImages = images.filter(item => item.index !== image.index);
          // Reindex images
          const reindexedImages = newImages.map((item, index) => ({
            ...item,
            index,
          }));
          
          await updateImages(reindexedImages);
          setImages(reindexedImages);
          message.success('Xóa hình ảnh thành công');
        } catch (error) {
          console.error('Error deleting image:', error);
          message.error('Không thể xóa hình ảnh');
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
      } else if (editingImage && fileList.length > 0) {
        // Keep existing URL if editing and no new file
        imageUrl = editingImage.url;
      }
      
      if (!imageUrl) {
        message.error('Vui lòng tải lên hình ảnh');
        setUploading(false);
        return;
      }
      
      if (editingImage) {
        // Update existing image
        const updatedImages = images.map(item => 
          item.index === editingImage.index 
            ? { ...item, name: values.name || '', url: imageUrl }
            : item
        );
        
        await updateImages(updatedImages);
        setImages(updatedImages);
        message.success('Cập nhật hình ảnh thành công');
      } else {
        // Add new image
        const newImage: ImageItem = {
          index: images.length,
          name: values.name || '',
          url: imageUrl,
        };
        
        const updatedImages = [...images, newImage];
        await updateImages(updatedImages);
        setImages(updatedImages);
        message.success('Thêm hình ảnh mới thành công');
      }
      
      setIsModalOpen(false);
      setFileList([]);
      form.resetFields();
    } catch (error) {
      console.error('Error saving image:', error);
      message.error('Không thể lưu hình ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = images.findIndex(item => `${item.index}` === active.id);
      const newIndex = images.findIndex(item => `${item.index}` === over.id);
      
      const newImages = [...images];
      const [movedItem] = newImages.splice(oldIndex, 1);
      newImages.splice(newIndex, 0, movedItem);
      
      // Reindex images
      const reindexedImages = newImages.map((item, index) => ({
        ...item,
        index,
      }));
      
      try {
        // Update UI immediately
        setImages(reindexedImages);
        
        // Silently call API without showing loading state or success message
        await updateImages(reindexedImages);
      } catch (error) {
        console.error('Error reordering images:', error);
        // Only show error message if the API call fails
        message.error('Không thể thay đổi vị trí');
        // Revert to original order if API call fails
        fetchImages();
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

  // This function now only removes the image from the fileList state
  // It doesn't call the API to update the image
  const handleRemoveImage = () => {
    setFileList([]);
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
      title: 'Hình ảnh',
      dataIndex: 'url',
      key: 'url',
      width: 200,
      render: (url: string) => (
        <Image
          src={url}
          alt="Image"
          width={150}
          height={80}
          className="object-cover rounded"
          style={{ objectFit: 'cover' }}
          preview={true}
        />
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => name || <span className="text-gray-400">Không có tên</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: any, record: ImageItem) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditImage(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteImage(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Vinh danh học sinh"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddImage}
          className="bg-[#45b630]"
        >
          Thêm hình ảnh
        </Button>
      }
    >
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
            items={images.map(item => `${item.index}`)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              dataSource={images}
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
        title={editingImage ? 'Chỉnh sửa hình ảnh' : 'Thêm hình ảnh mới'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={uploading}
        okText={editingImage ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-[#45b630]' }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên hình ảnh"
          >
            <Input placeholder="Nhập tên hình ảnh (không bắt buộc)" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Hình ảnh"
            rules={[{ required: !editingImage, message: 'Vui lòng tải lên hình ảnh!' }]}
          >
            <Upload
              listType="picture-card"
              {...uploadProps}
              maxCount={1}
              className="image-upload"
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            >
              {fileList.length === 0 && (
                <div className="upload-button-content">
                  <UploadOutlined className="text-2xl" />
                  <div className="mt-3 text-base">Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .image-upload .ant-upload-list-item {
          width: 100% !important;
          height: 100% !important;
          padding: 8px !important;
        }
        
        .image-upload .ant-upload-list-item-thumbnail {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .image-upload .ant-upload-list-item-thumbnail img {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          max-width: 100% !important;
          max-height: 100% !important;
        }
        
        .image-upload .ant-upload-list-item-container {
          width: 100% !important;
          height: 100% !important;
        }
        
        .image-upload .ant-upload-select {
          width: 100% !important;
          height: 100% !important;
        }
        
        .image-upload .ant-upload-list-picture-card-container {
          width: 100% !important;
          height: 200px !important;
        }
        
        .image-upload .ant-upload.ant-upload-select {
          width: 100% !important;
          height: 200px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        /* Hide the upload button when there's an image */
        .image-upload .ant-upload-list-item-container + .ant-upload {
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
      `}</style>
    </Card>
  );
};

export default Images;