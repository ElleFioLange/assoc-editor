import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import {
  Form,
  Input,
  Button,
  Space,
  Select,
  Typography,
  Checkbox,
  Modal,
  InputNumber,
} from "antd";
import {
  EditOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";

const { TextArea } = Input;
const { Title } = Typography;

function ContentEditor({
  data,
  onFinish,
}: {
  data: string | TContentForm;
  onFinish: () => void;
}) {
  const [form] = Form.useForm();

  const [type, setType] = useState<ContentType>(
    typeof data === "string" ? "image" : data.type
  );

  function updateType(type: ContentType) {
    setType(type);
    form.setFieldsValue({ type });
  }

  return (
    <Form
      form={form}
      layout="vertical"
      name="contentForm"
      initialValues={typeof data === "string" ? undefined : data}
    >
      <Form.Item
        name="id"
        initialValue={typeof data === "string" ? data : data.id}
        hidden
      />
      <Space style={{ marginBottom: 16, display: "block" }}>
        Id: {typeof data === "string" ? data : data.id}
      </Space>
      <Select
        style={{ minWidth: 75 }}
        options={[
          { label: "Image", value: "image" },
          { label: "Video", value: "video" },
          { label: "Map", value: "map" },
        ]}
        value={type}
        onChange={updateType}
      />
      <Form.Item name="type" initialValue="image" hidden />
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      {type === "image" && (
        <Form.Item label="Path" name="path">
          <Input />
        </Form.Item>
      )}
      {type === "video" && (
        <>
          <Form.Item label="Poster Path" name="posterPath">
            <Input />
          </Form.Item>
          <Form.Item label="Video Path" name="videoPath">
            <Input />
          </Form.Item>
        </>
      )}
      {type === "map" && (
        <>
          <Form.Item label="Latitude" name="lat">
            <InputNumber />
          </Form.Item>
          <Form.Item label="Longitude" name="lon">
            <InputNumber />
          </Form.Item>
          <Form.Item label="View Delta" name="viewDelta">
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea rows={6} />
          </Form.Item>
        </>
      )}
      <Button
        type="primary"
        block
        onClick={() => {
          form.submit();
          onFinish();
        }}
      >
        Submit
      </Button>
    </Form>
  );
}

export function ItemEditor({
  data,
  onFinish,
  submit,
}: {
  data: string | TItemForm;
  onFinish?: () => void;
  submit?: (update: TItemForm, prevData: TItemForm) => void;
}): JSX.Element {
  const [form] = Form.useForm();

  const [contentEditor, setContentEditor] = useState<string | TContentForm>();

  return (
    <Form.Provider
      onFormFinish={(name, { values, forms }) => {
        switch (name) {
          case "contentForm": {
            const { itemForm } = forms;
            const content = itemForm.getFieldValue("content") || [];
            const index = content.getIndexOf(values);
            if (index === -1)
              itemForm.setFieldsValue({
                content: [...content, values],
              });
            else {
              const newContent = [...content];
              newContent[index] = values;
              itemForm.setFieldsValue({ content: newContent });
            }
            break;
          }
          case "itemForm": {
            if (submit) {
              const { itemForm } = forms;
              const connections = itemForm.getFieldValue("connections") || [];
              connections.forEach((connection: TConnectionForm) => {
                if (!connection.id) connection.id = uuid();
              });
              const content = itemForm.getFieldValue("content") || [];
              const item = {
                ...values,
                connections,
                content,
                parentId: typeof data != "string" ? data.parentId : undefined,
              } as TItemForm;
              if (typeof data !== "string") submit(item, data);
            }
          }
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="itemForm"
        initialValues={typeof data === "string" ? undefined : data}
      >
        <Form.Item
          name="id"
          initialValue={typeof data === "string" ? data : data.id}
          hidden
        />
        <Space style={{ marginBottom: 16 }}>
          Id: {typeof data === "string" ? data : data.id}
        </Space>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true }]}
        >
          <TextArea rows={6} />
        </Form.Item>
        <Form.Item label="Connections">
          <Form.List name="connections">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "isSource"]}
                      fieldKey={[fieldKey, "isSource"]}
                      rules={[{ required: true }]}
                      valuePropName="checked"
                      initialValue={false}
                    >
                      <Checkbox>Source?</Checkbox>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "partnerId"]}
                      fieldKey={[fieldKey, "partnerId"]}
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="partnerId" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "key"]}
                      fieldKey={[fieldKey, "key"]}
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="key" />
                    </Form.Item>
                    <Button
                      style={{ marginLeft: 12 }}
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusCircleOutlined />}
                >
                  Add connection
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
        <Form.Item
          label="Content"
          shouldUpdate={(prevValues, curValues) =>
            prevValues.content !== curValues.content
          }
        >
          {({ getFieldValue, setFieldsValue }) => {
            const content: TContentForm[] = getFieldValue("content") || [];
            return content.length ? (
              <ul>
                {content.map((item, index) => (
                  <li key={index} style={{ marginBottom: 8 }}>
                    {item.name} - {item.type}
                    <Button
                      style={{ marginLeft: 12 }}
                      icon={<EditOutlined />}
                      onClick={() => setContentEditor(item)}
                    />
                    <Button
                      style={{ marginLeft: 12 }}
                      icon={<UpOutlined />}
                      onClick={() => {
                        if (index != 0) {
                          const newContent = [...content];
                          const item = newContent.splice(index, 1);
                          newContent.splice(index - 1, 0, item[0]);
                          setFieldsValue({ content: newContent });
                        }
                      }}
                    />
                    <Button
                      style={{ marginLeft: 12 }}
                      icon={<DownOutlined />}
                      onClick={() => {
                        if (index != content.length - 1) {
                          const newContent = [...content];
                          const item = newContent.splice(index, 1);
                          newContent.splice(index + 1, 0, item[0]);
                          setFieldsValue({ content: newContent });
                        }
                      }}
                    />
                    <Button
                      style={{ marginLeft: 12 }}
                      icon={<MinusCircleOutlined />}
                      onClick={() => {
                        const newContent = [...content];
                        newContent.splice(index, 1);
                        setFieldsValue({ content: newContent });
                      }}
                    />
                  </li>
                ))}
              </ul>
            ) : null;
          }}
        </Form.Item>
        <Button
          style={{ marginBottom: 12 }}
          type="dashed"
          block
          icon={<PlusCircleOutlined />}
          onClick={() => setContentEditor(uuid())}
        >
          Add Content
        </Button>
        <Button
          type="primary"
          block
          onClick={() => {
            form.submit();
            if (onFinish) onFinish();
          }}
          style={{ marginBottom: 16 }}
        >
          Submit
        </Button>
      </Form>
      {contentEditor && (
        <Modal
          title="New Content"
          visible={true}
          width={"auto"}
          style={{ top: 12 }}
          onCancel={() => setContentEditor(undefined)}
        >
          <ContentEditor
            data={contentEditor}
            onFinish={() => setContentEditor(undefined)}
          />
        </Modal>
      )}
    </Form.Provider>
  );
}

export function LocationEditor({
  data,
  submit,
}: {
  data: string | TLocationForm;
  submit: (update: TLocationForm, prevData: string | TLocationForm) => void;
}): JSX.Element {
  const [form] = Form.useForm();

  const [itemEditor, setItemEditor] = useState<string | TItemForm>();

  return (
    <div style={{ margin: 8, overflow: "auto" }}>
      <Title level={3}>
        {typeof data === "string" ? "New" : "Edit"} Location
      </Title>
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          switch (name) {
            case "locationForm": {
              const { locationForm } = forms;
              const items = locationForm.getFieldValue("items") || [];
              const location = { ...values, items } as TLocationForm;
              submit(location, data);
              break;
            }
            case "itemForm": {
              const { locationForm, itemForm } = forms;
              const items = locationForm.getFieldValue("items") || [];
              const connections = itemForm.getFieldValue("connections") || [];
              connections.forEach((connection: TConnectionForm) => {
                if (!connection.id) connection.id = uuid();
              });
              const content = itemForm.getFieldValue("content") || [];
              locationForm.setFieldsValue({
                items: [
                  ...items,
                  {
                    ...values,
                    content,
                    connections,
                    parentId: typeof data === "string" ? data : data.id,
                  },
                ],
              });
            }
          }
        }}
      >
        <Form
          name="locationForm"
          form={form}
          initialValues={typeof data === "string" ? undefined : data}
        >
          <Form.Item
            name="id"
            initialValue={typeof data === "string" ? data : data.id}
            hidden
          />
          <Space style={{ marginBottom: 16 }}>
            Id: {typeof data === "string" ? data : data.id}
          </Space>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true }]}
          >
            <TextArea rows={6} />
          </Form.Item>
          <Form.Item
            label="Items"
            shouldUpdate={(prevValues, curValues) =>
              prevValues.items !== curValues.items
            }
          >
            {({ getFieldValue, setFieldsValue }) => {
              const items: TItemForm[] = getFieldValue("items") || [];
              return items.length ? (
                <ul>
                  {items.map((item, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>
                      {item.name}
                      <Button
                        style={{ marginLeft: 12 }}
                        icon={<EditOutlined />}
                        onClick={() => setItemEditor(item)}
                      />
                      <Button
                        style={{ marginLeft: 12 }}
                        icon={<MinusCircleOutlined />}
                        onClick={() => {
                          const newItems = [...items];
                          newItems.splice(index, 1);
                          setFieldsValue({ items: newItems });
                        }}
                      />
                    </li>
                  ))}
                </ul>
              ) : null;
            }}
          </Form.Item>
          <Button
            style={{ marginBottom: 12 }}
            type="dashed"
            block
            icon={<PlusCircleOutlined />}
            onClick={() => setItemEditor(uuid())}
          >
            Add Item
          </Button>
          <Button
            type="primary"
            block
            onClick={form.submit}
            style={{ marginBottom: 16 }}
          >
            Submit
          </Button>
        </Form>
        {itemEditor && (
          <Modal
            title="New Item"
            visible={true}
            width={"auto"}
            style={{ top: 12 }}
            onCancel={() => setItemEditor(undefined)}
          >
            <ItemEditor
              data={itemEditor}
              onFinish={() => setItemEditor(undefined)}
            />
          </Modal>
        )}
      </Form.Provider>
    </div>
  );
}
