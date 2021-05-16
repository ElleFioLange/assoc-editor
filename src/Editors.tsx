import React, { useState } from "react";
import { Form, Input, Button, Space, Select, Upload, Image } from "antd";
import { MinusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";

const { TextArea } = Input;

export function LocationEditor({
  location,
}: {
  location: LocationData;
}): JSX.Element {
  const [form] = Form.useForm();

  return (
    <div style={{ width: 450 }}>
      <Space style={{ marginBottom: 16 }}>Id: {location.id}</Space>
      <Form name="location-editor" form={form}>
        <Form.Item label="Name" name="name" initialValue={location.name}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          initialValue={location.description}
        >
          <TextArea rows={6} />
        </Form.Item>
        <Form.Item label="Items">
          {/* {Object.values(location.items).map((item) => (
            <Space
              key={item.id}
              style={{ display: "flex", marginBottom: 8 }}
              align="baseline"
            >
                <Button
                  icon={<MinusCircleOutlined />}
                  onClick={() => remove(field.name)}
                />
              )}
            </Space>
          ))} */}
          <Form.List name="new-items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space
                    key={field.key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    {field.name > Object.values(location.items).length && (
                      <Button
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    )}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()}>
                  Add Item
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
      {() => {
        console.log(form.submit());
        return null;
      }}
    </div>
  );
}

export function ItemEditor({ item }: { item: ItemData }): JSX.Element {
  const [itemTypes, setItemTypes] = useState<Record<string, string>>({});

  return (
    <>
      <Space style={{ marginBottom: 16 }}>Id: {item.id}</Space>
      <Form name="item-editor">
        <Form.Item label="Name" name="name" initialValue={item.name}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          initialValue={item.description}
        >
          <TextArea rows={6} />
        </Form.Item>
        <Form.Item label="Content">
          {Object.values(item.content).map((content, index) => {
            <Space
              key={`key-${index}`}
              style={{ display: "flex", marginBottom: 8 }}
              align="baseline"
            >
              {content.image && <Image src={content.image.uri} />}
              {/* {itemTypes[field.name] === "video" && (
                <>
                  <Form.Item name="poster">
                    <Upload>
                      <Button icon={<UploadOutlined />}>Upload poster</Button>
                    </Upload>
                  </Form.Item>
                  <br />
                  <Form.Item name="video">
                    <Upload>
                      <Button icon={<UploadOutlined />}>Upload video</Button>
                    </Upload>
                  </Form.Item>
                </>
              )}
              {itemTypes[field.name] === "map" && (
                <>
                  <Form.Item name="maplat">
                    <Input placeholder="latitude" />
                  </Form.Item>
                  <Form.Item name="maplon">
                    <Input placeholder="longitude" />
                  </Form.Item>
                </>
              )} */}
            </Space>;
          })}
          <Form.List name="new-content">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space
                    key={field.key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item {...field}>
                      <Select
                        options={[
                          { label: "Image", value: "image" },
                          { label: "Video", value: "video" },
                          { label: "Map", value: "map" },
                        ]}
                        style={{ minWidth: 75 }}
                        defaultValue="image"
                        onChange={(value) =>
                          setItemTypes((prev) => ({
                            ...prev,
                            [field.name]: value,
                          }))
                        }
                      />
                      {!itemTypes[field.name] &&
                        setItemTypes((prev) => ({
                          ...prev,
                          [field.name]: "image",
                        }))}
                    </Form.Item>
                    {itemTypes[field.name] === "image" && (
                      <Form.Item name="image">
                        <Upload>
                          <Button icon={<UploadOutlined />}>
                            Upload image
                          </Button>
                        </Upload>
                      </Form.Item>
                    )}
                    {itemTypes[field.name] === "video" && (
                      <>
                        <Form.Item
                          style={{ display: "flex", flexWrap: "wrap" }}
                          name="poster"
                        >
                          <Upload>
                            <Button icon={<UploadOutlined />}>
                              Upload poster
                            </Button>
                          </Upload>
                        </Form.Item>
                        <br />
                        <Form.Item name="video">
                          <Upload>
                            <Button icon={<UploadOutlined />}>
                              Upload video
                            </Button>
                          </Upload>
                        </Form.Item>
                      </>
                    )}
                    {itemTypes[field.name] === "map" && (
                      <>
                        <Form.Item name="maplat">
                          <Input placeholder="latitude" />
                        </Form.Item>
                        <Form.Item name="maplon">
                          <Input placeholder="longitude" />
                        </Form.Item>
                      </>
                    )}
                    <Button
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(field.name)}
                    />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()}>
                  Add Content
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </>
  );
}
