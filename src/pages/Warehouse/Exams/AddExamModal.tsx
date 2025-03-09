import React from "react";
import { Modal, Form, Input, Switch, Button } from "antd";

interface AddExamModalProps {
  visible: boolean;
  loading: boolean;
  onCancel: () => void;
  onAdd: (values: any) => Promise<void>;
}

const AddExamModal: React.FC<AddExamModalProps> = ({
  visible,
  loading,
  onCancel,
  onAdd,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onAdd(values);
      form.resetFields();
    } catch (error) {
      console.error("🔴 AddExamModal handleSubmit error:", error);
    }
  };

  return (
    <Modal
      title="Add New Exam"
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
          Create
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ active: true }}
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

export default AddExamModal;
