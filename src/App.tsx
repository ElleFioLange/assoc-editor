/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect } from "react";
import fs from "fs";
import firebase from "firebase";
// import * as firebase from "firebase-admin";
import Graph from "node-dijkstra";
import { Menu, Layout, Typography, Space, Input, message } from "antd";
import {
  LoadingOutlined,
  PlusSquareOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { v4 as uuid } from "uuid";
// import Menu from "./Menu";
import { LocationEditor, ItemEditor } from "./Editors";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import useWindowDims from "./useWindowDims";
import "antd/dist/antd.css";

const SIDER_WIDTH = 450;

const { Content, Sider } = Layout;
const { Title } = Typography;

// TODO put parentIDs in the connections so you can actually look up the items

function App({ filePath }: { filePath: string }): JSX.Element {
  const [data, setData] = useState<TLocationForm[]>();
  const [itemLookUp, setItemLookUp] = useState<Record<string, TItemForm>>();
  const [checkItemId, setCheckItemId] = useState("");
  const [selected, setSelected] = useState<string>("new-location");
  const [uploading, setUploading] = useState(false);
  const windowDims = useWindowDims();

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
            }));
            setData(processed);
            console.log(processed);
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

  function indexOfId(list: { id: string }[], id: string) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        return i;
      }
    }
    return undefined;
  }

  function updateData(
    update: TLocationForm | TItemForm,
    prevData: (string | TLocationForm) | TItemForm
  ) {
    if (data) {
      const newData = [...data];
      if (
        "items" in update &&
        typeof prevData !== "string" &&
        !("connections" in prevData)
      ) {
        // Update itemLookUp and sync connections across items
        update.items.forEach((item) => updateItemLookUp(item));
        const index = indexOfId(newData, update.id);
        if (index !== undefined) {
          newData[index] = update;
          update.items.forEach((item) => {
            const prevItemIndex = indexOfId(prevData.items, item.id);
            const prevConnections = prevItemIndex
              ? newData[index].items[prevItemIndex!].connections
              : undefined;
            console.log({ prevItemIndex, prevConnections });
            item.connections.forEach((connection) => {
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
              item.connections.forEach((connection) => {
                const partner = itemLookUp![connection.partnerId];
                const parentIndex =
                  indexOfId(newData, partner.parentId) || index;
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
          // Update item look up and sync connections across items
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
      } else if (
        "connections" in update &&
        typeof prevData !== "string" &&
        "connections" in prevData
      ) {
        updateItemLookUp(update);
        const parentIndex = indexOfId(newData, update.parentId);
        const index = indexOfId(newData[parentIndex!].items, update.id);
        if (index !== undefined) {
          // console.log(data);
          newData[parentIndex!].items[index] = update;
          const prevConnections = prevData.connections;
          // console.log(data[parentIndex!].items);
          // console.log(index);
          // console.log(parentIndex);
          // console.log(newData);
          update.connections.forEach((connection) => {
            if (prevConnections && !prevConnections.includes(connection)) {
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

  console.log(data);

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
    // console.log(index);
    // console.log(data);
    // console.log(selected);
    // console.log(object);
    // console.log(itemLookUp);
    if ("items" in object) {
      return (
        <LocationEditor filePath={filePath} data={object} submit={updateData} />
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
    if (data) {
      setUploading(true);
      const graph = new Graph();
      data.forEach(({ items }) => {
        items.forEach(({ id, parentId, connections, content }) => {
          graph.addNode(
            id,
            Object.fromEntries(
              connections.map(({ partnerId }) => [partnerId, 1])
            )
          );
          // Upload all the changed content
          // Don't worry about deleted content because that probably won't happen too often
          // For future me, if this causes a problem, sorry but I'm too lazy. You know that.
          content.forEach(async (contentItem) => {
            if (contentItem.changed) {
              switch (contentItem.type) {
                case "image": {
                  await firebase
                    .storage()
                    .ref(`${filePath}/${parentId}/${id}/${contentItem.id}.jpeg`)
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
                        `${parentId}/${id}/${contentItem.id}.jpeg`
                      )
                    );
                  await firebase
                    .storage()
                    .ref(`${parentId}/${id}/${contentItem.id}.mp4`)
                    .put(
                      fs.readFileSync(`${parentId}/${id}/${contentItem.id}.mp4`)
                    );
                }
              }
            }
          });
        });
      });
      const uploadData = await Promise.all(
        data.map(async (location) => [
          {
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
                          connection,
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
                                    `${filePath}/${item.parentId}/${contentItem.id}/${contentItem.id}.jpeg`
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
                                    `${filePath}/${item.parentId}/${contentItem.id}/${contentItem.id}.jpeg`
                                  )
                                  .getDownloadURL(),
                                videoUri: await firebase
                                  .storage()
                                  .ref(
                                    `${filePath}/${item.parentId}/${contentItem.id}/${contentItem.id}.mp4`
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
          },
        ])
      );
      console.log(uploadData);
      setUploading(false);
    }
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
