/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect, useRef } from "react";
const fs = window.require("fs");
const deepEqual = window.require("deep-equal");
import firebase from "firebase";
import Graph from "node-dijkstra";
import { Menu, Layout, Typography, Space, Input, message, Switch } from "antd";
import {
  LoadingOutlined,
  PlusSquareOutlined,
  UploadOutlined,
  SyncOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { v4 as uuid } from "uuid";
import { LocationEditor, ItemEditor } from "./Editors";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import useWindowDims from "./useWindowDims";
import indexOfId from "./indexOfId";
import "antd/dist/antd.css";

const SIDER_WIDTH = 450;

const { Content, Sider } = Layout;
const { Title } = Typography;

// TODO double check upload
// TODO deleted locations in upload

function App(): JSX.Element {
  const [data, setData] = useState<TLocationForm[]>();
  const [initialData, setInitialData] = useState<TLocationForm[]>();
  const [networkState, setNetworkState] = useState<TLocationForm[]>();
  const [itemLookUp, setItemLookUp] = useState<Record<string, TItemForm>>();
  const [checkItemId, setCheckItemId] = useState("");
  const [selected, setSelected] = useState<string>("new-location");
  const [uploading, setUploading] = useState(false);
  const [filePath, setFilePath] = useState("/Volumes/Seagate");
  const windowDims = useWindowDims();

  const pathRef = useRef<Input>(null);

  useEffect(() => {
    // Load data from firestore and process it to match the Forms
    if (!data)
      firebase
        .firestore()
        .collection("master")
        .get()
        .then(
          (snapshot) => {
            const raw: TLocation[] = [];
            snapshot.forEach((doc) => {
              raw.push(doc.data() as TLocation);
            });
            const processed = raw.map((location) => ({
              ...location,
              items: Object.values(location.items).map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                parentId: item.parentId,
                connections: Object.values(item.connections),
                content: item.content.map((content) => {
                  switch (content.type) {
                    case "image":
                      return {
                        ...content,
                        changed: false,
                        name: content.name,
                        path: `${filePath}/${location.id}/${item.id}/${content.id}.jpeg`,
                        uri: undefined,
                      };
                    case "video":
                      return {
                        ...content,
                        changed: false,
                        posterPath: `${filePath}/${location.id}/${item.id}/${content.id}.jpeg`,
                        videoPath: `${filePath}/${location.id}/${item.id}/${content.id}.mp4`,
                        uri: undefined,
                      };
                    case "map":
                      return {
                        ...content,
                        changed: false,
                        uri: undefined,
                      };
                  }
                }),
              })),
              minD: undefined,
            }));
            setData(processed);
            setInitialData(processed);
            setNetworkState(processed);
            processed.forEach((location) => {
              location.items.forEach((item) => updateItemLookUp(item));
            });
          },
          (e) => console.log(e)
        );
  });

  function updateItemLookUp(item: TItemForm) {
    setItemLookUp((prev) => ({
      ...prev,
      [item.id]: item,
    }));
  }

  function updateData(
    update: TLocationForm | TItemForm,
    prevData: (string | TLocationForm) | TItemForm
  ) {
    if (data) {
      const newData = [...data];
      if ("items" in update) {
        // Update itemLookUp and sync connections across items
        update.items.forEach((item) => updateItemLookUp(item));
        const index = indexOfId(newData, update.id);
        if (
          index !== undefined &&
          typeof prevData !== "string" &&
          "items" in prevData
        ) {
          // If the location already existed, then check for new and deleted connections
          newData[index] = update;
          update.items.forEach((item) => {
            const prevItemIndex = indexOfId(prevData.items, item.id);
            const prevConnections = prevItemIndex
              ? newData[index].items[prevItemIndex!].connections
              : undefined;
            console.log({ prevItemIndex, prevConnections });
            item.connections.forEach((connection) => {
              // If this is a new connection add it to the partner
              if (prevConnections && !prevConnections.includes(connection)) {
                const partner = itemLookUp![connection.partnerId];
                const parentIndex = indexOfId(newData, partner.parentId);
                const parent = newData[parentIndex!];
                const partnerIndex = indexOfId(parent.items, partner.id);
                const connectionMirror = {
                  id: connection.id,
                  isSource: !connection.isSource,
                  key: connection.key,
                  partnerId: item.id,
                };
                newData[parentIndex!].items[partnerIndex!].connections.push(
                  connectionMirror
                );
              }
            });
            if (prevConnections)
              prevConnections.forEach((connection) => {
                // If there's a connection that got deleted remove it from the partner
                if (!item.connections.includes(connection)) {
                  const partner = itemLookUp![connection.partnerId];
                  const parentIndex = indexOfId(newData, partner.parentId);
                  const parent = newData[parentIndex!];
                  const partnerIndex = indexOfId(parent.items, partner.id);
                  const connectionIndex = indexOfId(
                    partner.connections,
                    connection.id
                  );
                  newData[parentIndex!].items[partnerIndex!].connections.splice(
                    connectionIndex!,
                    1
                  );
                }
              });
          });
          const prevItems = prevData.items;
          prevItems.forEach((item) => {
            if (
              !update.items.map((updateItem) => updateItem.id).includes(item.id)
            ) {
              // If an item got deleted then remove all its connections from their partners
              item.connections.forEach((connection) => {
                const partner = itemLookUp![connection.partnerId];
                const parentIndex = indexOfId(newData, partner.parentId);
                const parent = newData[parentIndex!];
                const partnerIndex = indexOfId(parent.items, partner.id);
                const connectionIndex = indexOfId(
                  partner.connections,
                  connection.id
                );
                newData[parentIndex!].items[partnerIndex!].connections.splice(
                  connectionIndex!,
                  1
                );
              });
            }
          });
        } else {
          newData.push(update);
          // If the location is new then just add all connections to their partners
          update.items.forEach((item) => {
            updateItemLookUp(item);
            item.connections.forEach((connection) => {
              const partner = itemLookUp![connection.partnerId];
              const parentIndex = indexOfId(newData, partner.parentId);
              const parent = newData[parentIndex!];
              const partnerIndex = indexOfId(parent.items, partner.id);
              const connectionMirror = {
                id: connection.id,
                isSource: !connection.isSource,
                key: connection.key,
                partnerId: item.id,
              };
              newData[parentIndex!].items[partnerIndex!].connections.push(
                connectionMirror
              );
            });
          });
        }
      } else {
        // Update itemLookUp and check for new and deleted connections
        updateItemLookUp(update);
        const parentIndex = indexOfId(newData, update.parentId);
        const index = indexOfId(newData[parentIndex!].items, update.id);
        if (
          index !== undefined &&
          typeof prevData !== "string" &&
          "connections" in prevData
        ) {
          // If the item already existed, then check for new and deleted connections
          newData[parentIndex!].items[index] = update;
          const prevConnections = prevData.connections;
          update.connections.forEach((connection) => {
            if (prevConnections && !prevConnections.includes(connection)) {
              // If this is a new connection add it to the partner
              const partner = itemLookUp![connection.partnerId];
              const parentIndex = indexOfId(newData, partner.parentId);
              const parent = newData[parentIndex!];
              const partnerIndex = indexOfId(parent.items, partner.id);
              const connectionMirror = {
                id: connection.id,
                isSource: !connection.isSource,
                key: connection.key,
                partnerId: update.id,
              };
              newData[parentIndex!].items[partnerIndex!].connections.push(
                connectionMirror
              );
            }
          });
          if (prevConnections)
            prevConnections.forEach((connection) => {
              if (!update.connections.includes(connection)) {
                // If there's a connection that got deleted remove it from the partner
                const partner = itemLookUp![connection.partnerId];
                const parentIndex = indexOfId(newData, partner.parentId);
                const parent = newData[parentIndex!];
                const partnerIndex = indexOfId(parent.items, partner.id);
                const connectionIndex = indexOfId(
                  partner.connections,
                  connection.id
                );
                console.log({
                  partnerId: connection.partnerId,
                  partner,
                  parentIndex,
                  parent,
                  partnerIndex,
                  connectionIndex,
                });
                newData[parentIndex!].items[partnerIndex!].connections.splice(
                  connectionIndex!,
                  1
                );
              }
            });
        } else {
          // If the item is new then just add all connections to their partners
          newData[parentIndex!].items.push(update);
          update.connections.forEach((connection) => {
            const partner = itemLookUp![connection.partnerId];
            const parentIndex = indexOfId(newData, partner.parentId);
            const parent = newData[parentIndex!];
            const partnerIndex = indexOfId(parent.items, partner.id);
            const connectionMirror = {
              id: connection.id,
              isSource: !connection.isSource,
              key: connection.key,
              partnerId: update.id,
            };
            newData[parentIndex!].items[partnerIndex!].connections.push(
              connectionMirror
            );
          });
        }
      }
      setData(newData);
    }
  }

  function deleteLocation(location: TLocationForm) {
    if (data) {
      const newData = [...data];
      location.items.forEach(({ connections }) => {
        connections.forEach((connection) => {
          const partner = itemLookUp![connection.partnerId];
          const parentIndex = indexOfId(newData, partner.parentId);
          const parent = newData[parentIndex!];
          const partnerIndex = indexOfId(parent.items, partner.id);
          const connectionIndex = indexOfId(partner.connections, connection.id);
          newData[parentIndex!].items[partnerIndex!].connections.splice(
            connectionIndex!,
            1
          );
        });
      });
      const idx = indexOfId(newData, location.id);
      newData.splice(idx!, 1);
      setSelected("new-location");
      setData(newData);
    }
  }

  function processData(data: TLocationForm[]): {
    nodes: TNode[];
    links: TLink[];
  } {
    const nodes: TNode[] = [];
    const links: TLink[] = [];
    data.forEach((location) => {
      nodes.push({
        id: location.id,
        name: location.name,
        group: location.id,
        location: true,
      });
      location.items.forEach((item) => {
        nodes.push({ id: item.id, name: item.name, group: location.id });
        links.push({
          source: location.id,
          target: item.id,
          group: location.id,
        });
        item.connections.forEach((connection) => {
          if (connection.isSource)
            links.push({
              source: item.id,
              target: connection.partnerId,
              group: location.id,
            });
        });
      });
    });

    return { nodes, links };
  }

  function Editor({ selected }: { selected: string }): JSX.Element | null {
    if (selected === "new-location") {
      return (
        <LocationEditor filePath={filePath} data={uuid()} submit={updateData} />
      );
    }
    const index = indexOfId(data!, selected);
    const object = index !== undefined ? data![index] : itemLookUp![selected];
    if ("items" in object) {
      return (
        <LocationEditor
          deleteLocation={deleteLocation}
          filePath={filePath}
          data={object}
          submit={updateData}
        />
      );
    } else {
      return (
        <div style={{ margin: 8, overflow: "auto" }}>
          <Title level={3}>Edit Item</Title>
          <ItemEditor filePath={filePath} data={object} submit={updateData} />
        </div>
      );
    }
  }

  async function upload() {
    if (data && networkState) {
      setUploading(true);
      const graph = new Graph();
      // Go over every item
      for (const { items } of data) {
        for (const { id, parentId, connections, content } of items) {
          // Add all the nodes so for dijkstras
          graph.addNode(
            id,
            Object.fromEntries(
              connections.map(({ partnerId }) => [partnerId, 1])
            )
          );
          // Upload all the changed content
          for (const contentItem of content) {
            if (contentItem.changed) {
              contentItem.changed = false;
              switch (contentItem.type) {
                case "image": {
                  await firebase
                    .storage()
                    .ref(`${parentId}/${id}/${contentItem.id}.jpeg`)
                    .put(
                      fs.readFileSync(
                        `${filePath}/${parentId}/${id}/${contentItem.id}.jpeg`
                      )
                    );
                  break;
                }
                case "video": {
                  await firebase
                    .storage()
                    .ref(`${parentId}/${id}/${contentItem.id}.jpeg`)
                    .put(
                      fs.readFileSync(
                        `${filePath}/${parentId}/${id}/${contentItem.id}.jpeg`
                      )
                    );
                  await firebase
                    .storage()
                    .ref(`${parentId}/${id}/${contentItem.id}.mp4`)
                    .put(
                      fs.readFileSync(
                        `${filePath}/${parentId}/${id}/${contentItem.id}.mp4`
                      )
                    );
                }
              }
            }
          }
          // Delete the deleted content
          const initLocationIdx = indexOfId(networkState, parentId);
          const initLocation = initLocationIdx
            ? networkState[initLocationIdx]
            : undefined;
          const initItemIdx = initLocation
            ? indexOfId(initLocation.items, id)
            : undefined;
          const initItem =
            initLocation && initItemIdx
              ? initLocation.items[initItemIdx]
              : undefined;
          if (initItem)
            for (const contentItem of initItem.content) {
              if (!content.map((c) => c.id).includes(contentItem.id)) {
                await firebase
                  .storage()
                  .ref(`${parentId}/${id}/${contentItem.id}`)
                  .delete();
              }
            }
        }
      }
      // Delete all deleted locations
      for (const location of networkState) {
        if (!data.map((l) => l.id).includes(location.id)) {
          await firebase
            .firestore()
            .collection("master")
            .doc(location.id)
            .delete();
        }
      }
      const uploadData = await Promise.all(
        data.map(async (location) => ({
          ...location,
          items: Object.fromEntries(
            await Promise.all(
              location.items.map(async (item) =>
                Promise.resolve([
                  item.id,
                  {
                    ...item,
                    parentName: location.name,
                    connections: Object.fromEntries(
                      item.connections.map((connection) => [
                        connection.id,
                        {
                          ...connection,
                          parentId: itemLookUp![connection.partnerId].parentId,
                        },
                      ])
                    ),
                    content: await Promise.all(
                      item.content.map(async (contentItem) => {
                        switch (contentItem.type) {
                          case "image": {
                            return {
                              ...contentItem,
                              uri: await firebase
                                .storage()
                                .ref(
                                  `${item.parentId}/${item.id}/${contentItem.id}.jpeg`
                                )
                                .getDownloadURL(),
                              changed: undefined,
                              path: undefined,
                            };
                          }
                          case "video": {
                            return {
                              ...contentItem,
                              posterUri: await firebase
                                .storage()
                                .ref(
                                  `${item.parentId}/${item.id}/${contentItem.id}.jpeg`
                                )
                                .getDownloadURL(),
                              videoUri: await firebase
                                .storage()
                                .ref(
                                  `${item.parentId}/${item.id}/${contentItem.id}.mp4`
                                )
                                .getDownloadURL(),
                              changed: undefined,
                              posterPath: undefined,
                              videoPath: undefined,
                            };
                          }
                          case "map": {
                            return {
                              ...contentItem,
                              changed: undefined,
                            };
                          }
                        }
                      })
                    ),
                  },
                ])
              )
            )
          ),
          minD: Object.fromEntries(
            data.map((otherLocation) => [
              otherLocation.id,
              location.id === otherLocation.id
                ? 0
                : Math.min(
                    ...location.items.map((item) =>
                      Math.min(
                        ...otherLocation.items.map(
                          (otherItem) =>
                            graph.path(item.id, otherItem.id).length - 1
                        )
                      )
                    )
                  ),
            ])
          ),
        }))
      );
      console.log(uploadData);
      for (const location of uploadData) {
        await firebase
          .firestore()
          .collection("master")
          .doc(location.id)
          .set(location);
      }
      setNetworkState(uploadData);
      setUploading(false);
    }
  }

  async function checkAgainstLocal() {
    firebase
      .firestore()
      .collection("master")
      .get()
      .then((snapshot) => {
        const raw: TLocation[] = [];
        snapshot.forEach((doc) => {
          raw.push(doc.data() as TLocation);
        });
        console.log(raw);
        const processed = raw.map((location) => ({
          ...location,
          items: Object.values(location.items).map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            parentId: item.parentId,
            connections: Object.values(item.connections),
            content: item.content.map((content) => {
              switch (content.type) {
                case "image":
                  return {
                    ...content,
                    changed: false,
                    name: content.name,
                    path: `${filePath}/${location.id}/${item.id}/${content.id}.jpeg`,
                    uri: undefined,
                  };
                case "video":
                  return {
                    ...content,
                    changed: false,
                    posterPath: `${filePath}/${location.id}/${item.id}/${content.id}.jpeg`,
                    videoPath: `${filePath}/${location.id}/${item.id}/${content.id}.mp4`,
                    uri: undefined,
                  };
                case "map":
                  return {
                    ...content,
                    changed: false,
                    uri: undefined,
                  };
              }
            }),
          })),
          minD: undefined,
        }));
        console.log(processed);
        const ordered = data?.map(({ id }) => {
          const idx = indexOfId(processed, id);
          return idx !== undefined ? processed[idx] : "MISSING";
        });
        if (deepEqual(data, ordered) && ordered?.length === processed.length) {
          message.success("Equal");
          console.log("sakdjflasdkjfas;ldj;asld");
          console.log(ordered);
          console.log(data);
        } else {
          console.log("---------LOCAL----------");
          console.log(data);
          console.log("------------------------");
          console.log("--------NETWORK---------");
          console.log(ordered);
          console.log("------------------------");
          message.error("Not equal");
        }
      });
  }

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        width={SIDER_WIDTH}
        theme="light"
        style={{ height: "100%", overflow: "auto" }}
      >
        <Menu selectable={false}>
          <Menu.Item
            icon={<PlusSquareOutlined />}
            title="new-location"
            onClick={() => setSelected("new-location")}
          >
            New Location
          </Menu.Item>
          <Menu.Item
            icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
            title="upload"
            onClick={upload}
          >
            Upload
          </Menu.Item>
          <Menu.Item
            icon={<SyncOutlined />}
            title="check"
            onClick={checkAgainstLocal}
          >
            Check
          </Menu.Item>
          <Menu.Item
            icon={<UndoOutlined />}
            title="undo"
            onClick={() => {
              const reset = [...initialData!];
              setSelected("new-location");
              setData(reset);
              console.log(reset);
            }}
          >
            Reset
          </Menu.Item>
        </Menu>
        <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
          <Input
            onChange={(event) => setCheckItemId(event.target.value)}
            value={checkItemId}
          />
          {itemLookUp && itemLookUp[checkItemId]
            ? itemLookUp[checkItemId].name
            : "N/A"}
        </Space>
        <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
          <Input
            ref={pathRef}
            style={{ width: 450 }}
            onPressEnter={() => setFilePath(pathRef?.current?.state.value)}
          />
        </Space>
        GDrive
        <Switch
          onChange={(checked) =>
            setFilePath(
              checked
                ? "/Volumes/SEAGATE"
                : "/Users/sage/Google Drive/ASSOC CONTENT"
            )
          }
        />
        Seagate
        {selected ? <Editor selected={selected} /> : null}
      </Sider>
      <Layout className="site-layout">
        <Content style={{ height: "100vh" }}>
          <ForceGraph3D
            height={windowDims.height}
            width={windowDims.width - SIDER_WIDTH}
            graphData={data ? processData(data) : undefined}
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
            onNodeClick={(node) => setSelected(node.id as string)}
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

export default App;
