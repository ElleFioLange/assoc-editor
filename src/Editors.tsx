/* eslint-disable no-constant-condition */
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
  message,
  Upload,
  UploadProps,
  InputNumber,
} from "antd";
import Map from "./Map";
import {
  EditOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  UpOutlined,
  DownOutlined,
  ClockCircleOutlined,
  ClockCircleFilled,
  BorderInnerOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import { mapEventHandler } from "google-maps-react";

const MAP_DIM = 450;

const { TextArea } = Input;
const { Title } = Typography;

function ContentEditor({
  data,
  onFinish,
  filePath,
}: {
  data: string | TContentForm;
  onFinish: () => void;
  filePath: string;
}) {
  const [form] = Form.useForm();
  console.log(data);

  const [type, setType] = useState<ContentType>(
    typeof data === "string" ? "image" : data.type
  );

  function updateType(type: ContentType) {
    setType(type);
    form.setFieldsValue({ type });
  }

  const getDims: UploadProps["customRequest"] = (e) => {
    const fr = new FileReader;
    fr.onload = function() { // file is loaded
        const img = new Image;
        img.onload = function() {
          form.setFieldsValue({ w: img.width, h: img.height });
        };
        img.src = fr.result as string; // is the data URL because called with readAsDataURL
    };
    fr.readAsDataURL(e.file as Blob);
  }

  const onMapClick: mapEventHandler = (_, __, event) => {
    form.setFieldsValue({ lat: event.latLng.lat(), lon: event.latLng.lng() });
  };

  const onMapRightClick: mapEventHandler = (_, __, event) => {
    const lat = form.getFieldValue("lat");
    const lon = form.getFieldValue("lon");
    if (lat && lon) {
      const dist = Math.sqrt(
        (lat - event.latLng.lat()) ** 2 + (lon - event.latLng.lng()) ** 2
      );
      form.setFieldsValue({ viewDelta: dist });
    }
  };

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
      <Form.Item
        name="id"
        initialValue={typeof data === "string" ? true : false}
        hidden
      />
      <Space style={{ marginBottom: 16, display: "block" }}>
        Id: {typeof data === "string" ? data : data.id}
      </Space>
      <Select
        style={{ minWidth: 75, marginBottom: 16 }}
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
        <>
          <Form.Item
            hidden
            name="path"
            initialValue={`${filePath}/${
              typeof data === "string" ? data : data.id
            }.jpeg`}
          />
          <Space style={{ marginBottom: 16 }}>
            Path:{" "}
            {`${filePath}/${typeof data === "string" ? data : data.id}.jpeg`}
          </Space>
          <Space align="baseline" style={{ marginBottom: 16 }}>
            Width:{" "}
            <Form.Item name="w" shouldUpdate={(prevValues, curValues) =>prevValues.w !== curValues.w}
          >
            <Input disabled />
          </Form.Item>
          </Space>
          <Space align="baseline" style={{ marginBottom: 16 }}>
            {" "}Height:{" "}
            <Form.Item name="h" shouldUpdate={(prevValues, curValues) =>prevValues.h !== curValues.h}
          >
            <Input disabled />
          </Form.Item>
          </Space>
          <Upload.Dragger customRequest={getDims} showUploadList={false} beforeUpload={(file) => {
            if (file.type !== "image/jpeg") {
              message.error("WRONG FILE TYPE BUDDY STOP TRYING ME HAS TO BE A JPEG BC UR SO LAZY");
              return false;
            }
            return true;
          }}>
            <Button icon={<BorderInnerOutlined />} style={{ marginBottom: 16 }}>Get Dimensions</Button>
          </Upload.Dragger>
        </>
      )}
      {type === "video" && (
        <>
          <Form.Item
            hidden
            name="posterPath"
            initialValue={`${filePath}/${
              typeof data === "string" ? data : data.id
            }.jpeg`}
          />
          <Space style={{ marginBottom: 16 }}>
            Poster Path:{" "}
            {`${filePath}/${typeof data === "string" ? data : data.id}.jpeg`}
          </Space>
          <Form.Item
            hidden
            name="videoPath"
            initialValue={`${filePath}/${
              typeof data === "string" ? data : data.id
            }.jpeg`}
          />
          <Space style={{ marginBottom: 16 }}>
            Video Path:{" "}
            {`${filePath}/${typeof data === "string" ? data : data.id}.mp4`}
          </Space>
          <Form.Item name="w" hidden />
          <Space style={{ marginBottom: 16 }}>
            Width: {form.getFieldValue("w")}
          </Space>
          <Form.Item name="h" hidden />
          <Space style={{ marginBottom: 16 }}>
            Height: {form.getFieldValue("h")}
          </Space>
          {/* <Button icon={<BorderInnerOutlined />} onClick={getDims}>Get Dimensions</Button> */}
        </>
      )}
      {type === "map" && (
        <>
          <div style={{ height: MAP_DIM, width: MAP_DIM }}>
            <Map
              mapDim={MAP_DIM}
              onClick={onMapClick}
              onRightclick={onMapRightClick}
            />
          </div>
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
  filePath,
  onFinish,
  submit,
}: {
  data: { id: string; parentId: string } | TItemForm;
  filePath: string;
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
            console.log(content);
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
                parentId: data.parentId,
              } as TItemForm;
              if ("description" in data) submit(item, data);
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
                      icon={
                        content[index].changed ? (
                          <ClockCircleFilled />
                        ) : (
                          <ClockCircleOutlined />
                        )
                      }
                      onClick={() => {
                        if ("connections" in data) {
                          const newContent = [...content];
                          newContent[index].changed =
                            !newContent[index].changed;
                          setFieldsValue({ content: newContent });
                        }
                      }}
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
            filePath={`${filePath}/${data.parentId}/${data.id}`}
            onFinish={() => setContentEditor(undefined)}
          />
        </Modal>
      )}
    </Form.Provider>
  );
}

export function LocationEditor({
  data,
  filePath,
  submit,
}: {
  data: string | TLocationForm;
  filePath: string;
  submit: (update: TLocationForm, prevData: string | TLocationForm) => void;
}): JSX.Element {
  const [form] = Form.useForm();

  const [itemEditor, setItemEditor] =
    useState<{ id: string; parentId: string } | TItemForm>();

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
            onClick={() =>
              setItemEditor({
                id: uuid(),
                parentId: typeof data === "string" ? data : data.id,
              })
            }
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
              filePath={filePath}
              onFinish={() => setItemEditor(undefined)}
            />
          </Modal>
        )}
      </Form.Provider>
    </div>
  );
}
