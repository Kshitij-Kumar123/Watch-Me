import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Form, Input, Button, Select } from "antd";
import { fetchUserDetails, updatePermissions } from "../../ApiCalls";

export default function AdminControl() {
  const { userData } = useContext(UserContext);
  const [roleChangeUserData, setRoleChangeUserData] = useState({});
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { TextArea } = Input;

  useEffect(() => {
    if (userData.userRole?.toLowerCase().trim() !== "admin") {
      navigate("/error");
      return;
    }

    form.setFieldsValue({
      userId: "",
      summary: "",
      userRole: "",
    });
    console.log(userData);
  }, []);

  const searchUser = (values) => {
    if (values.userId !== roleChangeUserData.userId) {
      fetchUserDetails(values.userId).then((response) => {
        console.log(response.data);
        form.setFieldsValue({
          ...response.data,
        });
        setRoleChangeUserData(response.data);
      });
    } else {
      let requestBody = values;

      requestBody = {
        userEmail: values.userEmail,
        userId: values.userId,
        role: values.userRole,
      };

      updatePermissions(requestBody).then((response) => {
        console.log("success");
        // TODO: Notify success
      });
    }
  };

  return (
    <div style={{ padding: 16, marginTop: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <>
                <h1>Admin Control</h1>
                <p style={{ fontSize: 24 }}>Change user role</p>
              </>
            }
            bordered={false}
          >
            <Form
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 20 }}
              form={form}
              layout="vertical"
              onFinish={searchUser}
              style={{ maxWidth: 600, padding: "16px 0px" }}
            >
              <Form.Item label="User's Id to change role" name="userId">
                <Input />
              </Form.Item>

              {Object.keys(roleChangeUserData).length > 0 && (
                <>
                  <Form.Item label="Summary" name="summary">
                    <Input value={roleChangeUserData.summary} />
                  </Form.Item>
                  <Form.Item label="Assigned Role" name="userRole">
                    <Select value={roleChangeUserData.userRole}>
                      <Select.Option value="admin">Admin</Select.Option>
                      <Select.Option value="developer">Developer</Select.Option>
                      <Select.Option value="customer">Customer</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="User Email" name="userEmail">
                    <Input value={roleChangeUserData.userEmail} />
                  </Form.Item>
                </>
              )}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
