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
  const [formDisabled, setFormDisabled] = useState(true);
  const [incidentData, setIncidentData] = useState({});
  const [comments, setComments] = useState([]);
  const { TextArea } = Input;
  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();
  const { userData } = useContext(UserContext);
  console.log("user data: ", userData);

  useEffect(() => {
    setFormDisabled(userData.userRole === "customer");
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
    let a = [];

    if (incidentData.comments) {
      incidentData?.comments.map((value) => {
        a.push({
          author: value.author.email,
          content: value.content,
        });
      });
    }

    setComments(a);
    if (incidentData?.developer && incidentData?.reporter) {
      form.setFieldsValue({
        ...incidentData,
        developerId: incidentData?.developer.userEmail ?? "",
        reporterId: incidentData?.reporter.userEmail ?? "",
      });
    }
  }, [incidentData, form]);

  const addComment = async () => {
    updateIncidentComments(
      commentForm,
      incidentData,
      incidentData?.comments ?? []
    ).then((response) => {
      console.log(response);
      window.location.reload();
    });
  };

  const updateIncidentForm = async () => {
    updateIncident(form, incidentData.comments, incidentData.incidentId).then(
      (response) => {
        console.log(response);
        window.location.reload();
      }
    );
  };

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
                  <Form.Item label="Request Type" name="taskType">
                    <Input disabled={true} />
                  </Form.Item>
                  <Form.Item label="Incident Title" name="title">
                    <Input disabled={true} />
                  </Form.Item>
                  <Form.Item label="Description" name="summary">
                    <TextArea rows={9} />
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
                    <Select disabled={formDisabled}>
                      <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Incident Status" name="incidentStatus">
                    <Select disabled={formDisabled}>
                      <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Developer" name="developerId">
                    <Input disabled={formDisabled} />
                  </Form.Item>
                  <Form.Item label="Reporter" name="reporterId">
                    <Input disabled={formDisabled} />
                  </Form.Item>
                  <Form.Item label="Created Timestamp" name="timestamp">
                    <Input disabled={true} />
                  </Form.Item>
                  {/* <Form.Item label="Complexity" name="complexityRating">
                    <InputNumber />
                  </Form.Item> */}
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
              header={`${incidentData?.comments.length} Comments`}
              itemLayout="horizontal"
              dataSource={comments}
              renderItem={(item) => (
                <li>
                  <Comment
                    author={item.author}
                    content={item.content}
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
