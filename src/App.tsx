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

// TODO Styling for the graph
// TODO List out all needed functionality
// TODO Firebase integration

const { Content, Sider } = Layout;
const { Title } = Typography;

firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);

function App({ filePath }: { filePath: string }): JSX.Element {
  const [data, setData] = useState<Record<string, TLocationForm>>();
  const [itemLookUp, setItemLookUp] = useState<Record<string, TItemForm>>();
  const [selected, setSelected] = useState<string>("new-location");
  const windowDims = useWindowDims();

  useEffect(() => {
    if (!data)
      firebase
        .firestore()
        .collection("master")
        .get()
        .then(
          (snapshot) => {
            const raw: TLocation[] = [];
            snapshot.forEach((doc) => raw.push(doc.data() as TLocation));
            const processed: Record<string, TLocationForm> = {};
            raw.forEach((location) => {
              processed[location.id] = {
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
              };
            });
            setData(processed);
            Object.values(processed).forEach((location) => {
              Object.values(location.items).forEach((item) =>
                updateItemLookUp(item.id, item)
              );
            });
          },
          (e) => console.log(e)
        );
  });

  function updateItemLookUp(id: string, item: TItemForm) {
    setItemLookUp((prev) => ({
      ...prev,
      [id]: item,
    }));
  }

  function updateData(update: TLocationForm | TItemForm) {
    if (data) {
      console.log(update);
      const newData = { ...data };
      if ("items" in update) {
        newData[update.id] = update;
        update.items.forEach((item) => updateItemLookUp(item.id, item));
      } else {
        const index = newData[update.parentId].items.indexOf(update);
        if (index === -1) {
          newData[update.parentId].items[index] = update;
        } else {
          newData[update.parentId].items.push(update);
        }
      }
      setData(cleanConnections(newData));
    }
  }

  function cleanConnections(data: Record<string, TLocationForm>) {
    const cleaned = { ...data };
    Object.values(cleaned).forEach((location) => {
      location.items.forEach((item) => {
        Object.values(item.connections).forEach((connection) => {
          const connectionMirror = {
            id: connection.id,
            isSource: !connection.isSource,
            key: connection.key,
            partnerId: item.id,
          };
          const target = itemLookUp![connection.partnerId];
          const targetIndex = cleaned[target.parentId].items.indexOf(target);
          const connectionIndex = target.connections.indexOf(connectionMirror);
          if (targetIndex !== -1) {
            if (connectionIndex === -1) {
              cleaned[target.parentId].items[targetIndex].connections.push(
                connectionMirror
              );
            } else {
              cleaned[target.parentId].items[targetIndex].connections[
                connectionIndex
              ] = connectionMirror;
            }
          }
        });
      });
    });
    return cleaned;
  }

  function processData(data: Record<string, TLocationForm>): {
    nodes: TNode[];
    links: TLink[];
  } {
    const nodes: TNode[] = [];
    let links: TLink[] = [];
    Object.values(data).forEach((location) => {
      nodes.push({
        id: location.id,
        name: location.name,
        group: location.id,
        location: true,
      });
      Object.values(location.items).forEach((item) => {
        nodes.push({ id: item.id, name: item.name, group: location.id });
        links.push({
          source: location.id,
          target: item.id,
          group: location.id,
        });
        Object.values(item.connections).forEach((connection) => {
          if (connection.isSource)
            links.push({
              source: item.id,
              target: connection.partnerId,
              group: location.id,
            });
        });
      });
    });

    links = [...new Set(links)];

    return { nodes, links };
  }

  function Editor({ selected }: { selected: string }): JSX.Element | null {
    if (selected === "new-location") {
      return (
        <LocationEditor
          data={uuid()}
          submit={(location: TLocationForm) => updateData(location)}
        />
      );
    }
    const object = data![selected] ? data![selected] : itemLookUp![selected];
    if ("items" in object) {
      return (
        <LocationEditor
          data={object}
          submit={(location: TLocationForm) => updateData(location)}
        />
      );
    } else {
      return (
        <div style={{ margin: 8, overflow: "auto" }}>
          <Title level={3}>Edit Location</Title>
          <ItemEditor
            data={object}
            submit={(item: TItemForm) => updateData(item)}
          />
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
            onLinkRightClick={({ source, target }) => {
              if (typeof source !== "string" && typeof target !== "string") {
                if (typeof source !== "number" && typeof target !== "number") {
                  if (source && target) {
                    if (
                      typeof source.id === "string" &&
                      typeof target.id === "string"
                    ) {
                      const sourceItem = itemLookUp![source.id];
                      const targetItem = itemLookUp![target.id];
                      if (sourceItem && targetItem) {
                        const newData = { ...data };
                        const sourceIndex =
                          newData[sourceItem.parentId].items.indexOf(
                            sourceItem
                          );
                        const targetIndex =
                          newData[targetItem.parentId].items.indexOf(
                            targetItem
                          );
                        const sourceConnectionIndex =
                          sourceItem.connections.map(({ partnerId }, index) => {
                            if (target.id === partnerId) return index;
                          });
                        const targetConnectionIndex =
                          targetItem.connections.map(({ partnerId }, index) => {
                            if (source.id === partnerId) return index;
                          });
                        newData[sourceItem.parentId].items[
                          sourceIndex
                        ].connections.splice(sourceConnectionIndex[0]!, 1);
                        newData[targetItem.parentId].items[
                          targetIndex
                        ].connections.splice(targetConnectionIndex[0]!, 1);
                        setData(newData);
                      }
                    }
                  }
                }
              }
            }}
            onNodeRightClick={(node) =>
              navigator.permissions
                .query({ name: "clipboard-write" })
                .then((result) => {
                  if (result.state == "granted" || result.state == "prompt") {
                    navigator.clipboard.writeText(`${node.id}`);
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
