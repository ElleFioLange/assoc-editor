/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect } from "react";
import firebase from "firebase";
import { Layout, Menu, Typography } from "antd";
import {
  PlusSquareOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { v4 as uuid } from "uuid";
import { NewLocation, EditLocation } from "./Editors";
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
  const [data, setData] = useState<Record<string, TLocationFormData>>();
  const [itemLookUp, setItemLookUp] =
    useState<Record<string, TLocationFormData | TItemFormData>>();
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
            const raw: TLocationData[] = [];
            snapshot.forEach((doc) => raw.push(doc.data() as TLocationData));
            const processed: Record<string, TLocationFormData> = {};
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
                  connections: item.connections,
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

  function updateItemLookUp(id: string, item: TItemFormData) {
    setItemLookUp((prev) => ({
      ...prev,
      [id]: item,
    }));
  }

  function updateData(
    update: TLocationFormData | { item: TItemFormData; index: number }
  ) {
    if (data) {
      const newData = { ...data };
      if ("items" in update) {
        newData[update.id] = update;
      } else {
        const { item, index } = update;
        newData[item.parentId].items[index] = item;
      }
      setData(newData);
    }
  }

  function processData(data: Record<string, TLocationFormData>): {
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

  function addLocation(location: TLocationFormData) {
    const newLocation = {
      id: location.id,
      name: location.name,
      description: location.description,
      items: [],
    };
    updateData(newLocation);
  }

  function Editor({ selected }: { selected: string }): JSX.Element | null {
    switch (selected) {
      case "new-location":
        return <NewLocation id={uuid()} addLocation={addLocation} />;
      case "new-item":
        return <Title>New Item</Title>;
    }
    const object = data![selected] ? data![selected] : itemLookUp![selected];
    if ("items" in object) {
      return (
        <EditLocation
          location={object}
          updateLocation={(data: TLocationFormData) => null}
        />
      );
    } else {
      return null;
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
