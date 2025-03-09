import React from "react";
import {
  Drawer,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
} from "antd";
import {
  SearchOutlined,
  SyncOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { HighSchoolSubjects } from "../../components/QuestionModal/QuestionModal";

// Define the props interface for the component
interface QuestionRepositoryDrawerProps {
  visible: boolean;
  loading: boolean;
  questions: any[];
  selectedQuestionIds: string[];
  searchText: string;
  questionType: string;
  subject: string;
  total: number;
  currentPage: number;
  pageSize: number;
  confirmLoading: boolean;
  QUESTION_TYPE: Record<string, string>;
  onSearch: (value: string) => void;
  onQuestionTypeChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onPageChange: (page: number, pageSize?: number) => void;
  onSelectAllQuestions: (selected: boolean, selectedRows: any[]) => void;
  onSelectQuestion: (record: any, selected: boolean) => void;
  onConfirmAdd: () => Promise<void>;
  onCancel: () => void;
  onRefresh: () => void;
  setPageSize?: (size: number) => void;
}

const QuestionRepositoryDrawer: React.FC<QuestionRepositoryDrawerProps> = ({
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
  confirmLoading,
  QUESTION_TYPE,
  onSearch,
  onQuestionTypeChange,
  onSubjectChange,
  onPageChange,
  onSelectAllQuestions,
  onSelectQuestion,
  onConfirmAdd,
  onCancel,
  onRefresh,
  setPageSize,
}) => {
  return (
    <Drawer
      title={<div className="text-xl">Thêm câu hỏi vào bộ đề</div>}
      open={visible}
      onClose={onCancel}
      width={1000}
      zIndex={1050}
      extra={
        <Space>
          <Button onClick={onCancel}>
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={onConfirmAdd}
            style={{ backgroundColor: "#22c55e" }}
            loading={confirmLoading}
          >
            Xác nhận
          </Button>
        </Space>
      }
      closeIcon={<CloseOutlined />}
    >
      <div className="mb-4">
        <p className="mb-4 text-gray-600">Chọn câu hỏi để thêm vào bộ đề</p>

        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <Input
            placeholder="Tìm kiếm"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => onSearch(e.target.value)}
            onPressEnter={(e) =>
              onSearch((e.target as HTMLInputElement).value)
            }
          />

          <Select
            placeholder="Loại câu hỏi"
            style={{ width: 200 }}
            value={questionType}
            onChange={onQuestionTypeChange}
            allowClear
          >
            {Object.values(QUESTION_TYPE).map((type) => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Môn học"
            style={{ width: 200 }}
            value={subject}
            onChange={onSubjectChange}
            allowClear
          >
            {HighSchoolSubjects.map((subject) => (
              <Select.Option key={subject.value} value={subject.title}>
                {subject.title}
              </Select.Option>
            ))}
          </Select>

          <Button
            icon={<SyncOutlined />}
            onClick={onRefresh}
            loading={loading}
            className="ml-auto"
          >
            Làm mới
          </Button>
        </div>

        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedQuestionIds,
            columnWidth: 60,
            onSelectAll: onSelectAllQuestions,
            onSelect: onSelectQuestion,
          }}
          columns={[
            {
              title: "Câu hỏi",
              dataIndex: "content",
              key: "content",
              render: (content: string) => (
                <div
                  dangerouslySetInnerHTML={{
                    __html: content || "Không có nội dung",
                  }}
                  className="max-h-20 overflow-y-auto"
                />
              ),
            },
            {
              title: "Loại câu hỏi",
              dataIndex: "type",
              key: "type",
              width: 180,
              render: (type: string) => {
                let color = "blue";
                if (type === "Lựa chọn một đáp án") color = "green";
                if (type === "Lựa chọn nhiều đáp án") color = "purple";
                if (type === "Đúng/Sai") color = "orange";
                if (type === "Nhập đáp án") color = "cyan";
                if (type === "Đọc hiểu") color = "magenta";

                return <Tag color={color}>{type}</Tag>;
              },
            },
            {
              title: "Môn học",
              dataIndex: "subject",
              key: "subject",
              width: 120,
              render: (subject: string) => {
                let color = "blue";
                if (subject === "Toán") color = "blue";
                if (subject === "Ngữ văn") color = "green";
                if (subject === "Tiếng Anh") color = "purple";
                if (subject === "Vật lý") color = "orange";
                if (subject === "Hóa học") color = "red";
                if (subject === "Sinh học") color = "cyan";

                return <Tag color={color}>{subject}</Tag>;
              },
            },
            {
              title: "ID Câu hỏi",
              dataIndex: "code_id",
              key: "code_id",
              width: 120,
            },
          ]}
          dataSource={questions}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: "Không có dữ liệu!" }}
          className="border border-gray-200 rounded-md"
          rowClassName={(record) =>
            selectedQuestionIds.includes(record.id)
              ? "bg-green-50"
              : "hover:bg-gray-50"
          }
          onRow={(record) => ({
            onClick: () => {
              // Toggle selection when clicking on row
              if (selectedQuestionIds.includes(record.id)) {
                onSelectQuestion(record, false);
              } else {
                onSelectQuestion(record, true);
              }
            },
            style: { cursor: "pointer" },
          })}
        />

        <div className="flex items-center justify-between mt-4">
          <div>
            {total > 0 && (
              <span className="text-gray-600">
                {currentPage} / page
              </span>
            )}
          </div>
          <div className="flex items-center">
            <Button
              type="text"
              disabled={currentPage <= 1}
              onClick={() =>
                onPageChange(currentPage - 1)
              }
            >
              &lt;
            </Button>
            <Button type="text" className="mx-2 bg-green-500 text-white">
              {currentPage}
            </Button>
            <Button
              type="text"
              disabled={
                currentPage >=
                Math.ceil(total / pageSize)
              }
              onClick={() =>
                onPageChange(currentPage + 1)
              }
            >
              &gt;
            </Button>

            <Select
              className="ml-4"
              value={`${pageSize} / page`}
              style={{ width: 120 }}
              onChange={(value) => {
                const newPageSize = parseInt(value.split(" ")[0]);
                if (setPageSize) {
                  setPageSize(newPageSize);
                }
                onPageChange(1, newPageSize);
              }}
            >
              <Select.Option value="10 / page">10 / page</Select.Option>
              <Select.Option value="20 / page">20 / page</Select.Option>
              <Select.Option value="50 / page">50 / page</Select.Option>
            </Select>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default QuestionRepositoryDrawer; 