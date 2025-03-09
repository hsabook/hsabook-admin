import React from "react";
import {
  Modal,
  Input,
  Select,
  Button,
  Table,
  Space,
  Tooltip,
  Checkbox,
  Spin,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { Question } from "./types";
import { QUESTION_TYPE, HighSchoolSubjects } from "../../../components/QuestionModal/QuestionModal";

const { Option } = Select;

interface RepositoryModalProps {
  visible: boolean;
  loading: boolean;
  questions: Question[];
  selectedQuestionIds: string[];
  searchText: string;
  questionType: string;
  subject: string;
  total: number;
  currentPage: number;
  pageSize: number;
  onSearch: (value: string) => void;
  onQuestionTypeChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onPageChange: (page: number, pageSize?: number) => void;
  onSelectAllQuestions: (selected: boolean, selectedRows: any[]) => void;
  onSelectQuestion: (record: any, selected: boolean) => void;
  onConfirmAdd: () => Promise<void>;
  onCancel: () => void;
  confirmLoading: boolean;
}

const RepositoryModal: React.FC<RepositoryModalProps> = ({
  visible,
  loading,
  questions,
  selectedQuestionIds,
  searchText,
  questionType,
  subject,
  total,
  currentPage,
  pageSize,
  onSearch,
  onQuestionTypeChange,
  onSubjectChange,
  onPageChange,
  onSelectAllQuestions,
  onSelectQuestion,
  onConfirmAdd,
  onCancel,
  confirmLoading,
}) => {
  // Table columns configuration
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 80,
    },
    {
      title: "ID",
      dataIndex: "code_id",
      key: "code_id",
    },
    {
      title: "Câu hỏi",
      dataIndex: "content",
      key: "content",
      render: (content: string) => (
        <div
          dangerouslySetInnerHTML={{
            __html: content.length > 100 ? content.substring(0, 100) + "..." : content,
          }}
        />
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
    },
  ];

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys: selectedQuestionIds,
    onSelectAll: onSelectAllQuestions,
    onSelect: onSelectQuestion,
  };

  return (
    <Modal
      title="Add Questions from Repository"
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={confirmLoading}
          onClick={onConfirmAdd}
          disabled={selectedQuestionIds.length === 0}
        >
          Add Selected Questions ({selectedQuestionIds.length})
        </Button>,
      ]}
    >
      <div className="mb-4 flex items-center space-x-2">
        <Input
          placeholder="Search questions..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Select
          placeholder="Question Type"
          style={{ width: 150 }}
          value={questionType || undefined}
          onChange={onQuestionTypeChange}
          allowClear
        >
          {Object.entries(QUESTION_TYPE).map(([key, value]) => (
            <Option key={key} value={key}>
              {value}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Subject"
          style={{ width: 150 }}
          value={subject || undefined}
          onChange={onSubjectChange}
          allowClear
        >
          {Object.entries(HighSchoolSubjects).map(([key, value]) => (
            <Option key={key} value={key}>
              {typeof value === 'string' ? value : key}
            </Option>
          ))}
        </Select>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            onSearch("");
            onQuestionTypeChange("");
            onSubjectChange("");
          }}
          title="Reset Filters"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={questions}
            rowKey="id"
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
        </>
      )}
    </Modal>
  );
};

export default RepositoryModal;
