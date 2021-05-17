import React, { useState, useRef, useEffect } from "react";
import { v4 as uuid } from "uuid";
import {
  Form,
  Input,
  Button,
  Space,
  Select,
  Upload,
  Image,
  Typography,
  FormInstance,
  Checkbox,
  Modal,
} from "antd";
import {
  EditOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";

const { TextArea } = Input;
const { Title } = Typography;

function NewItem() {
  const [form] = Form.useForm();
  const id = uuid();
  const [contentTypes, setContentTypes] = useState<
    Record<number, "image" | "video" | "map" | undefined>
  >({});

  function updateContentTypes(
    index: number,
    value: "image" | "video" | "map" | undefined
  ) {
    setContentTypes((prev) => ({ ...prev, [index]: value }));
  }

  return (
    <Form form={form} layout="vertical" name="newItemForm">
      <Form.Item name="id" label="Id" initialValue={id}>
        <Title level={5}>{id}</Title>
      </Form.Item>
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
                  {/* <Form.Item
                    {...restField}
                    name={[name, "asdf"]}
                    fieldKey={[fieldKey, "asdf"]}
                    rules={[{ required: true }]}
                  >
                    <Input />
                    <Select
                      style={{ minWidth: 65 }}
                      options={[
                        { label: "Image", value: "image" },
                        { label: "Video", value: "video" },
                        { label: "Map", value: "map" },
                      ]}
                    />
                  </Form.Item> */}
                  <Form.Item
                    {...restField}
                    name={[name, "isSource"]}
                    fieldKey={[fieldKey, "isSource"]}
                    rules={[{ required: true }]}
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Checkbox>Source</Checkbox>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "id"]}
                    fieldKey={[fieldKey, "id"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="id" />
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
                onClick={add}
                block
                icon={<PlusCircleOutlined />}
              >
                Add connection
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>
      <Form.Item label="Content">
        <Form.List name="content">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Space
                  key={key}
                  align="baseline"
                  style={{ display: "flex", marginBottom: 8 }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, "type"]}
                    fieldKey={[fieldKey, "type"]}
                    rules={[{ required: true }]}
                    initialValue="image"
                  >
                    <Select
                      style={{ minWidth: 65 }}
                      options={[
                        { label: "Image", value: "image" },
                        { label: "Video", value: "video" },
                        { label: "Map", value: "map" },
                      ]}
                      value={contentTypes[name]}
                      onChange={(value) => updateContentTypes(name, value)}
                    />
                    {!contentTypes[name] && updateContentTypes(name, "image")}
                  </Form.Item>
                  <Button
                    style={{ marginLeft: 12 }}
                    icon={<MinusCircleOutlined />}
                    onClick={() => {
                      remove(name);
                      updateContentTypes(name, undefined);
                    }}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={add}
                block
                icon={<PlusCircleOutlined />}
              >
                Add content
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>
      <Button type="primary" block onClick={form.submit}>
        Submit
      </Button>
    </Form>
  );
}

function EditItem({ data }: { data: { item: ItemFormData; index: number } }) {
  const [form] = Form.useForm();
  const { item, index } = data;
  const initContentTypes: Record<
    number,
    "image" | "video" | "map" | undefined
  > = {};
  item.content.forEach(
    (content, index) => (initContentTypes[index] = content.type)
  );
  const [contentTypes, setContentTypes] =
    useState<Record<number, "image" | "video" | "map" | undefined>>(
      initContentTypes
    );

  function updateContentTypes(
    index: number,
    value: "image" | "video" | "map" | undefined
  ) {
    setContentTypes((prev) => ({ ...prev, [index]: value }));
  }

  return (
    <Form
      form={form}
      layout="vertical"
      name="editItemForm"
      initialValues={item}
    >
      <Form.Item hidden name="index" initialValue={index} />
      <Form.Item name="id" label="Id">
        <Title level={5}>{item.id}</Title>
      </Form.Item>
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
                    <Checkbox>Source</Checkbox>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "id"]}
                    fieldKey={[fieldKey, "id"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="id" />
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
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={add}
                  block
                  icon={<PlusCircleOutlined />}
                >
                  Add connection
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form.Item>
      <Form.Item label="Content">
        <Form.List name="content">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Space
                  key={key}
                  align="baseline"
                  style={{ display: "flex", marginBottom: 8 }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, "type"]}
                    fieldKey={[fieldKey, "type"]}
                    rules={[{ required: true }]}
                  >
                    <Select
                      style={{ minWidth: 65 }}
                      options={[
                        { label: "Image", value: "image" },
                        { label: "Video", value: "video" },
                        { label: "Map", value: "map" },
                      ]}
                      value={contentTypes[name]}
                      defaultValue={contentTypes[name]}
                      onChange={(value) => updateContentTypes(name, value)}
                    />
                    {!contentTypes[name] && updateContentTypes(name, "image")}
                  </Form.Item>
                  <Button
                    style={{ marginLeft: 12 }}
                    icon={<MinusCircleOutlined />}
                    onClick={() => {
                      remove(name);
                      updateContentTypes(name, undefined);
                    }}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={add}
                block
                icon={<PlusCircleOutlined />}
              >
                Add content
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>
      <Button type="primary" block onClick={form.submit}>
        Submit
      </Button>
    </Form>
  );
}

export function NewLocation({
  id,
  addLocation,
}: {
  id: string;
  addLocation: (data: LocationFormData) => void;
}): JSX.Element {
  const [form] = Form.useForm();

  const [newItem, setNewItem] = useState(false);
  const [editItem, setEditItem] =
    useState<{ item: ItemFormData; index: number }>();

  function submitLocation() {
    console.log(form.getFieldValue("items"));
    // const data = {
    //   id,
    //   name: form.getFieldValue("name"),
    //   description: form.getFieldValue("description"),
    //   items: form.getFieldValue("items"),
    // };
    // addLocation(data);
  }

  return (
    <div style={{ margin: 8, overflow: "scroll" }}>
      <Title level={3}>New Location</Title>
      <Space style={{ marginBottom: 16 }}>Id: {id}</Space>
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          if (name === "newItemForm") {
            const { locationForm } = forms;
            console.log(values);
            const items = locationForm.getFieldValue("items") || [];
            locationForm.setFieldsValue({ items: [...items, values] });
            setNewItem(false);
          }
          if (name === "editItemForm") {
            const { locationForm } = forms;
            const items = locationForm.getFieldValue("items");
            const newItems = [...items];
            const { id, name, description, content, connections, link } =
              values;
            newItems[values.index] = {
              id,
              name,
              description,
              content,
              connections,
              link,
            };
            locationForm.setFieldsValue({ items: newItems });
            setEditItem(undefined);
          }
        }}
      >
        <Form name="locationForm" form={form} onFinish={submitLocation}>
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
              const items: ItemFormData[] = getFieldValue("items") || [];
              return items.length ? (
                <ul>
                  {items.map((item, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>
                      {item.name}
                      <Button
                        style={{ marginLeft: 12 }}
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditItem({ item, index });
                          // setSelectedItem(item);
                          // setNewItem(true);
                          // setEditItem({ visible: true, item });
                        }}
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
            onClick={() => setNewItem(true)}
          >
            Add Item
          </Button>
          <Form.Item>
            <Button block type="primary" onClick={submitLocation}>
              Submit
            </Button>
          </Form.Item>
        </Form>

        {newItem && (
          <Modal
            title="New Item"
            visible={true}
            width={"auto"}
            style={{ top: 12 }}
            onCancel={() => setNewItem(false)}
          >
            <NewItem />
          </Modal>
        )}
        {editItem && (
          <Modal
            onCancel={() => setEditItem(undefined)}
            title="Edit Item"
            visible={true}
            width={"auto"}
            style={{ top: 12, overflow: "auto" }}
          >
            <EditItem data={editItem} />
          </Modal>
        )}
      </Form.Provider>
    </div>
  );
}

export function LocationEditor({
  location,
}: {
  location: LocationData;
}): JSX.Element {
  return (
    <Typography.Title>
      Location buudyyydafkll yeah that&apos;s right boiiiiiiiii
    </Typography.Title>
  );
}

export function ItemEditor({ item }: { item: ItemData }): JSX.Element {
  return (
    <Typography.Title>
      Item buudyyydafkll yeah that&apos;s right boiiiiiiiii
    </Typography.Title>
  );
}
