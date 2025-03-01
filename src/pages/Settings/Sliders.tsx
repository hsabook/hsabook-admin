import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Upload, Form, Input, message, Table, Space, Typography, Spin, Empty, Image, Row, Col, Divider } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined, EditOutlined, PictureOutlined, LoadingOutlined, EyeOutlined, CheckCircleOutlined, FileImageOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { uploadFile } from '../../api/upload';
import { BannerItem, BannerData, uploadBannerData, getBannerData } from '../../api/upload';
import type { RcFile } from 'antd/es/upload/interface';

const { Title, Text, Paragraph } = Typography;

const Sliders: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<string | undefined>(undefined);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [fileInfo, setFileInfo] = useState<{name: string, size: string, type: string} | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getBannerData();
      if (response && response.data) {
        setBanners(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu banner:', error);
      message.error('Không thể lấy dữ liệu banner');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (banner?: BannerItem) => {
    if (banner) {
      setEditingBanner(banner);
      form.setFieldsValue({
        name: banner.name,
      });
      setUploadedImageUrl(banner.url);
    } else {
      setEditingBanner(null);
      form.resetFields();
      setUploadedImageUrl('');
    }
    setFileList([]);
    setPreviewFile(undefined);
    setFileInfo(null);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFileList([]);
    setUploadedImageUrl('');
    setPreviewFile(undefined);
    setFileInfo(null);
    form.resetFields();
  };

  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleConfirmUpload = async () => {
    try {
      const values = await form.validateFields();
      
      if (fileList.length === 0 && !editingBanner && !uploadedImageUrl) {
        message.error('Vui lòng chọn ảnh');
        return;
      }

      setUploading(true);
      
      let imageUrl = editingBanner?.url || uploadedImageUrl || '';
      
      // Nếu có file mới, upload file
      if (fileList.length > 0 && fileList[0].originFileObj) {
        imageUrl = await uploadFile(fileList[0].originFileObj);
      }
      
      const newBanner: BannerItem = {
        index: editingBanner ? editingBanner.index : banners.length,
        url: imageUrl,
        name: values.name,
      };
      
      // Cập nhật danh sách banner
      let updatedBanners: BannerItem[];
      if (editingBanner) {
        updatedBanners = banners.map(b => 
          b.index === editingBanner.index ? newBanner : b
        );
      } else {
        updatedBanners = [...banners, newBanner];
      }
      
      // Gửi dữ liệu lên server
      await uploadBannerData({ data: updatedBanners });
      
      message.success({
        content: `${editingBanner ? 'Cập nhật' : 'Thêm'} banner thành công`,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
      setBanners(updatedBanners);
      setIsModalOpen(false);
      setConfirmModalVisible(false);
      form.resetFields();
      setFileList([]);
      setUploadedImageUrl('');
      setPreviewFile(undefined);
      setFileInfo(null);
    } catch (error) {
      console.error('Lỗi khi upload banner:', error);
      message.error('Không thể upload banner');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    // Kiểm tra form trước khi mở modal xác nhận
    try {
      await form.validateFields();
      
      if (fileList.length === 0 && !editingBanner && !uploadedImageUrl) {
        message.error('Vui lòng chọn ảnh');
        return;
      }
      
      // Mở modal xác nhận
      setConfirmModalVisible(true);
    } catch (error) {
      console.error('Lỗi khi kiểm tra form:', error);
      // Hiển thị thông báo cụ thể về lỗi
      if (error && (error as any).errorFields) {
        const errorFields = (error as any).errorFields;
        if (errorFields.some((field: any) => field.name.includes('name'))) {
          message.error({
            content: 'Vui lòng nhập tên banner trước khi tiếp tục',
            icon: <EditOutlined style={{ color: '#ff4d4f' }} />
          });
        }
      }
    }
  };

  const handleDelete = async (banner: BannerItem) => {
    try {
      const updatedBanners = banners.filter(b => b.index !== banner.index);
      // Cập nhật lại index
      const reindexedBanners = updatedBanners.map((b, idx) => ({
        ...b,
        index: idx
      }));
      
      await uploadBannerData({ data: reindexedBanners });
      
      message.success({
        content: 'Xóa banner thành công',
        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />
      });
      setBanners(reindexedBanners);
    } catch (error) {
      console.error('Lỗi khi xóa banner:', error);
      message.error('Không thể xóa banner');
    }
  };

  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    try {
      // Tạo preview trước khi upload
      const previewDataUrl = await getBase64(file as RcFile);
      setPreviewFile(previewDataUrl);
      
      // Lưu thông tin file
      setFileInfo({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
      });
      
      // Không upload ngay, chỉ lưu file để upload sau khi xác nhận
      onSuccess("ok");
      
      // Hiển thị thông báo thành công
      message.success({
        content: `Đã tải lên ảnh ${file.name} thành công. Vui lòng nhập tên banner và xác nhận để hoàn tất.`,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
    } catch (error) {
      console.error('Lỗi khi tạo preview ảnh:', error);
      message.error('Không thể tạo preview ảnh');
      onError(error);
    }
  };

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
      setUploadedImageUrl('');
      setPreviewFile(undefined);
      setFileInfo(null);
    },
    beforeUpload: (file) => {
      // Kiểm tra loại file
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Bạn chỉ có thể upload ảnh!');
        return Upload.LIST_IGNORE;
      }
      
      // Kiểm tra kích thước file (5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return Upload.LIST_IGNORE;
      }
      
      setFileList([file]);
      return false;
    },
    customRequest: customUpload,
    fileList,
    showUploadList: false, // Ẩn danh sách file mặc định
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: '10%',
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: 'Ảnh',
      dataIndex: 'url',
      key: 'url',
      width: '30%',
      render: (url: string) => (
        <div className="banner-image-container">
          <Image 
            src={url} 
            alt="Banner" 
            style={{ 
              width: '120px', 
              height: '80px', 
              objectFit: 'cover', 
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
            className="hover:scale-105"
            preview={{
              mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EyeOutlined style={{ marginRight: 4 }} /> Xem
              </div>
            }}
          />
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '30%',
      render: (_: unknown, record: BannerItem) => (
        <Space size="middle">
          <Button 
            type="primary"
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            style={{ backgroundColor: '#1890ff' }}
          >
            Sửa
          </Button>
          <Button 
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record.url)}
          >
            Xem
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title={
        <Title level={4} style={{ margin: 0 }}>
          <PictureOutlined style={{ marginRight: 8 }} />
          Quản lý Banner
        </Title>
      }
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
          size="large"
          style={{ 
            backgroundColor: '#52c41a',
            borderColor: '#52c41a',
            boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)'
          }}
        >
          Thêm Banner
        </Button>
      }
      bordered={false}
      style={{ 
        borderRadius: '8px',
        boxShadow: '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)'
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} 
            tip="Đang tải dữ liệu..."
          />
        </div>
      ) : banners.length === 0 ? (
        <Empty 
          description="Chưa có banner nào" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table 
          dataSource={banners} 
          columns={columns} 
          rowKey="index"
          pagination={{ 
            pageSize: 5,
            showTotal: (total) => `Tổng cộng ${total} banner`,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20']
          }}
          bordered
          style={{ marginTop: 16 }}
        />
      )}
      
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {editingBanner ? (
              <>
                <EditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <span>Cập nhật Banner</span>
              </>
            ) : (
              <>
                <PlusOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                <span>Thêm Banner mới</span>
              </>
            )}
          </div>
        }
        open={isModalOpen}
        onOk={handleUpload}
        onCancel={handleCancel}
        confirmLoading={uploading}
        okText={editingBanner ? "Xác nhận cập nhật" : "Xác nhận thêm mới"}
        cancelText="Hủy"
        width={700}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={uploading} 
            onClick={handleUpload}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            {editingBanner ? "Xác nhận cập nhật" : "Xác nhận thêm mới"}
          </Button>
        ]}
        style={{ top: 20 }}
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          validateMessages={{
            required: '${label} là trường bắt buộc'
          }}
        >
          <Form.Item
            name="name"
            label={<Text strong>Tên Banner</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên banner' }]}
            tooltip="Tên banner là bắt buộc"
          >
            <Input 
              placeholder="Nhập tên banner" 
              size="large"
              prefix={<EditOutlined style={{ color: '#bfbfbf' }} />}
              status={form.getFieldError('name').length > 0 ? 'error' : ''}
              style={{ borderRadius: '4px' }}
            />
          </Form.Item>
          
          <Form.Item
            label={<Text strong>Ảnh Banner</Text>}
            required={!editingBanner}
            tooltip={!editingBanner ? "Ảnh banner là bắt buộc" : "Bạn có thể giữ nguyên ảnh hiện tại hoặc chọn ảnh mới"}
          >
            <Row gutter={24}>
              {!previewFile ? (
                <Col span={24}>
                  <Upload.Dragger 
                    {...uploadProps} 
                    style={{ 
                      padding: '20px 0',
                      background: '#fafafa',
                      border: '1px dashed #d9d9d9',
                      borderRadius: '8px',
                      height: 'auto'
                    }}
                    onChange={(info) => {
                      if (info.file.status === 'done') {
                        // Hiển thị thông báo khi upload thành công
                        message.success(`${info.file.name} đã được tải lên thành công`);
                      } else if (info.file.status === 'error') {
                        // Hiển thị thông báo khi upload thất bại
                        message.error(`${info.file.name} tải lên thất bại`);
                      }
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: '16px', fontWeight: 500 }}>
                      Nhấp hoặc kéo thả ảnh vào khu vực này
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#8c8c8c', fontSize: '14px' }}>
                      Hỗ trợ các định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB
                    </p>
                  </Upload.Dragger>
                </Col>
              ) : (
                <Col span={24}>
                  <div style={{ 
                    border: '1px solid #f0f0f0', 
                    borderRadius: '8px', 
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Text strong style={{ marginBottom: '12px', textAlign: 'center', fontSize: '16px' }}>
                      Xem trước ảnh
                    </Text>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
                      <Image 
                        src={previewFile} 
                        alt="Preview image" 
                        style={{ 
                          maxWidth: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          borderRadius: 4
                        }} 
                        preview={{
                          mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <EyeOutlined style={{ marginRight: 4 }} /> Xem
                          </div>
                        }}
                      />
                    </div>
                    {fileInfo && (
                      <div style={{ marginBottom: '16px', fontSize: '12px', color: '#8c8c8c' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <FileImageOutlined style={{ marginRight: 4 }} />
                          <Text ellipsis style={{ color: '#8c8c8c' }}>{fileInfo.name}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <Text style={{ color: '#8c8c8c' }}>{fileInfo.type.split('/')[1].toUpperCase()}</Text>
                          <Text style={{ color: '#8c8c8c' }}>{fileInfo.size}</Text>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => {
                        setPreviewFile(undefined);
                        setFileList([]);
                        setFileInfo(null);
                      }}
                      icon={<UploadOutlined />}
                      style={{ width: '100%' }}
                    >
                      Chọn ảnh khác
                    </Button>
                  </div>
                </Col>
              )}
            </Row>
            
            {/* Hiển thị ảnh đã upload */}
            {uploadedImageUrl && !fileList.length && !previewFile && (
              <div style={{ marginTop: 16 }}>
                <Divider orientation="left">Ảnh hiện tại</Divider>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    padding: 8, 
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    background: '#fafafa',
                    maxWidth: '400px'
                  }}>
                    <Image 
                      src={uploadedImageUrl} 
                      alt="Uploaded image" 
                      style={{ 
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        borderRadius: 4
                      }} 
                      preview={{
                        mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EyeOutlined style={{ marginRight: 4 }} /> Xem
                        </div>
                      }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ wordBreak: 'break-all', fontSize: '12px' }}>
                        {uploadedImageUrl}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Hiển thị ảnh hiện tại khi đang chỉnh sửa */}
            {editingBanner && !fileList.length && !uploadedImageUrl && !previewFile && (
              <div style={{ marginTop: 16 }}>
                <Divider orientation="left">Ảnh hiện tại</Divider>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    padding: 8, 
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    background: '#fafafa',
                    maxWidth: '400px'
                  }}>
                    <Image 
                      src={editingBanner.url} 
                      alt="Current banner" 
                      style={{ 
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        borderRadius: 4
                      }} 
                      preview={{
                        mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EyeOutlined style={{ marginRight: 4 }} /> Xem
                        </div>
                      }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" style={{ wordBreak: 'break-all', fontSize: '12px' }}>
                        {editingBanner.url}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận trước khi upload */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            <span>Xác nhận {editingBanner ? 'cập nhật' : 'thêm'} banner</span>
          </div>
        }
        open={confirmModalVisible}
        onOk={handleConfirmUpload}
        onCancel={() => setConfirmModalVisible(false)}
        confirmLoading={uploading}
        okText="Xác nhận"
        cancelText="Hủy"
        width={500}
        footer={[
          <Button key="cancel" onClick={() => setConfirmModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={uploading} 
            onClick={handleConfirmUpload}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Xác nhận thêm mới
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Text>Bạn có chắc chắn muốn {editingBanner ? 'cập nhật' : 'thêm'} banner này?</Text>
          
          <div style={{ marginTop: 16 }}>
            <Text strong>Tên Banner: </Text>
            <Text>{form.getFieldValue('name')}</Text>
          </div>
          
          <div style={{ marginTop: 16 }}>
            <Text strong>Ảnh Banner:</Text>
            <div 
              style={{ 
                marginTop: 8, 
                padding: 8, 
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                background: '#fafafa'
              }}
            >
              <Image 
                src={previewFile || uploadedImageUrl || (editingBanner ? editingBanner.url : '')} 
                alt="Banner preview" 
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: 4
                }} 
                preview={{
                  mask: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EyeOutlined style={{ marginRight: 4 }} /> Xem
                  </div>
                }}
              />
              {fileInfo && (
                <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FileImageOutlined style={{ marginRight: 4 }} />
                    <Text ellipsis style={{ color: '#8c8c8c' }}>{fileInfo.name}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ color: '#8c8c8c' }}>{fileInfo.type.split('/')[1].toUpperCase()}</Text>
                    <Text style={{ color: '#8c8c8c' }}>{fileInfo.size}</Text>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <Image 
          alt="Preview" 
          style={{ width: '100%' }} 
          src={previewImage} 
          preview={false}
        />
      </Modal>
    </Card>
  );
};

export default Sliders;