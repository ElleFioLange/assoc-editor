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
  InputNumber,
} from "antd";
import {
  EditOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import { formatWithOptions } from "util";

const { TextArea } = Input;
const { Title } = Typography;

// function ImageItem({
//   value,
//   onChange,
// }: {
//   value?: ImageFormData;
//   onChange?: (value: ImageFormData) => void;
// }) {
//   const [path, setPath] = useState("");
//   function triggerChange(changedValue: { path: string }) {
//     onChange?.({ type: "image", ...value, ...changedValue });
//   }

//   function onPathChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const path = e.target.value;
//     if (!value) {
//       setPath(path);
//     }
//     triggerChange({ path });
//   }

//   return (
//     <Input type="text" value={value?.path || path} onChange={onPathChange} />
//   );
// }

// function ContentItem({
//   value,
//   onChange,
// }: {
//   value?: ContentFormData;
//   onChange?: (value: ContentFormData) => void;
// }) {
//   const [type, setType] = useState<"image" | "video" | "map">(
//     value ? value.type : "image"
//   );

//   function triggerChange(changedValue: ContentFormData) {
//     onChange?.(changedValue);
//   }

//   function onTypeChange(newType: "image" | "video" | "map") {
//     setType(newType);
//     triggerChange({ ...value, type: newType });
//   }

//   return (
//     <span>
//       <Select
//         style={{ minWidth: 65 }}
//         options={[
//           { label: "Image", value: "image" },
//           { label: "Video", value: "video" },
//           { label: "Map", value: "map" },
//         ]}
//         value={type}
//         onChange={setType}
//       />
//       {type === "image" && <ImageItem onChange={onChange} />}
//     </span>
//   );
// }

function NewContent() {
  const [form] = Form.useForm();
  const id = uuid();

  const [type, setType] = useState<"image" | "video" | "map">("image");

  return (
    <Form form={form} layout="vertical" name="newContentForm">
      <Form.Item name="id" label="Id" initialValue={id}>
        <Title level={5}>{id}</Title>
      </Form.Item>
      <Select
        style={{ minWidth: 75 }}
        options={[
          { label: "Image", value: "image" },
          { label: "Video", value: "video" },
          { label: "Map", value: "map" },
        ]}
        value={type}
        onChange={setType}
      />
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
      <Button type="primary" block onClick={form.submit}>
        Submit
      </Button>
    </Form>
  );
}

function NewItem() {
  const [form] = Form.useForm();
  const id = uuid();

  const [newContent, setNewContent] = useState(false);
  const [editContent, setEditContent] =
    useState<{ content: ContentFormData; index: number }>();

  return (
    <Form.Provider
      onFormFinish={(name, { values, forms }) => {
        const { newItemForm } = forms;
        const content = newItemForm.getFieldValue("content") || [];
        if (name === "newContentForm") {
          newItemForm.setFieldsValue({ content: [...content, values] });
          setNewContent(false);
        }
        if (name === "editContentForm") {
          const newContent = [...content];
          if ("path" in values) {
            const { type, path } = values;
            newContent[values.index] = {
              type,
              path,
            };
          }
          if ("posterPath" in values) {
            const { type, posterPath, videoPath } = values;
            newContent[values.index] = { type, posterPath, videoPath };
          }
          if ("lat" in values) {
            const { type, lat, lon, viewDelta, title, description } = values;
            newContent[values.index] = {
              type,
              lat,
              lon,
              viewDelta,
              title,
              description,
            };
          }
          newItemForm.setFieldsValue({ content: newContent });
          setEditContent(undefined);
        }
      }}
    >
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
                  onClick={() => setNewContent(true)}
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
            const content: ContentFormData[] = getFieldValue("content") || [];
            return content.length ? (
              <ul>
                {content.map((item, index) => (
                  <li key={index} style={{ marginBottom: 8 }}>
                    {item.type}
                    <Button
                      style={{ marginLeft: 12 }}
                      icon={<EditOutlined />}
                      onClick={() => {
                        // setEditItem({ item, index });
                        // setSelectedItem(item);
                        // setNewItem(true);
                        // setEditItem({ visible: true, item });
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
        <Button type="primary" block onClick={form.submit}>
          Submit
        </Button>
      </Form>
      {newContent && (
        <Modal
          title="New Content"
          visible={true}
          width={"auto"}
          style={{ top: 12 }}
          onCancel={() => setNewContent(false)}
        >
          <NewContent />
        </Modal>
      )}
    </Form.Provider>
  );
}

function EditItem({ data }: { data: { item: ItemFormData; index: number } }) {
  const [form] = Form.useForm();
  const { item, index } = data;
  const initContentTypes: Record<
    number,
    "image" | "video" | "map" | undefined
  > = {};
  item.content.forEach((content, index) => {
    initContentTypes[index] = content.type;
  });
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

  function initContentTypeField(
    name: number,
    type: "image" | "video" | "map" | undefined
  ) {
    const content = form.getFieldValue("content");
    const prev = content[name];
    console.log(content);
    console.log(prev);
    console.log(type);
    form.setFieldsValue({ content: { ...content, [name]: { ...prev, type } } });
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
              {fields.map(({ key, name, fieldKey, ...restField }) => {
                return (
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
                      {/* {({ getFieldValues }) => (

                      )}  */}
                      {/* <ContentItem
                        value={form.getFieldValue("content")[name]}
                      /> */}
                      <span>placeholder</span>
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
                );
              })}
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
          const { locationForm } = forms;
          const items = locationForm.getFieldValue("items") || [];
          if (name === "newItemForm") {
            locationForm.setFieldsValue({ items: [...items, values] });
            setNewItem(false);
          }
          if (name === "editItemForm") {
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
