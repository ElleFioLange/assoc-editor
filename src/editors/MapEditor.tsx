import React, { useState, useRef, useEffect } from "react";
const fs = window.require("fs");
const ffprobe = window.require("ffprobe");
const ffprobeStatic = window.require("ffprobe-static");
const { shell } = window.require("electron");
import { cloneDeep } from "lodash";
import {
  Layout,
  Menu,
  Space,
  message,
  Input,
  Typography,
  Form,
  Button,
  Select,
  Checkbox,
  Modal,
  Upload,
  InputNumber,
} from "antd";
import {
  EditOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  UpOutlined,
  DownOutlined,
  ClockCircleOutlined,
  ClockCircleFilled,
  InboxOutlined,
  FolderOpenOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import { v4 as uuid } from "uuid";
import CoordViewer from "./CoordViewer";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import useWindowDims from "../useWindowDims";
import { RcFile } from "antd/lib/upload";
import { mapEventHandler } from "google-maps-react";
import indexOfId from "../indexOfId";
import Item from "antd/lib/list/Item";

const { Sider, Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

export default function GraphEditor({
  localMap,
  setLocalMap,
  filePath,
}: {
  localMap: TMap;
  setLocalMap: React.Dispatch<React.SetStateAction<TMap | undefined>>;
  filePath: string;
}): JSX.Element {
  // ------------------
  // const [networkMap, setNetworkMap] = useState<TMap>({
  //   locations: {},
  //   items: {},
  //   connections: {},
  // });
  // const [localMap, setLocalMap] = useState<TMap>({
  //   locations: {},
  //   items: {},
  //   connections: {},
  // });
  // ------------------
  const [selected, setSelected] = useState<TSelection>({
    type: "location",
    id: "",
  });
  // ------------------
  const windowDims = useWindowDims();
  // ------------------

  // Process data for map visualization
  function processMap(map: TMap | undefined):
    | {
        nodes: TNode[];
        links: TLink[];
      }
    | undefined {
    if (map === undefined) return undefined;
    const { locations, items, connections } = map;
    const nodes: TNode[] = [];
    const links: TLink[] = [];
    Object.values(locations).forEach((location) =>
      nodes.push({
        id: location.id,
        name: location.name,
        group: location.id,
        location: true,
      })
    );
    Object.values(items).forEach((item) => {
      nodes.push({ id: item.id, name: item.name, group: item.locationId });
      links.push({
        source: item.locationId,
        target: item.id,
        group: item.locationId,
      });
      console.log(item.name);
      console.log(item.locationId);
    });
    Object.values(connections).forEach((connection) =>
      links.push({
        source: connection.sourceId,
        target: connection.targetId,
        group: items[connection.sourceId].locationId,
      })
    );

    return { nodes, links };
  }

  function addConnection(connection: TConnectionForm, mapState: TMap) {
    const newMap = cloneDeep(mapState);
    const partner = newMap.items[connection.partnerId];
    const index = indexOfId(partner.connections, connection.id);
    if (index === undefined) {
      partner.connections.push({
        ...connection,
        isSource: !connection.isSource,
      });
    } else {
      partner.connections[index] = {
        ...connection,
        isSource: !connection.isSource,
      };
    }
    newMap.connections[connection.id] = {
      ...connection,
      sourceId: connection.isSource ? connection.ownerId : connection.partnerId,
      targetId: connection.isSource ? connection.partnerId : connection.ownerId,
    };
    return newMap;
  }

  function deleteConnection(connection: TLocalConnection, mapState: TMap) {
    const newMap = cloneDeep(mapState);
    const source = newMap.items[connection.sourceId];
    const target = newMap.items[connection.targetId];
    source.connections.splice(indexOfId(source.connections, connection.id)!, 1);
    target.connections.splice(indexOfId(target.connections, connection.id)!, 1);
    delete newMap.connections[connection.id];
    return newMap;
  }

  function addItem(item: TItemForm, mapState: TMap) {
    let newMap = { ...mapState };
    // If item existed previously then remove any deleted connections
    if (newMap.items[item.id]) {
      mapState.items[item.id].connections.forEach((connection) => {
        if (indexOfId(item.connections, connection.id) === undefined)
          newMap = deleteConnection(
            mapState.connections[connection.id],
            newMap
          );
      });
    }
    console.log("sakjdflas");
    newMap.items[item.id] = {
      ...item,
      connections: item.connections.map(({ id, isSource }) => ({
        id,
        isSource,
      })),
    };
    item.connections.forEach((connection) => {
      newMap = addConnection(connection, newMap);
    });
    console.log("uioaewea");
    return newMap;
  }

  function deleteItem(item: TLocalItem, mapState: TMap) {
    let newMap = { ...mapState };
    item.connections.forEach((connectionInfo) => {
      newMap = deleteConnection(
        mapState.connections[connectionInfo.id],
        newMap
      );
    });
    newMap.locations[item.locationId].items.splice(
      newMap.locations[item.locationId].items.indexOf(item.id),
      1
    );
    delete newMap.items[item.id];
    return newMap;
  }

  function addLocation(location: TLocationForm, mapState: TMap) {
    let newMap = cloneDeep(mapState);
    // If location existed previously then remove any deleted items
    if (newMap.locations[location.id]) {
      mapState.locations[location.id].items.forEach((itemId) => {
        if (indexOfId(location.items, itemId) === undefined)
          newMap = deleteItem(mapState.items[itemId], newMap);
      });
    }
    newMap.locations[location.id] = {
      ...location,
      items: location.items.map(({ id }) => id),
    };
    location.items.forEach((item) => {
      newMap = addItem(item, newMap);
    });
    return newMap;
  }

  function deleteLocation(location: TLocalLocation, mapState: TMap) {
    let newMap = cloneDeep(mapState);
    location.items.forEach((itemId) => {
      newMap = deleteItem(mapState.items[itemId], newMap);
    });
    delete newMap.locations[location.id];
    return newMap;
  }

  function ConnectionForm({
    data,
    onFinish,
  }: {
    data: { id: string; ownerId: string } | TConnectionForm;
    onFinish?: () => void;
  }) {
    const [form] = Form.useForm();

    // const formData =
    //   typeof data === "string"
    //     ? {
    //         id: data,
    //       }
    //     : {
    //         ...data,
    //         partnerId: data.isSource
    //           ? localMap.connections[data.id].targetId
    //           : localMap.connections[data.id].sourceId,
    //       };

    return (
      <Form
        form={form}
        layout="vertical"
        name="connectionForm"
        initialValues={data}
      >
        <Form.Item name="id" hidden />
        <Form.Item name="ownerId" hidden />
        <Space style={{ marginBottom: 16 }}>Id: {data.id}</Space>
        <Form.Item
          name="isSource"
          rules={[{ required: true }]}
          valuePropName="checked"
          initialValue={false}
        >
          <Checkbox>Source?</Checkbox>
        </Form.Item>
        <Form.Item
          label="Partner"
          name="partnerId"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="partner"
            showSearch
            options={
              localMap
                ? Object.values(localMap.items)
                    .filter((item) => item.id !== data.ownerId)
                    .map((item) => ({
                    label: `${item.name} - ${item.locationName} - ${item.id}`,
                    value: item.id,
                  }))
                : undefined
            }
            filterOption={(input, option) => {
              if (option?.label) {
                const identifiers = (option.label as string).split(" - ");
                const normalized = input.toLowerCase();
                return (
                  identifiers[0].toLowerCase().indexOf(normalized) >= 0 ||
                  identifiers[1].toLowerCase().indexOf(normalized) >= 0 ||
                  identifiers[2].toLowerCase().indexOf(normalized) >= 0
                );
              }
              return false;
            }}
          />
        </Form.Item>
        <Form.Item name="key" label="Key" rules={[{ required: true }]}>
          <Input placeholder="key" />
        </Form.Item>
        <Button
          type="primary"
          block
          onClick={() => {
            form.validateFields().then(() => {
              form.submit();
              if (onFinish) onFinish();
            });
          }}
          style={{ marginBottom: 16 }}
        >
          Submit
        </Button>
      </Form>
    );
  }

  function ContentForm({
    data,
    onFinish,
  }: {
    data: string | TLocalContent;
    onFinish: () => void;
  }) {
    const [form] = Form.useForm();

    const [type, setType] = useState<ContentType>(
      typeof data === "string" ? "image" : data.type
    );

    const path = `${filePath}/${typeof data === "string" ? data : data.id}`;

    function updateType(type: ContentType) {
      setType(type);
      form.setFieldsValue({ type });
    }

    const uploadFile = async (
      file: string | Blob | RcFile,
      uploadType: "image" | "poster" | "video"
    ) => {
      fs.mkdirSync(filePath, { recursive: true });
      const fr = new FileReader();

      if (uploadType === "image" || uploadType === "poster") {
        fs.writeFileSync(
          `${path}.jpeg`,
          Buffer.from(await (file as Blob).arrayBuffer())
        );
        fr.onload = function () {
          // file is loaded
          const img = new Image();
          img.onload = function () {
            form.setFieldsValue(
              uploadType === "image"
                ? { w: img.width, h: img.height }
                : { posterW: img.width, posterH: img.height }
            );
          };

          img.onerror = (e) => console.error(e);

          img.src = fr.result as string; // is the data URL because called with readAsDataURL
        };
      } else {
        fs.writeFileSync(
          `${path}.mp4`,
          Buffer.from(await (file as Blob).arrayBuffer())
        );
        fr.onload = async function () {
          const info = await ffprobe(`${path}.mp4`, {
            path: ffprobeStatic.path,
          });
          const { width, height } = info.streams[0];
          form.setFieldsValue({ videoW: width, videoH: height });
        };
      }
      fr.readAsDataURL(file as Blob);
    };

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
        initialValues={
          typeof data === "string" ? { id: data, changed: true } : data
        }
      >
        <Form.Item name="id" hidden />
        <Form.Item name="changed" hidden />
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
            <Space style={{ marginBottom: 16, display: "block" }}>
              Path: {`${path}.jpeg`}
            </Space>
            Width:{" "}
            <Form.Item name="w" shouldUpdate={(prev, cur) => prev.w !== cur.w}>
              <Input disabled />
            </Form.Item>
            Height:{" "}
            <Form.Item name="h" shouldUpdate={(prev, cur) => prev.h !== cur.h}>
              <Input disabled />
            </Form.Item>
            <Dragger
              multiple={false}
              showUploadList={false}
              customRequest={({ file }) => uploadFile(file, "image")}
              beforeUpload={(file) => file.type === "image/jpeg"}
              style={{ maxWidth: 480, height: 240, marginBottom: 16 }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
            </Dragger>
          </>
        )}
        {type === "video" && (
          <>
            <Space style={{ marginBottom: 16 }}>
              Poster Path:{" "}
              {`${filePath}/${typeof data === "string" ? data : data.id}.jpeg`}
            </Space>
            Width:{" "}
            <Form.Item
              name="posterW"
              shouldUpdate={(prev, cur) => prev.posterW !== cur.posterW}
            >
              <Input disabled />
            </Form.Item>
            Height:{" "}
            <Form.Item
              name="posterH"
              shouldUpdate={(prev, cur) => prev.posterH !== cur.posterH}
            >
              <Input disabled />
            </Form.Item>
            <Dragger
              multiple={false}
              showUploadList={false}
              customRequest={({ file }) => uploadFile(file, "poster")}
              beforeUpload={(file) => file.type === "image/jpeg"}
              style={{ maxWidth: 480, height: 240, marginBottom: 16 }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
            </Dragger>
            <Space style={{ marginBottom: 16 }}>
              Video Path:{" "}
              {`${filePath}/${typeof data === "string" ? data : data.id}.mp4`}
            </Space>
            Width:{" "}
            <Form.Item
              name="videoW"
              shouldUpdate={(prev, cur) => prev.posterH !== cur.posterH}
            >
              <Input disabled />
            </Form.Item>
            Height:{" "}
            <Form.Item
              name="videoH"
              shouldUpdate={(prev, cur) => prev.videoH !== cur.videoH}
            >
              <Input disabled />
            </Form.Item>
            <Dragger
              multiple={false}
              showUploadList={false}
              customRequest={({ file }) => uploadFile(file, "video")}
              beforeUpload={(file) => file.type === "video/mp4"}
              style={{ maxWidth: 480, height: 240, marginBottom: 16 }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
            </Dragger>
          </>
        )}
        {type === "map" && (
          <>
            <div style={{ height: 450, width: 450 }}>
              <CoordViewer
                mapDim={450}
                onClick={onMapClick}
                onRightclick={onMapRightClick}
                initialCenter={
                  typeof data === "string"
                    ? {
                        lat: 35.10955714631318,
                        lng: -106.61210092788741,
                      }
                    : data.type === "map"
                    ? {
                        lat: data.latitude,
                        lng: data.longitude,
                      }
                    : {
                        lat: 35.10955714631318,
                        lng: -106.61210092788741,
                      }
                }
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
            form.validateFields().then(() => {
              form.submit();
              onFinish();
            });
          }}
        >
          Submit
        </Button>
      </Form>
    );
  }

  function ItemForm({
    data,
    onFinish,
  }: {
    data: { id: string; locationId: string } | TItemForm;
    onFinish?: () => void;
  }): JSX.Element {
    const [form] = Form.useForm();

    const [connectionForm, setConnectionForm] =
      useState<{ id: string; ownerId: string } | TConnectionForm>();
    const [contentForm, setContentForm] = useState<string | TLocalContent>();

    const formData =
      "description" in data
        ? {
            ...data,
            connections: data.connections.map((c) => {
              const connection = localMap.connections[c.id];
              return {
                ...connection,
                ...c,
              };
            }),
          }
        : { ...data };

    return (
      <div style={{ margin: 8, overflow: "auto", paddingBottom: 200 }}>
        {!onFinish && <Title level={3}>Edit Item</Title>}
        <Form.Provider
          onFormFinish={(name, { values, forms }) => {
            switch (name) {
              case "contentForm": {
                const { itemForm } = forms;
                const content = itemForm.getFieldValue("content") || [];
                const index = indexOfId(content, values.id);
                if (index === undefined)
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
              case "connectionForm": {
                const { itemForm } = forms;
                const connections = itemForm.getFieldValue("connections") || [];
                const index = indexOfId(connections, values.id);
                if (index === undefined)
                  itemForm.setFieldsValue({
                    connections: [...connections, values],
                  });
                else {
                  const newConnections = [...connections];
                  newConnections[index] = values;
                  itemForm.setFieldsValue({ connections: newConnections });
                }
                break;
              }
              case "itemForm": {
                if (!onFinish) {
                  const { itemForm } = forms;
                  const connections =
                    (itemForm.getFieldValue(
                      "connections"
                    ) as TConnectionForm[]) || [];
                  const content = itemForm.getFieldValue("content") || [];
                  const item = {
                    ...values,
                    connections,
                    content,
                  } as unknown as TItemForm;
                  console.log(localMap);
                  const newMap = addItem(item, localMap);
                  console.log(newMap);
                  setLocalMap(newMap);
                }
              }
            }
          }}
        >
          <Form
            form={form}
            layout="vertical"
            name="itemForm"
            initialValues={formData}
          >
            <Form.Item name="id" hidden />
            <Form.Item name="locationId" hidden />
            <Form.Item name="locationName" hidden />
            <Space style={{ marginBottom: 16 }}>Id: {formData.id}</Space>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="link" label="Link">
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true }]}
            >
              <TextArea rows={6} />
            </Form.Item>
            <Form.Item
              name="aiPrompt"
              label="AI Prompt"
              rules={[{ required: true }]}
            >
              <TextArea rows={6} />
            </Form.Item>
            <Form.Item
              label="Connections"
              shouldUpdate={(prevValues, curValues) =>
                prevValues.connections !== curValues.connections
              }
            >
              {({ getFieldValue, setFieldsValue }) => {
                const connections: TConnectionForm[] =
                  getFieldValue("connections") || [];
                return connections.length ? (
                  <ul>
                    {connections.map((connection, index) => (
                      <li key={index} style={{ marginBottom: 8 }}>
                        {localMap.items[connection.partnerId].name}
                        <Button
                          style={{ marginLeft: 12 }}
                          icon={<EditOutlined />}
                          onClick={() => setConnectionForm(connection)}
                        />
                        <Button
                          style={{ marginLeft: 12 }}
                          icon={<MinusCircleOutlined />}
                          onClick={() => {
                            const newConnections = [...connections];
                            newConnections.splice(index, 1);
                            setFieldsValue({ connections: newConnections });
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
                setConnectionForm({ id: uuid(), ownerId: formData.id })
              }
            >
              Add Connection
            </Button>
            <Form.Item
              label="Content"
              shouldUpdate={(prevValues, curValues) =>
                prevValues.content !== curValues.content
              }
            >
              {({ getFieldValue, setFieldsValue }) => {
                const content: TLocalContent[] = getFieldValue("content") || [];
                return content.length ? (
                  <ul>
                    {content.map((contentItem, index) => (
                      <li key={index} style={{ marginBottom: 8 }}>
                        {contentItem.name} - {contentItem.type}
                        <Button
                          style={{ marginLeft: 12 }}
                          icon={<EditOutlined />}
                          onClick={() => setContentForm(contentItem)}
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
              onClick={() => setContentForm(uuid())}
            >
              Add Content
            </Button>
            <Button
              style={{ marginBottom: 12 }}
              type="default"
              icon={<FolderOpenOutlined />}
              onClick={() =>
                shell.openPath(`${filePath}/${data.locationId}/${data.id}`)
              }
            >
              Open Content Folder
            </Button>
            <Button
              type="primary"
              block
              onClick={() => {
                form.validateFields().then(() => {
                  form.submit();
                  if (onFinish) onFinish();
                });
              }}
              style={{ marginBottom: 16 }}
            >
              Submit
            </Button>
          </Form>
          {connectionForm && (
            <Modal
              title="New Connection"
              visible={true}
              width={"auto"}
              style={{ top: 12 }}
              onCancel={() => setConnectionForm(undefined)}
            >
              <ConnectionForm
                data={connectionForm}
                onFinish={() => setConnectionForm(undefined)}
              />
            </Modal>
          )}
          {contentForm && (
            <Modal
              title="New Content"
              visible={true}
              width={"auto"}
              style={{ top: 12 }}
              onCancel={() => setContentForm(undefined)}
            >
              <ContentForm
                data={contentForm}
                onFinish={() => setContentForm(undefined)}
              />
            </Modal>
          )}
        </Form.Provider>
      </div>
    );
  }

  function LocationForm({
    data,
  }: {
    data: string | TLocationForm;
  }): JSX.Element {
    const [form] = Form.useForm();

    const [itemForm, setItemForm] =
      useState<{ id: string; locationId: string } | TItemForm>();

    const formData = typeof data === "string" ? { id: data } : data;

    return (
      <div style={{ margin: 8, overflow: "auto", paddingBottom: 200 }}>
        <Title level={3}>
          {typeof data === "string" ? "New" : "Edit"} Location
        </Title>
        <Form.Provider
          onFormFinish={(name, { values, forms }) => {
            switch (name) {
              case "locationForm": {
                const { locationForm } = forms;
                const items =
                  (locationForm.getFieldValue("items") as TItemForm[]) || [];
                items.forEach((item) => {
                  item.locationName = locationForm.getFieldValue("name");
                });
                const location = {
                  ...values,
                  items,
                } as unknown as TLocationForm;
                console.log(localMap);
                const newMap = addLocation(location, localMap);
                console.log(newMap);
                setLocalMap(newMap);
                break;
              }
              case "itemForm": {
                const { locationForm, itemForm } = forms;
                const items = locationForm.getFieldValue("items") || [];
                const connections = itemForm.getFieldValue("connections") || [];
                const content = itemForm.getFieldValue("content") || [];
                const index = indexOfId(items, values.id);
                if (index === undefined) {
                  locationForm.setFieldsValue({
                    items: [
                      ...items,
                      {
                        ...values,
                        connections,
                        content,
                      },
                    ],
                  });
                } else {
                  const newItems = [...items];
                  newItems[index] = {
                    ...values,
                    connections,
                    content,
                  };
                  locationForm.setFieldsValue({ items: newItems });
                }
              }
            }
          }}
        >
          <Form name="locationForm" form={form} initialValues={formData}>
            <Form.Item name="id" hidden />
            <Space style={{ marginBottom: 16 }}>Id: {formData.id}</Space>
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
                          onClick={() => setItemForm(item)}
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
                setItemForm({
                  id: uuid(),
                  locationId: formData.id,
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
            {typeof data !== "string" && (
              <Button
                type="primary"
                danger
                block
                onClick={() => {
                  const newMap = deleteLocation(
                    localMap.locations[data.id],
                    localMap
                  );
                  setLocalMap(newMap);
                }}
                style={{ marginBottom: 16 }}
              >
                Delete
              </Button>
            )}
          </Form>
          {itemForm && (
            <Modal
              title="New Item"
              visible={true}
              width={"auto"}
              style={{ top: 12 }}
              onCancel={() => setItemForm(undefined)}
            >
              <ItemForm
                data={itemForm}
                onFinish={() => setItemForm(undefined)}
              />
            </Modal>
          )}
        </Form.Provider>
      </div>
    );
  }

  function Editor({ selected }: { selected: TSelection }): JSX.Element | null {
    if (localMap) {
      switch (selected.type) {
        case "location": {
          const location = localMap.locations[selected.id];
          const data: TLocationForm | string = location
            ? {
                ...location,
                items: location.items.map((itemId) => {
                  const item = localMap.items[itemId];
                  return {
                    ...item,
                    connections: item.connections.map((connectionInfo) => {
                      const connection =
                        localMap.connections[connectionInfo.id];
                      return {
                        ...connection,
                        ...connectionInfo,
                        partnerId: connectionInfo.isSource
                          ? connection.targetId
                          : connection.sourceId,
                      };
                    }),
                  };
                }),
              }
            : uuid();
          return <LocationForm data={data} />;
        }
        case "item":
          return <ItemForm data={localMap.items[selected.id]} />;
      }
    }
    return null;
  }

  return (
    <Layout
      style={{ height: "100vh", overflow: "scroll", backgroundColor: "white" }}
    >
      <Sider
        width={450}
        theme="light"
        style={{ height: "100%", overflow: "auto" }}
      >
        <Menu selectable={false}>
          <Menu.Item
            icon={<PlusSquareOutlined />}
            title="new-location"
            onClick={() => setSelected({ type: "location", id: "" })}
          >
            New Location
          </Menu.Item>
        </Menu>
        {selected ? <Editor selected={selected} /> : null}
      </Sider>
      <Layout className="site-layout">
        <Content style={{ height: "100vh" }}>
          <ForceGraph3D
            height={windowDims.height - 62}
            width={windowDims.width - 450}
            graphData={processMap(localMap)}
            nodeAutoColorBy="group"
            linkDirectionalArrowLength={6.5}
            linkDirectionalArrowRelPos={0.5}
            linkCurvature={0}
            linkWidth={1.15}
            // Copy the item or location id on right click
            onNodeRightClick={(node) =>
              navigator.permissions
                .query({ name: "clipboard-write" })
                .then((result) => {
                  if (result.state == "granted" || result.state == "prompt") {
                    navigator.clipboard.writeText(`${node.id}`);
                    message.success(node.id);
                  }
                })
            }
            onNodeClick={(node) => {
              if (node.id && localMap) {
                if (localMap.locations[node.id])
                  setSelected({ type: "location", id: node.id as string });
                else setSelected({ type: "item", id: node.id as string });
              }
            }}
            linkAutoColorBy="group"
            nodeThreeObject={(node: TNode) => {
              const sprite = new SpriteText(node.name);
              sprite.fontWeight = node.location ? "900" : "100";
              sprite.color = node.color ? node.color : "black";
              sprite.textHeight = node.location ? 12 : 8;
              return sprite;
            }}
          />
        </Content>
      </Layout>
    </Layout>
  );
}
