import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Input, Modal, Form, message, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, DragOutlined, LinkOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getLinks, updateLinks } from '../../api/links';
import type { Link } from '../../api/links/types';

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

const Links: React.FC = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [form] = Form.useForm();
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
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await getLinks();
      // Sort links by index
      const sortedLinks = response.data.sort((a, b) => a.index - b.index);
      setLinks(sortedLinks);
    } catch (error) {
      console.error('Error fetching links:', error);
      message.error('Không thể tải danh sách liên kết');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    setEditingLink(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    form.setFieldsValue({
      name: link.name,
      url: link.url,
    });
    setIsModalOpen(true);
  };

  const handleDeleteLink = (link: Link) => {
    Modal.confirm({
      title: 'Xác nhận xóa liên kết',
      content: `Bạn có chắc chắn muốn xóa liên kết "${link.name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const newLinks = links.filter(item => item.index !== link.index);
          // Reindex links
          const reindexedLinks = newLinks.map((item, index) => ({
            ...item,
            index,
          }));
          
          await updateLinks(reindexedLinks);
          setLinks(reindexedLinks);
          message.success('Xóa liên kết thành công');
        } catch (error) {
          console.error('Error deleting link:', error);
          message.error('Không thể xóa liên kết');
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);
      
      if (editingLink) {
        // Update existing link
        const updatedLinks = links.map(item => 
          item.index === editingLink.index 
            ? { ...item, name: values.name, url: values.url }
            : item
        );
        
        await updateLinks(updatedLinks);
        setLinks(updatedLinks);
        message.success('Cập nhật liên kết thành công');
      } else {
        // Add new link
        const newLink: Link = {
          index: links.length,
          name: values.name,
          url: values.url,
        };
        
        const updatedLinks = [...links, newLink];
        await updateLinks(updatedLinks);
        setLinks(updatedLinks);
        message.success('Thêm liên kết mới thành công');
      }
      
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving link:', error);
      message.error('Không thể lưu liên kết');
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = links.findIndex(item => `${item.index}` === active.id);
      const newIndex = links.findIndex(item => `${item.index}` === over.id);
      
      const newLinks = [...links];
      const [movedItem] = newLinks.splice(oldIndex, 1);
      newLinks.splice(newIndex, 0, movedItem);
      
      // Reindex links
      const reindexedLinks = newLinks.map((item, index) => ({
        ...item,
        index,
      }));
      
      try {
        // Update UI immediately
        setLinks(reindexedLinks);
        
        // Silently call API without showing loading state or success message
        await updateLinks(reindexedLinks);
      } catch (error) {
        console.error('Error reordering links:', error);
        // Only show error message if the API call fails
        message.error('Không thể thay đổi vị trí');
        // Revert to original order if API call fails
        fetchLinks();
      }
    }
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
      title: 'Tiêu đề',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span className="font-medium">{name || <span className="text-gray-400">Chưa có tiêu đề</span>}</span>
      ),
    },
    {
      title: 'Đường dẫn',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
          <LinkOutlined className="mr-1" />
          {url}
        </a>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: any, record: Link) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditLink(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteLink(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Quản lý liên kết"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddLink}
          className="bg-[#45b630]"
        >
          Thêm liên kết
        </Button>
      }
    >
      {/* Preview Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Xem trước</h3>
        <p className="text-gray-500 mb-4">Dưới đây là cách hiển thị liên kết trên trang web</p>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-4">
            {links.map((link) => (
              <a 
                key={link.index} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#45b630]/10 text-[#45b630] rounded-full hover:bg-[#45b630]/20 transition-colors"
              >
                {link.name}
              </a>
            ))}
            
            {links.length === 0 && (
              <div className="w-full py-4 text-center text-gray-500">
                Chưa có liên kết nào. Hãy thêm liên kết để xem trước.
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
            items={links.map(item => `${item.index}`)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              dataSource={links}
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
        title={editingLink ? 'Chỉnh sửa liên kết' : 'Thêm liên kết mới'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={uploading}
        okText={editingLink ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-[#45b630]' }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề liên kết" />
          </Form.Item>

          <Form.Item
            name="url"
            label="Đường dẫn"
            rules={[
              { required: true, message: 'Vui lòng nhập đường dẫn!' },
              { type: 'url', message: 'Đường dẫn không hợp lệ!' }
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
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

export default Links;