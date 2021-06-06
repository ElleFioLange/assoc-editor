import React, { useState, useRef, useEffect } from "react";
const fs = window.require("fs");
const ffprobe = window.require("ffprobe");
const ffprobeStatic = window.require("ffprobe-static");
const { shell } = window.require("electron");
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
import firebase from "firebase/app";
import "firebase/firestore";
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

const { Sider, Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

export default function GraphEditor({
  localMap,
  setLocalMap,
  filePath,
  loggedIn,
}: {
  localMap: TMap | undefined;
  setLocalMap: React.Dispatch<React.SetStateAction<TMap | undefined>>;
  filePath: string;
  loggedIn: boolean;
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

  function addConnection(connection: TLocalConnection, mapState: TMap) {
    const newMap = { ...mapState };
    const source = newMap.items[connection.sourceId];
    const target = newMap.items[connection.targetId];
    if (source && !source.connections[connection.id])
      source.connections[connection.id] = connection;
    if (source && !target.connections[connection.id])
      target.connections[connection.id] = connection;
    newMap.connections[connection.id] = connection;
    return newMap;
  }

  function deleteConnection(connection: TLocalConnection, mapState: TMap) {
    const newMap = { ...mapState };
    delete newMap.items[connection.sourceId].connections[connection.id];
    delete newMap.items[connection.targetId].connections[connection.id];
    delete newMap.connections[connection.id];
    return newMap;
  }

  function addItem(item: TLocalItem, mapState: TMap) {
    let newMap = { ...mapState };
    // If the item existed previously then make sure to delete any removed connections
    if (newMap.items[item.id]) {
      const prev = newMap.items[item.id];
      Object.values(prev.connections).forEach((connection) => {
        if (!Object.keys(item.connections).includes(connection.id)) {
          newMap = deleteConnection(connection, newMap);
        }
      });
    }
    // Write in new item and any new or changed connections
    Object.values(item.connections).forEach(
      (connection) => (newMap = addConnection(connection, newMap))
    );
    newMap.items[item.id] = item;
    return newMap;
  }

  function deleteItem(item: TLocalItem, mapState: TMap) {
    let newMap = { ...mapState };
    Object.values(item.connections).forEach(
      (connection) => (newMap = deleteConnection(connection, newMap))
    );
    delete newMap.locations[item.locationId].items[item.id];
    delete newMap.items[item.id];
    return newMap;
  }

  function addLocation(location: TLocalLocation, mapState: TMap) {
    let newMap = { ...mapState };
    // If the location existed previously then make sure to delete any removed items
    if (newMap.locations[location.id]) {
      const prev = newMap.locations[location.id];
      Object.values(prev.items).forEach((item) => {
        if (!Object.keys(location.items).includes(item.id)) {
          newMap = deleteItem(item, newMap);
        }
      });
    }
    // Write in new location and any new or changed items
    Object.values(location.items).forEach((item) => {
      newMap = addItem(item, newMap);
    });
    newMap.locations[location.id] = location;
    return newMap;
  }

  function deleteLocation(location: TLocalLocation, mapState: TMap) {
    let newMap = { ...mapState };
    Object.values(location.items).forEach((item) => {
      newMap = deleteItem(item, newMap);
    });
    delete newMap.locations[location.id];
    return newMap;
  }

  function ConnectionForm() {
    return null;
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
    data,
    onFinish,
  }: {
    data: { id: string; locationId: string } | TLocalItem;
    onFinish?: () => void;
  }): JSX.Element {
    const [form] = Form.useForm();

    const [contentForm, setContentForm] = useState<string | TLocalContent>();

    return (
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
            case "itemForm": {
              if (!onFinish) {
                const { itemForm } = forms;
                const connections =
                  (itemForm.getFieldValue(
                    "connections"
                  ) as TLocalConnection[]) || [];
                connections.forEach((connection) => {
                  if (!connection.id) connection.id = uuid();
                });
                const content = itemForm.getFieldValue("content") || [];
                const item = {
                  ...values,
                  connections: Object.fromEntries(
                    connections.map((connection) => [connection.id, connection])
                  ),
                  content,
                  locationId: data.locationId,
                } as TLocalItem;
                const newMap = localMap ? addItem(item, localMap) : localMap;
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
              const content: TLocalContent[] = getFieldValue("content") || [];
              return content.length ? (
                <ul>
                  {content.map((item, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>
                      {item.name} - {item.type}
                      <Button
                        style={{ marginLeft: 12 }}
                        icon={<EditOutlined />}
                        onClick={() => setContentForm(item)}
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
              form.submit();
              if (onFinish) onFinish();
            }}
            style={{ marginBottom: 16 }}
          >
            Submit
          </Button>
        </Form>
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
    );
  }

  function LocationForm({
    data,
  }: {
    data: string | TLocalLocation;
  }): JSX.Element {
    const [form] = Form.useForm();

    const [itemForm, setItemForm] =
      useState<{ id: string; locationId: string } | TLocalItem>();

    const formData =
      typeof data === "string"
        ? { id: data }
        : {
            ...data,
            items: Object.values(data.items),
          };

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
                const items =
                  (locationForm.getFieldValue("items") as TLocalItem[]) || [];
                const location = {
                  ...values,
                  items: Object.fromEntries(
                    items.map((item) => [item.id, item])
                  ),
                } as unknown as TLocalLocation;
                const newMap = localMap
                  ? addLocation(location, localMap)
                  : localMap;
                console.log(newMap);
                setLocalMap(newMap);
                break;
              }
              case "itemForm": {
                const { locationForm, itemForm } = forms;
                const items = locationForm.getFieldValue("items") || [];
                const formConnections =
                  itemForm.getFieldValue("connections") || [];
                const connections: TLocalConnection[] = formConnections.map(
                  (connection: TConnectionForm) => ({
                    ...connection,
                    id: connection.id || uuid(),
                    sourceId: connection.isSource
                      ? values.id
                      : connection.partnerId,
                    targetId: connection.isSource
                      ? connection.partnerId
                      : values.id,
                  })
                );
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
                        locationId: formData.id,
                      },
                    ],
                  });
                } else {
                  const newItems = [...items];
                  newItems[index] = {
                    ...values,
                    connections,
                    content,
                    locationId: formData.id,
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
                const items: TLocalItem[] = getFieldValue("items") || [];
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
                  if (localMap) deleteLocation(data, localMap);
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
        case "location":
          return (
            <div style={{ margin: 8 }}>
              <LocationForm data={localMap.locations[selected.id] || uuid()} />
            </div>
          );
        case "item":
          return (
            <div style={{ margin: 8 }}>
              <ItemForm data={localMap.items[selected.id]} />
            </div>
          );
        case "connection":
          return (
            <div style={{ margin: 8 }}>
              <ConnectionForm />
            </div>
          );
      }
    }
    return null;
  }

  return (
    <Layout style={{ height: "auto", backgroundColor: "white" }}>
      <Sider
        width={450}
        theme="light"
        style={{ height: "auto", overflow: "auto" }}
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
                else if (localMap.items[node.id])
                  setSelected({ type: "item", id: node.id as string });
                else if (localMap.connections[node.id])
                  setSelected({ type: "connection", id: node.id as string });
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
