import React, { useEffect } from "react";
import { Modal, Form, Input, Switch, Button } from "antd";
import { ExamDetail } from "./types";

interface EditExamModalProps {
  visible: boolean;
  loading: boolean;
  examDetail: ExamDetail | null;
  onCancel: () => void;
  onEdit: (values: any) => Promise<void>;
}

const EditExamModal: React.FC<EditExamModalProps> = ({
  visible,
  loading,
  examDetail,
  onCancel,
  onEdit,
}) => {
  const [form] = Form.useForm();

  // Set form values when exam detail changes
  useEffect(() => {
    if (examDetail && visible) {
      form.setFieldsValue({
        title: examDetail.title,
        code_id: examDetail.code_id,
        description: examDetail.description,
        active: examDetail.active,
      });
    }
  }, [examDetail, visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onEdit(values);
    } catch (error) {
      console.error("🔴 EditExamModal handleSubmit error:", error);
    }
  };

  return (
    <Modal
      title="Edit Exam"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Save
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="title"
          label="Exam Title"
          rules={[{ required: true, message: "Please enter exam title" }]}
        >
          <Input placeholder="Enter exam title" />
        </Form.Item>

        <Form.Item
          name="code_id"
          label="Exam ID"
          rules={[{ required: true, message: "Please enter exam ID" }]}
        >
          <Input placeholder="Enter exam ID" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            placeholder="Enter exam description"
            rows={4}
          />
        </Form.Item>

        <Form.Item
          name="active"
          label="Status"
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditExamModal;
