import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Row,
  Typography,
  Modal,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  notification,
} from "antd";
import { createIncident } from "../ApiCalls";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const IncidentForm = ({ form, requestType }) => {
  return (
    <>
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
        form={form}
        style={{ maxWidth: 600, padding: "16px 0px" }}
      >
        <Form.Item label="Request Type" name="requestType">
          <Input value={requestType} />
        </Form.Item>
        <Form.Item label="Incident Title" name="title">
          <Input />
        </Form.Item>
        <Form.Item label="Sub Category" name="subCategory">
          <Select>
            <Select.Option value="demo">Demo</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="RangePicker" name="dateRange">
          <RangePicker />
        </Form.Item>
        <Form.Item label="Complexity" name="complexity">
          <InputNumber />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Comments" name="comment">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="Upload"
          valuePropName="fileList"
          name="file"
          getValueFromEvent={normFile}
        >
          <Upload action="/upload.do" listType="picture-card">
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </>
  );
};
export default function HomePage({ user, signOut }) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const submitRequests = async (key) => {
    form.setFieldValue({ requestType: key });
    createIncident(form).then(() => {
      setOpen(false);
      notification.info({
        message: "Incident created",
        duration: 300,
      });
    });
  };

  const clearForm = () => {
    setOpen(false);
    form.resetFields();
  };

  const requestTypes = [
    {
      key: "Hardware Requests1",
      description:
        "Order somethingOrder somethingOrder somethingOrder somethingOrder something",
    },
    { key: "Hardware Requests2", description: "Order something" },
    { key: "Hardware Requests3", description: "Order something" },
    { key: "Hardware Requests4", description: "Order something" },
    { key: "Hardware Requests5", description: "Order something" },
    { key: "Hardware Requests6", description: "Order something" },
  ];

  return (
    <div style={{ padding: "16px 0px" }}>
      <Title>Create a request</Title>
      <Row gutter={[16, 16]}>
        {requestTypes.map((value, index) => {
          return (
            <Col key={index} md={8} sm={24}>
              <Card
                title={value.key}
                bordered={false}
                actions={[
                  <Button
                    onClick={() => setOpen(true)}
                    style={{ float: "right", marginRight: "8px" }}
                  >
                    Request
                  </Button>,
                ]}
              >
                <div
                  style={{
                    height: "15em",
                    overflow: "hidden",
                    padding: 24,
                  }}
                >
                  {value.description}
                </div>
                <Modal
                  title="Create Request"
                  open={open}
                  onOk={() => submitRequests(value.key)}
                  onCancel={clearForm}
                  okText="Create"
                  cancelText="Cancel"
                >
                  <IncidentForm form={form} requestType={value.key} />
                </Modal>
              </Card>
            </Col>
          );
        })}
      </Row>
      <Row style={{ margin: "16px 0px" }}>
        <Col span={24}>
          <Card title={"Something"} bordered={false}>
            Hello this is some description
          </Card>
        </Col>
      </Row>
    </div>
  );
}
