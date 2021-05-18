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
} from "@ant-design/icons";
import "antd/dist/antd.css";

const { TextArea } = Input;
const { Title } = Typography;

function ContentForm({
  id,
  type,
  updateType,
}: {
  id: string;
  type: ContentType;
  updateType: (type: ContentType) => void;
}) {
  return (
    <>
      <Form.Item name="id" initialValue={id} hidden />
      <Space style={{ marginBottom: 16, display: "block" }}>Id: {id}</Space>
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
    </>
  );
}

function NewContent({
  id,
  onFinish,
  formName,
}: {
  id: string;
  onFinish: () => void;
  formName: string;
}) {
  const [form] = Form.useForm();

  const [type, setType] = useState<ContentType>("image");

  function updateType(type: ContentType) {
    setType(type);
    form.setFieldsValue({ type });
  }

  return (
    <Form form={form} layout="vertical" name={formName}>
      <ContentForm id={id} type={type} updateType={updateType} />
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

function EditContent({
  content,
  onFinish,
  formName,
}: {
  content: TContentFormData;
  onFinish: () => void;
  formName: string;
}) {
  const [form] = Form.useForm();

  const [type, setType] = useState<ContentType>(content.type);

  function updateType(type: ContentType) {
    setType(type);
    form.setFieldsValue({ type });
  }

  return (
    <Form form={form} layout="vertical" name={formName} initialValues={content}>
      <ContentForm id={content.id} type={type} updateType={updateType} />
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

function ItemForm({
  id,
  openNewContent,
  openEditContent,
}: {
  id: string;
  openNewContent: () => void;
  openEditContent: (content: TContentFormData) => void;
}): JSX.Element {
  return (
    <>
      <Form.Item name="id" initialValue={id} hidden />
      <Space style={{ marginBottom: 16 }}>Id: {id}</Space>
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
      <Form.Item
        label="Content"
        shouldUpdate={(prevValues, curValues) =>
          prevValues.content !== curValues.content
        }
      >
        {({ getFieldValue, setFieldsValue }) => {
          const content: TContentFormData[] = getFieldValue("content") || [];
          return content.length ? (
            <ul>
              {content.map((item, index) => (
                <li key={index} style={{ marginBottom: 8 }}>
                  {item.name} - {item.type}
                  <Button
                    style={{ marginLeft: 12 }}
                    icon={<EditOutlined />}
                    onClick={() => openEditContent(item)}
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
        onClick={openNewContent}
      >
        Add Content
      </Button>
    </>
  );
}

function NewLocationItem({
  id,
  onFinish,
}: {
  id: string;
  onFinish: () => void;
}) {
  const [form] = Form.useForm();

  const [newContent, setNewContent] = useState(false);
  const [editContent, setEditContent] = useState<TContentFormData>();

  return (
    <Form.Provider>
      <Form form={form} layout="vertical" name="newItemForm">
        <ItemForm
          id={id}
          openNewContent={() => setNewContent(true)}
          openEditContent={(content: TContentFormData) =>
            setEditContent(content)
          }
        />
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
      {newContent && (
        <Modal
          title="New Content"
          visible={true}
          width={"auto"}
          style={{ top: 12 }}
          onCancel={() => setNewContent(false)}
        >
          <NewContent
            id={uuid()}
            onFinish={() => setNewContent(false)}
            formName="newItemNewContentForm"
          />
        </Modal>
      )}
      {editContent && (
        <Modal
          title="Edit Content"
          visible={true}
          width={"auto"}
          style={{ top: 12 }}
          onCancel={() => setEditContent(undefined)}
        >
          <EditContent
            content={editContent}
            onFinish={() => setEditContent(undefined)}
            formName="newItemEditContentForm"
          />
        </Modal>
      )}
    </Form.Provider>
  );
}

function EditLocationItem({
  item,
  onFinish,
}: {
  item: TItemFormData;
  onFinish: () => void;
}) {
  const [form] = Form.useForm();

  const [newContent, setNewContent] = useState(false);
  const [editContent, setEditContent] = useState<TContentFormData>();

  return (
    <Form.Provider>
      <Form
        form={form}
        layout="vertical"
        name="editItemForm"
        initialValues={item}
      >
        <ItemForm
          id={item.id}
          openNewContent={() => setNewContent(true)}
          openEditContent={(content: TContentFormData) =>
            setEditContent(content)
          }
        />
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
      {newContent && (
        <Modal
          title="New Content"
          visible={true}
          width={"auto"}
          style={{ top: 12 }}
          onCancel={() => setNewContent(false)}
        >
          <NewContent
            id={uuid()}
            onFinish={() => setNewContent(false)}
            formName="editItemNewContentForm"
          />
        </Modal>
      )}
      {editContent && (
        <Modal
          title="Edit Content"
          visible={true}
          width={"auto"}
          style={{ top: 12 }}
          onCancel={() => setEditContent(undefined)}
        >
          <EditContent
            content={editContent}
            onFinish={() => setEditContent(undefined)}
            formName="editItemEditContentForm"
          />
        </Modal>
      )}
    </Form.Provider>
  );
}

function LocationForm({
  id,
  openNewItem,
  openEditItem,
}: {
  id: string;
  openNewItem: () => void;
  openEditItem: (item: TItemFormData, index: number) => void;
}) {
  return (
    <>
      <Form.Item name="id" initialValue={id} hidden />
      <Space style={{ marginBottom: 16 }}>Id: {id}</Space>
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
          const items: TItemFormData[] = getFieldValue("items") || [];
          return items.length ? (
            <ul>
              {items.map((item, index) => (
                <li key={index} style={{ marginBottom: 8 }}>
                  {item.name}
                  <Button
                    style={{ marginLeft: 12 }}
                    icon={<EditOutlined />}
                    onClick={() => openEditItem(item, index)}
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
        onClick={openNewItem}
      >
        Add Item
      </Button>
    </>
  );
}

export function NewLocation({
  id,
  addLocation,
}: {
  id: string;
  addLocation: (data: TLocationFormData) => void;
}): JSX.Element {
  const [form] = Form.useForm();

  const [newItem, setNewItem] = useState(false);
  const [editItem, setEditItem] = useState<TItemFormData>();

  function submitLocation(values: TLocationFormData) {
    console.log(values);
    // addLocation(values);
  }

  return (
    <div style={{ margin: 8, overflow: "auto" }}>
      <Title level={3}>New Location</Title>
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          switch (name) {
            case "locationForm": {
              const { locationForm } = forms;
              const items = locationForm.getFieldValue("items") || [];
              const location = { ...values, items } as TLocationFormData;
              submitLocation(location);
              break;
            }
            case "newItemForm": {
              const { locationForm, newItemForm } = forms;
              const items = locationForm.getFieldValue("items") || [];
              const connections = newItemForm.getFieldValue("connections") || [];
              console.log(connections);
              const content = newItemForm.getFieldValue("content") || [];
              locationForm.setFieldsValue({
                items: [...items, { ...values, content }],
              });
              break;
            }
            case "editItemForm": {
              const { locationForm, editItemForm } = forms;
              const items = locationForm.getFieldValue("items") || [];
              const content = editItemForm.getFieldValue("content") || [];
              const newItems = [...items];
              newItems[values.index] = {
                id: values.id,
                name: values.name,
                description: values.description,
                parentId: id,
                content,
                connections: values.connections,
                link: values.link,
              };
              locationForm.setFieldsValue({ items: newItems });
              break;
            }
            case "newItemNewContentForm": {
              const { newItemForm } = forms;
              const content = newItemForm.getFieldValue("content") || [];
              newItemForm.setFieldsValue({ content: [...content, values] });
              break;
            }
            case "newItemEditContentForm": {
              const { newItemForm } = forms;
              const content = newItemForm.getFieldValue("content") || [];
              const newContent = [...content];
              newContent[values.index] = values;
              newItemForm.setFieldsValue({ content: newContent });
              break;
            }
            case "editItemNewContentForm": {
              const { editItemForm } = forms;
              const content = editItemForm.getFieldValue("content") || [];
              editItemForm.setFieldsValue({ content: [...content, values] });
              break;
            }
            case "editItemEditContentForm": {
              const { editItemForm } = forms;
              const content = editItemForm.getFieldValue("content") || [];
              const newContent = [...content];
              newContent[values.index] = values;
              editItemForm.setFieldsValue({ content: newContent });
              break;
            }
            default:
              null;
          }
        }}
      >
        <Form name="locationForm" form={form}>
          <LocationForm
            id={id}
            openNewItem={() => setNewItem(true)}
            openEditItem={(item) => setEditItem(item)}
          />
          <Button type="primary" block onClick={form.submit}>
            Submit
          </Button>
        </Form>
        {newItem && (
          <Modal
            title="New Item"
            visible={true}
            width={"auto"}
            style={{ top: 12 }}
            onCancel={() => setNewItem(false)}
          >
            <NewLocationItem id={uuid()} onFinish={() => setNewItem(false)} />
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
            <EditLocationItem
              item={editItem}
              onFinish={() => setEditItem(undefined)}
            />
          </Modal>
        )}
      </Form.Provider>
    </div>
  );
}

export function EditLocation({
  location,
  updateLocation,
}: {
  location: TLocationFormData;
  updateLocation: (data: TLocationFormData) => void;
}): JSX.Element {
  const [form] = Form.useForm();

  const [newItem, setNewItem] = useState(false);
  const [editItem, setEditItem] = useState<TItemFormData>();

  function submitLocation() {
    console.log(form.getFieldsValue());
  }

  return (
    <div style={{ margin: 8, overflow: "auto" }}>
      <Title level={3}>Edit Location</Title>
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          if (name === "editLocationNewItemForm") {
            const { locationForm } = forms;
            const items = locationForm.getFieldValue("items") || [];
            locationForm.setFieldsValue({ items: [...items, values] });
          }
          if (name === "editLocationEditItemForm") {
            const { locationForm } = forms;
            const items = locationForm.getFieldValue("items") || [];
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
          }
        }}
      >
        <Form
          name="newLocationForm"
          form={form}
          onFinish={submitLocation}
          initialValues={location}
        >
          <LocationForm
            id={location.id}
            openNewItem={() => setNewItem(true)}
            openEditItem={(item) => setEditItem(item)}
          />
          <Button type="primary" block onClick={form.submit}>
            Submit
          </Button>
        </Form>
        {newItem && (
          <Modal
            title="New Item"
            visible={true}
            width={"auto"}
            style={{ top: 12 }}
            onCancel={() => setNewItem(false)}
          >
            <NewLocationItem id={uuid()} onFinish={() => setNewItem(false)} />
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
            <EditLocationItem
              item={editItem}
              onFinish={() => setEditItem(undefined)}
              // formName="newLocationEditItemForm"
            />
          </Modal>
        )}
      </Form.Provider>
    </div>
  );
}
