import React from "react";
import {
  Table,
  Button,
  Space,
  Tooltip,
  Input,
  Select,
  message,
  Modal,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  ImportOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Exam, ExamsParams } from "./types";
import { deleteExam } from "../../../api/exams";

const { Option } = Select;
const { confirm } = Modal;

interface ExamListProps {
  loading: boolean;
  exams: Exam[];
  total: number;
  currentPage: number;
  pageSize: number;
  searchText: string;
  statusFilter: string;
  onSearch: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRefresh: () => void;
  onPageChange: (page: number, pageSize?: number) => void;
  onShowDetail: (examId: string) => void;
  onShowAddModal: () => void;
  onShowEditModal: (exam: Exam) => void;
  onImport: () => void;
  fetchExams: (params?: ExamsParams) => Promise<void>;
}

const ExamList: React.FC<ExamListProps> = ({
  loading,
  exams,
  total,
  currentPage,
  pageSize,
  searchText,
  statusFilter,
  onSearch,
  onStatusChange,
  onRefresh,
  onPageChange,
  onShowDetail,
  onShowAddModal,
  onShowEditModal,
  onImport,
  fetchExams,
}) => {
  // Handle delete exam
  const handleDelete = (id: string) => {
    confirm({
      title: "Are you sure you want to delete this exam?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteExam(id);
          message.success("Exam deleted successfully");
          fetchExams();
        } catch (error) {
          console.error("🔴 ExamList handleDelete error:", error);
          message.error("Failed to delete exam");
        }
      },
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 80,
    },
    {
      title: "Bộ đề",
      dataIndex: "title",
      key: "title",
      sorter: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {active ? "Hoạt động" : "Không hoạt động"}
        </span>
      ),
    },
    {
      title: "ID bộ đề",
      dataIndex: "code_id",
      key: "code_id",
    },
    {
      title: "Số câu hỏi",
      dataIndex: "total_question",
      key: "total_question",
    },
    {
      title: "Lần cuối cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
      sorter: true,
      render: (date: string) => {
        if (!date) return "-";

        const dateObj = new Date(date);

        // Format: DD/MM/YYYY HH:MM
        const day = dateObj.getDate().toString().padStart(2, "0");
        const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours().toString().padStart(2, "0");
        const minutes = dateObj.getMinutes().toString().padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes}`;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Exam) => (
        <Space size="middle">
          <Tooltip title="View Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onShowDetail(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onShowEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="exam-list">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search exams..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Filter by status"
            style={{ width: 150 }}
            value={statusFilter || undefined}
            onChange={onStatusChange}
            allowClear
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            title="Refresh"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onShowAddModal}
          >
            Add Exam
          </Button>
          <Button icon={<ImportOutlined />} onClick={onImport}>
            Import
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={exams}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <div className="mt-4 flex justify-end">
        <div className="pagination">
          <div className="flex justify-end">
            <div className="pagination-container">
              {total > 0 && (
                <div className="pagination">
                  <div className="flex justify-end">
                    <div className="pagination-container">
                      <div className="flex items-center">
                        <span className="mr-2">
                          Total: {total} items
                        </span>
                        <div>
                          <div className="ant-pagination">
                            <ul>
                              <li>
                                <button
                                  className={`ant-pagination-item ${
                                    currentPage === 1 ? "ant-pagination-disabled" : ""
                                  }`}
                                  disabled={currentPage === 1}
                                  onClick={() => onPageChange(currentPage - 1)}
                                >
                                  Previous
                                </button>
                              </li>
                              <li className="ant-pagination-item ant-pagination-item-active">
                                <a>{currentPage}</a>
                              </li>
                              <li>
                                <button
                                  className={`ant-pagination-item ${
                                    currentPage * pageSize >= total
                                      ? "ant-pagination-disabled"
                                      : ""
                                  }`}
                                  disabled={currentPage * pageSize >= total}
                                  onClick={() => onPageChange(currentPage + 1)}
                                >
                                  Next
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamList;
