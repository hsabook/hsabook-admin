import React, { useState, useEffect } from "react";
import {
  Drawer,
  Typography,
  Button,
  Table,
  Space,
  Tooltip,
  message,
  Modal,
  Spin,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  DatabaseOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { ExamDetail, QuestionEntity } from "./types";
import QuestionContent from "../../../components/QuestionDetail/QuestionContent";

const { Title, Text } = Typography;
const { confirm } = Modal;

interface ExamDetailProps {
  visible: boolean;
  loading: boolean;
  examDetail: ExamDetail | null;
  onClose: () => void;
  onShowEditModal: () => void;
  onAddFromRepository: () => void;
  onAddNewQuestion: () => void;
  onShowQuestionDetail: (question: QuestionEntity) => void;
  onPrepareQuestionForEditing: (questionId: string) => void;
  onRemoveQuestion: (examId: string, questionId: string) => Promise<void>;
  fetchExamDetail: (examId: string) => Promise<void>;
}

const ExamDetailComponent: React.FC<ExamDetailProps> = ({
  visible,
  loading,
  examDetail,
  onClose,
  onShowEditModal,
  onAddFromRepository,
  onAddNewQuestion,
  onShowQuestionDetail,
  onPrepareQuestionForEditing,
  onRemoveQuestion,
  fetchExamDetail,
}) => {
  const [isQuestionDetailVisible, setIsQuestionDetailVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionEntity | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Refresh exam detail when it changes
  useEffect(() => {
    if (visible && examDetail) {
      fetchExamDetail(examDetail.id);
    }
  }, [visible, examDetail?.id, fetchExamDetail]);

  // Show question detail
  const handleShowQuestionDetail = (question: QuestionEntity) => {
    setSelectedQuestion(question);
    setIsQuestionDetailVisible(true);
  };

  // Close question detail
  const handleCloseQuestionDetail = () => {
    setIsQuestionDetailVisible(false);
    setSelectedQuestion(null);
  };

  // Handle remove question
  const handleRemoveQuestion = (examId: string, questionId: string) => {
    confirm({
      title: "Are you sure you want to remove this question from the exam?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          setLocalLoading(true);
          await onRemoveQuestion(examId, questionId);
          if (examDetail) {
            await fetchExamDetail(examDetail.id);
          }
        } catch (error) {
          console.error("🔴 ExamDetail handleRemoveQuestion error:", error);
          message.error("Failed to remove question from exam");
        } finally {
          setLocalLoading(false);
        }
      },
    });
  };

  // Handle add new question
  const handleAddNewQuestion = () => {
    onAddNewQuestion();
  };

  // Table columns configuration for questions
  const questionColumns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 80,
      render: (_: any, _record: any, index: number) => index + 1,
    },
    {
      title: "ID",
      dataIndex: "question",
      key: "code_id",
      render: (question: QuestionEntity) => question.code_id,
    },
    {
      title: "Câu hỏi",
      dataIndex: "question",
      key: "question",
      render: (question: QuestionEntity) => (
        <div
          dangerouslySetInnerHTML={{
            __html: question.question.length > 100
              ? question.question.substring(0, 100) + "..."
              : question.question,
          }}
        />
      ),
    },
    {
      title: "Loại",
      dataIndex: "question",
      key: "type",
      render: (question: QuestionEntity) => question.type,
    },
    {
      title: "Môn học",
      dataIndex: "question",
      key: "subject",
      render: (question: QuestionEntity) => question.subject,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (record: any) => (
        <Space size="middle">
          <Tooltip title="View Detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleShowQuestionDetail(record.question)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onPrepareQuestionForEditing(record.question_id)}
            />
          </Tooltip>
          <Tooltip title="Remove from Exam">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveQuestion(record.exam_id, record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <span>Exam Detail</span>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={onShowEditModal}
              >
                Edit Exam
              </Button>
            </Space>
          </div>
        }
        placement="right"
        closable={true}
        onClose={onClose}
        open={visible}
        width="80%"
      >
        {loading || localLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : examDetail ? (
          <div>
            <div className="mb-6">
              <Title level={4}>{examDetail.title}</Title>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Text strong>ID:</Text> {examDetail.code_id}
                </div>
                <div>
                  <Text strong>Status:</Text>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      examDetail.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {examDetail.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <Text strong>Total Questions:</Text>{" "}
                  {examDetail.total_question}
                </div>
                <div>
                  <Text strong>Last Updated:</Text>{" "}
                  {new Date(examDetail.updated_at).toLocaleString()}
                </div>
              </div>
              {examDetail.description && (
                <div className="mt-4">
                  <Text strong>Description:</Text>
                  <div className="mt-2">{examDetail.description}</div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <Title level={5}>Questions</Title>
                <Space>
                  <Button
                    type="primary"
                    icon={<DatabaseOutlined />}
                    onClick={onAddFromRepository}
                  >
                    Add from Repository
                  </Button>
                  <Button
                    icon={<PlusCircleOutlined />}
                    onClick={handleAddNewQuestion}
                  >
                    Add New Question
                  </Button>
                </Space>
              </div>

              <Table
                columns={questionColumns}
                dataSource={examDetail.exams_question}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-10">No exam details available</div>
        )}
      </Drawer>

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <Modal
          title="Question Detail"
          open={isQuestionDetailVisible}
          onCancel={handleCloseQuestionDetail}
          footer={null}
          width={800}
        >
          <QuestionContent question={selectedQuestion} />
        </Modal>
      )}
    </>
  );
};

export default ExamDetailComponent;
