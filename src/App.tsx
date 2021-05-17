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
import { ItemEditor, LocationEditor, NewLocation } from "./Editors";
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

function App(): JSX.Element {
  const [data, setData] = useState<Record<string, LocationData>>();
  const [idLookUp, setIdLookUp] =
    useState<Record<string, LocationData | ItemData>>();
  const [selected, setSelected] = useState<string>("new-location");
  const [prevSelected, setPrevSelected] = useState<string>();
  const windowDims = useWindowDims();

  useEffect(() => {
    if (!data)
      firebase
        .database()
        .ref("userInit")
        .once(
          "value",
          (snapshot) => {
            const data = snapshot.val().map as Record<string, LocationData>;
            setData(data);
            Object.values(data).forEach((location) => {
              updateIdLookUp(location.id, location);
              Object.values(location.items).forEach((item) =>
                updateIdLookUp(item.id, item)
              );
            });
          },
          (e) => console.log(e)
        );
  });

  function Editor({ selected }: { selected: string }): JSX.Element | null {
    switch (selected) {
      case "new-location":
        return <NewLocation id={uuid()} addLocation={addLocation} />;
      case "new-item":
        return <Title>New Item</Title>;
    }
    const object = idLookUp![selected];
    return "items" in object ? (
      <div style={{ margin: 8 }}>
        <Title level={3}>Location</Title>
        <LocationEditor location={object} />
      </div>
    ) : (
      <div style={{ margin: 8 }}>
        <Title level={3}>Item</Title>
        <ItemEditor item={object} />
      </div>
    );
  }

  function updateData(data: LocationData | ItemData) {
    const prevObject = idLookUp![data.id];
    if (prevObject) {
      if ("items" in data && "items" in prevObject)
        setData((prev) => ({ ...prev, [data.id]: { ...prevObject, ...data } }));
      if ("connections" in data && "connections" in prevObject) {
        const parent = idLookUp![data.parentId];
        if ("items" in parent) {
          setData((prev) => ({
            ...prev,
            [data.parentId]: {
              ...parent,
              items: { ...parent.items, [data.id]: { ...prevObject, ...data } },
            },
          }));
        }
      }
    } else {
      if ("items" in data) {
        setData((prev) => ({ ...prev, [data.id]: data }));
      }
      if ("connections" in data) {
        const parent = idLookUp![data.parentId];
        if ("items" in parent) {
          setData((prev) => ({
            ...prev,
            [data.parentId]: {
              ...parent,
              items: { ...parent.items, [data.id]: data },
            },
          }));
        }
      }
    }
  }

  function addLocation(data: LocationFormData) {
    const newLocation = {
      id: data.id,
      name: data.name,
      description: data.description,
      items: {},
      minD: {},
    };
    updateData(newLocation);
  }

  function updateIdLookUp(id: string, object: LocationData | ItemData) {
    setIdLookUp((prev) => ({
      ...prev,
      [id]: object,
    }));
  }

  function processData(data: Record<string, LocationData>): {
    nodes: TNode[];
    links: TLink[];
  } {
    let nodes: TNode[] = [];
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
          links.push({
            source: connection.sourceId,
            target: connection.sinkId,
            group: location.id,
          });
        });
      });
    });

    nodes = [...new Set(nodes)];
    links = [...new Set(links)];

    return { nodes, links };
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={SIDER_WIDTH} theme="light">
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
