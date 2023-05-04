import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router";
import {
  fetchIncident,
  updateIncident,
  updateIncidentComments,
} from "../../ApiCalls";
import {
  Col,
  Row,
  Card,
  Form,
  Button,
  Input,
  InputNumber,
  Select,
  DatePicker,
  List,
  Tooltip,
} from "antd";
import { Comment } from "@ant-design/compatible";
import { UserContext } from "../../context/UserContext";

const { RangePicker } = DatePicker;

export default function IncidentDetails() {
  const params = useParams();
  const [incidentData, setIncidentData] = useState({});
  const { TextArea } = Input;
  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();
  const { userData } = useContext(UserContext);
  console.log("user data: ", userData);

  useEffect(() => {
    commentForm.setFieldsValue({
      authorEmail: userData.userEmail,
      author: {
        email: userData.userEmail,
        userRole: userData.userRole,
        userId: userData.userId,
        summary: userData.summary,
      },
    });
  }, [userData]);

  useEffect(() => {
    fetchIncident(params.id).then((response) => {
      if (response.data) {
        setIncidentData(response.data);
      }
    });
  }, []);

  useEffect(() => {
    console.log("this is incident data: ", incidentData);
    form.setFieldsValue(incidentData);
  }, [incidentData, form]);

  const addComment = async () => {
    updateIncidentComments(commentForm, incidentData).then((response) => {
      console.log(response);
    });
  };

  const updateIncidentForm = async () => {
    updateIncident(form, incidentData.comments, incidentData.incidentId).then(
      (response) => {
        console.log(response);
      }
    );
  };

  const data = [
    {
      actions: [<span key="comment-list-reply-to-0">Reply to</span>],
      author: "Han Solo",
      content: (
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
      datetime: (
        <Tooltip title="2016-11-22 11:22:33">
          <span>8 hours ago</span>
        </Tooltip>
      ),
    },
    {
      actions: [<span key="comment-list-reply-to-0">Reply to</span>],
      author: "Han Solo",
      content: (
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
      datetime: (
        <Tooltip title="2016-11-22 10:22:33">
          <span>9 hours ago</span>
        </Tooltip>
      ),
    },
  ];
  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={<h1>Incident {incidentData.incidentId}</h1>}
            bordered={false}
          >
            <Row>
              <Col sm={24} md={12}>
                <Form
                  labelCol={{ span: 12 }}
                  form={form}
                  wrapperCol={{ span: 20 }}
                  layout="vertical"
                  style={{ maxWidth: 600, padding: "16px 0px" }}
                  onFinish={updateIncidentForm}
                >
                  <Form.Item label="Request Type" name="requestType">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Incident Title" name="title">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Status" name="status">
                    <Select>
                      <Select.Option value="status">Status</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Description" name="summary">
                    <TextArea rows={5} />
                  </Form.Item>
                </Form>
              </Col>
              <Col sm={24} md={12}>
                <Form
                  labelCol={{ span: 12 }}
                  wrapperCol={{ span: 20 }}
                  form={form}
                  layout="vertical"
                  style={{ maxWidth: 600, padding: "16px 0px" }}
                >
                  <Form.Item label="Sub Category" name="subCategory">
                    <Select>
                      <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Incident Status" name="incidentStatus">
                    <Select>
                      <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Developer" name="developerId">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Reporter" name="reporterId">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Created Timestamp" name="timestamp">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Complexity" name="complexityRating">
                    <InputNumber />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      style={{ float: "right" }}
                      onClick={updateIncidentForm}
                    >
                      Update
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24}>
          {incidentData.comments && (
            <List
              header={`${incidentData.comments.length} Comments`}
              itemLayout="horizontal"
              dataSource={incidentData.comments}
              renderItem={(item) => (
                <li>
                  <Comment
                    actions={item.actions}
                    author={item.author}
                    avatar={item.avatar ?? ""}
                    content={item.content}
                    datetime={item.datetime}
                    style={{ padding: "0px 16px", margin: "16px 0px" }}
                  />
                </li>
              )}
            />
          )}
          <Card title="Add Comment" bordered={false}>
            <Form
              labelCol={{ span: 12 }}
              layout="vertical"
              style={{ padding: "16px 0px" }}
              form={commentForm}
            >
              <Form.Item label="Author" name="authorEmail">
                <Input />
              </Form.Item>
              <Form.Item label="Content" name="content">
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  onClick={addComment}
                  style={{ float: "right" }}
                >
                  Add comment
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
