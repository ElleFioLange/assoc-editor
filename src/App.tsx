/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect } from "react";
import firebase from "firebase";
import { Layout, Menu, Typography } from "antd";
import { PlusSquareOutlined } from "@ant-design/icons";
import { v4 as uuid } from "uuid";
import { LocationEditor, ItemEditor } from "./Editors";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import useWindowDims from "./useWindowDims";
import "antd/dist/antd.css";
import "./App.css";

const firebaseConfig = {
  apiKey: "AIzaSyBBrOZTRhISAGWaj6JjVm8DTPpzHRT9VRI",
  authDomain: "assoc-d30ac.firebaseapp.com",
  databaseURL: "https://assoc-d30ac-default-rtdb.firebaseio.com",
  projectId: "assoc-d30ac",
  storageBucket: "assoc-d30ac.appspot.com",
  messagingSenderId: "341782713355",
  appId: "1:341782713355:web:bb2c956fcfa4c73f85630e",
  measurementId: "G-VVME0TLGNG",
};

const SIDER_WIDTH = 450;

const { Content, Sider } = Layout;
const { Title } = Typography;

firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);

function App({ filePath }: { filePath: string }): JSX.Element {
  const [data, setData] = useState<TLocationForm[]>();
  const [itemLookUp, setItemLookUp] = useState<Record<string, TItemForm>>();
  const [selected, setSelected] = useState<string>("new-location");
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
            snapshot.forEach((doc) => raw.push(doc.data() as TLocation));
            const processed = raw.map((location) => ({
              id: location.id,
              name: location.name,
              description: location.description,
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
                        type: content.type,
                        id: content.id,
                        name: content.name,
                        path: `${filePath}/${location.id}/${item.id}/${content.id}.jpg`,
                      };
                    case "video":
                      return {
                        type: content.type,
                        id: content.id,
                        name: content.name,
                        posterPath: `${filePath}/${location.id}/${item.id}/${content.id}.jpg`,
                        videoPath: `${filePath}/${location.id}/${item.id}/${content.id}.mp4`,
                      };
                    case "map":
                      return content;
                  }
                }),
                link: item.link,
              })),
            }));
            setData(processed);
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
      return <LocationEditor data={uuid()} submit={updateData} />;
    }
    const index = indexOfId(data!, selected);
    const object = index !== undefined ? data![index] : itemLookUp![selected];
    // console.log(index);
    // console.log(data);
    // console.log(selected);
    // console.log(object);
    // console.log(itemLookUp);
    if ("items" in object) {
      return <LocationEditor data={object} submit={updateData} />;
    } else {
      return (
        <div style={{ margin: 8, overflow: "auto" }}>
          <Title level={3}>Edit Item</Title>
          <ItemEditor data={object} submit={updateData} />
        </div>
      );
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
        </Menu>
        {selected ? <Editor selected={selected} /> : null}
      </Sider>
      <Layout className="site-layout">
        <Content style={{ height: "100vh" }}>
          <ForceGraph3D
            width={windowDims.width - SIDER_WIDTH}
            graphData={data ? processData(data) : undefined}
            nodeAutoColorBy="group"
            linkDirectionalArrowLength={6.5}
            linkDirectionalArrowRelPos={0.5}
            linkCurvature={0}
            linkWidth={1.15}
            // Copy the item or location id on right click
            onNodeRightClick={
              (node) => {
                const index = indexOfId(data![1].items, "auu8acm3ro3qunqwc0");
                console.log(data![1].items[index!].connections);
              }
              // navigator.permissions
              //   .query({ name: "clipboard-write" })
              //   .then((result) => {
              //     if (result.state == "granted" || result.state == "prompt") {
              //       navigator.clipboard.writeText(`${node.id}`);
              //     }
              //   })
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
