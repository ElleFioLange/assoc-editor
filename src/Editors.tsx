import React, { useState, useRef, useEffect } from "react";
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

const useResetFormOnCloseModal = ({
  form,
  visible,
}: {
  form: FormInstance;
  visible: boolean;
}) => {
  const prevVisibleRef = useRef<boolean>();
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);
  const prevVisible = prevVisibleRef.current;

  useEffect(() => {
    if (!visible && prevVisible) {
      form.resetFields();
    }
  }, [visible]);
};

// export function LocationEditor({
//   location,
// }: {
//   location: LocationData;
// }): JSX.Element {
//   const [form] = Form.useForm();

//   return (
//     <div style={{ width: 450 }}>
//       <Space style={{ marginBottom: 16 }}>Id: {location.id}</Space>
//       <Form name="location-editor" form={form}>
//         <Form.Item label="Name" name="name" initialValue={location.name}>
//           <Input />
//         </Form.Item>
//         <Form.Item
//           label="Description"
//           name="description"
//           initialValue={location.description}
//         >
//           <TextArea rows={6} />
//         </Form.Item>
//         <Form.Item label="Items">
//           {/* {Object.values(location.items).map((item) => (
//             <Space
//               key={item.id}
//               style={{ display: "flex", marginBottom: 8 }}
//               align="baseline"
//             >
//                 <Button
//                   icon={<MinusCircleOutlined />}
//                   onClick={() => remove(field.name)}
//                 />
//               )}
//             </Space>
//           ))} */}
//           <Form.List name="new-items">
//             {(fields, { add, remove }) => (
//               <>
//                 {fields.map((field) => (
//                   <Space
//                     key={field.key}
//                     style={{ display: "flex", marginBottom: 8 }}
//                     align="baseline"
//                   >
//                     {field.name > Object.values(location.items).length && (
//                       <Button
//                         icon={<MinusCircleOutlined />}
//                         onClick={() => remove(field.name)}
//                       />
//                     )}
//                   </Space>
//                 ))}
//                 <Button type="dashed" onClick={() => add()}>
//                   Add Item
//                 </Button>
//               </>
//             )}
//           </Form.List>
//         </Form.Item>
//       </Form>
//       {() => {
//         console.log(form.submit());
//         return null;
//       }}
//     </div>
//   );
// }

// export function ItemEditor({
//   item,
//   contentPath,
// }: {
//   item: ItemData;
//   contentPath: string;
// }): JSX.Element {
//   const [itemTypes, setItemTypes] = useState<Record<string, string>>({});

//   function processData(data: ItemData): ItemFormData {
//     const content: ContentFormData[] = data.content.map((content, index) => {
//       switch (content.type) {
//         case "image":
//           return {
//             type: "image",
//             path: `${contentPath}/${data.parentId}/${data.id}/${index}`,
//           };
//         case "video":
//           return {
//             type: "video",
//             posterPath: `${contentPath}/${data.parentId}/${data.id}/poster-${index}`,
//             videoPath: `${contentPath}/${data.parentId}/${data.id}/video-${index}`,
//           };
//         case "map":
//           return content;
//       }
//     });

//     const connections: ConnectionFormData[] = Object.values(data.connections).map((connection) => ({
//       isSource: connection.isSource,
//       partnerId: connection.isSource ? connection.sinkId : connection.sourceId,
//       connectionId: connection.id,
//       key: connection.key,
//     }));

//     return {

//     }
//   }

//   return (
//     <>
//       <Space style={{ marginBottom: 16 }}>Id: {item.id}</Space>
//       <Form name="item-editor">
//         <Form.Item label="Name" name="name" initialValue={item.name}>
//           <Input />
//         </Form.Item>
//         <Form.Item
//           label="Description"
//           name="description"
//           initialValue={item.description}
//         >
//           <TextArea rows={6} />
//         </Form.Item>
//         <Form.Item label="Content">
//           {Object.values(item.content).map((content, index) => {
//             <Space
//               key={`key-${index}`}
//               style={{ display: "flex", marginBottom: 8 }}
//               align="baseline"
//             >
//               {content.image && <Image src={content.image.uri} />}
//               {/* {itemTypes[field.name] === "video" && (
//                 <>
//                   <Form.Item name="poster">
//                     <Upload>
//                       <Button icon={<UploadOutlined />}>Upload poster</Button>
//                     </Upload>
//                   </Form.Item>
//                   <br />
//                   <Form.Item name="video">
//                     <Upload>
//                       <Button icon={<UploadOutlined />}>Upload video</Button>
//                     </Upload>
//                   </Form.Item>
//                 </>
//               )}
//               {itemTypes[field.name] === "map" && (
//                 <>
//                   <Form.Item name="maplat">
//                     <Input placeholder="latitude" />
//                   </Form.Item>
//                   <Form.Item name="maplon">
//                     <Input placeholder="longitude" />
//                   </Form.Item>
//                 </>
//               )} */}
//             </Space>;
//           })}
//           <Form.List name="new-content">
//             {(fields, { add, remove }) => (
//               <>
//                 {fields.map((field) => (
//                   <Space
//                     key={field.key}
//                     style={{ display: "flex", marginBottom: 8 }}
//                     align="baseline"
//                   >
//                     <Form.Item {...field}>
//                       <Select
//                         options={[
//                           { label: "Image", value: "image" },
//                           { label: "Video", value: "video" },
//                           { label: "Map", value: "map" },
//                         ]}
//                         style={{ minWidth: 75 }}
//                         defaultValue="image"
//                         onChange={(value) =>
//                           setItemTypes((prev) => ({
//                             ...prev,
//                             [field.name]: value,
//                           }))
//                         }
//                       />
//                       {!itemTypes[field.name] &&
//                         setItemTypes((prev) => ({
//                           ...prev,
//                           [field.name]: "image",
//                         }))}
//                     </Form.Item>
//                     {itemTypes[field.name] === "image" && (
//                       <Form.Item name="image">
//                         <Upload>
//                           <Button icon={<UploadOutlined />}>
//                             Upload image
//                           </Button>
//                         </Upload>
//                       </Form.Item>
//                     )}
//                     {itemTypes[field.name] === "video" && (
//                       <>
//                         <Form.Item
//                           style={{ display: "flex", flexWrap: "wrap" }}
//                           name="poster"
//                         >
//                           <Upload>
//                             <Button icon={<UploadOutlined />}>
//                               Upload poster
//                             </Button>
//                           </Upload>
//                         </Form.Item>
//                         <br />
//                         <Form.Item name="video">
//                           <Upload>
//                             <Button icon={<UploadOutlined />}>
//                               Upload video
//                             </Button>
//                           </Upload>
//                         </Form.Item>
//                       </>
//                     )}
//                     {itemTypes[field.name] === "map" && (
//                       <>
//                         <Form.Item name="maplat">
//                           <Input placeholder="latitude" />
//                         </Form.Item>
//                         <Form.Item name="maplon">
//                           <Input placeholder="longitude" />
//                         </Form.Item>
//                       </>
//                     )}
//                     <Button
//                       icon={<MinusCircleOutlined />}
//                       onClick={() => remove(field.name)}
//                     />
//                   </Space>
//                 ))}
//                 <Button type="dashed" onClick={() => add()}>
//                   Add Content
//                 </Button>
//               </>
//             )}
//           </Form.List>
//         </Form.Item>
//       </Form>
//     </>
//   );
// }

function NewItem({
  open,
  onCancel,
}: {
  open: { visible: boolean; item?: ItemFormData };
  onCancel: () => void;
}) {
  const [form] = Form.useForm();

  const onOk = () => {
    form.submit();
  };

  return (
    <Modal
      title="New Item"
      visible={open.visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="vertical"
        name="itemForm"
        initialValues={open.item}
      >
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
      </Form>
    </Modal>
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

  const [itemOpen, setItemOpen] = useState<{
    visible: boolean;
    item?: ItemFormData;
  }>({ visible: false });

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
    <div style={{ margin: 8 }}>
      <Title level={3}>Location</Title>
      <Space style={{ marginBottom: 16 }}>Id: {id}</Space>
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          if (name === "itemForm") {
            const { locationForm, itemForm } = forms;
            const items = locationForm.getFieldValue("items") || [];
            locationForm.setFieldsValue({ items: [...items, values] });
            setItemOpen({ visible: false });
            itemForm.resetFields();
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
                          setItemOpen({ visible: true, item });
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
            onClick={() => setItemOpen({ visible: true })}
          >
            Add Item
          </Button>
          <Form.Item>
            <Button block type="primary" onClick={submitLocation}>
              Submit
            </Button>
          </Form.Item>
        </Form>

        <NewItem
          open={itemOpen}
          onCancel={() => setItemOpen({ visible: false })}
        />
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
