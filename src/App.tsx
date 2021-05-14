import React, { useState, useEffect } from "react";
import firebase from "firebase";
import { Layout, Menu } from "antd";
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

// TODO Styling for the graph
// TODO List out all needed functionality
// TODO Firebase integration

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

const testData = {
  nodes: [
    {
      id: "asdfljae",
      name: "node1",
      val: 494,
    },
    {
      id: "asddjalfeafljae",
      name: "node2",
      val: 494,
    },
    {
      id: "feajiljba",
      name: "node3",
      val: 494,
    },
    {
      id: "makvlaoiwe",
      name: "node4",
      val: 494,
    },
  ],
  links: [
    {
      source: "asdfljae",
      target: "feajiljba",
    },
    {
      source: "feajiljba",
      target: "makvlaoiwe",
    },
    {
      source: "makvlaoiwe",
      target: "asddjalfeafljae",
    },
  ],
};

firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);

function App(): JSX.Element {
  const [data, setData] = useState<Record<string, LocationData>>();
  const windowDims = useWindowDims();

  useEffect(() => {
    if (!data)
      firebase
        .database()
        .ref("userInit")
        .once(
          "value",
          (snapshot) => {
            setData(snapshot.val().map);
          },
          (e) => console.log(e)
        );
  });

  function processData(data: Record<string, LocationData>): {
    nodes: TNode[];
    links: TLink[];
  } {
    const nodesTemp: TNode[] = [];
    const linksTemp: TLink[] = [];
    Object.values(data).forEach((location) => {
      nodesTemp.push({
        id: location.id,
        name: location.name,
        group: location.id,
        location: true,
      });
      Object.values(location.items).forEach((item) => {
        nodesTemp.push({ id: item.id, name: item.name, group: location.id });
        linksTemp.push({
          source: location.id,
          target: item.id,
          group: location.id,
        });
        Object.values(item.connections).forEach((connection) => {
          linksTemp.push({
            source: connection.sourceId,
            target: connection.sinkId,
            group: location.id,
          });
        });
      });
    });

    const nodes = [...new Set(nodesTemp)];
    const links = [...new Set(linksTemp)];
    console.log(nodes);
    console.log(links);

    return { nodes, links };
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={300} theme="light">
        {/* <Menu onClick={(e) => console.log(e)}>
          <Menu.Item 
        </Menu> */}
      </Sider>
      <Layout className="site-layout">
        <Content style={{ height: "100vh" }}>
          <ForceGraph3D
            width={windowDims.width - 300}
            graphData={data ? processData(data) : undefined}
            nodeAutoColorBy="group"
            linkDirectionalArrowLength={6.5}
            linkDirectionalArrowRelPos={0.5}
            linkCurvature={0}
            linkWidth={1.15}
            linkAutoColorBy="group"
            nodeThreeObject={(node: TNode) => {
              const sprite = new SpriteText(node.name);
              sprite.fontWeight = node.location ? "900" : "100";
              sprite.color = node.color ? node.color : "black";
              sprite.textHeight = 8;
              return sprite;
            }}
          />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
