import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import "antd/dist/antd.css";
import "./App.css";

// TODO Abstract components for easier management
// TODO Styling for the graph
// TODO List out all needed functionality
// TODO Firebase integration

// const { SubMenu } = Menu;
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
      target: "asdfljae",
    },
    {
      source: "makvlaoiwe",
      target: "asddjalfeafljae",
    },
  ],
};

function App(): JSX.Element {
  const [menu, setMenu] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          onClick={() => setMenu(!menu)}
        >
          <Menu.Item
            key="home"
            icon={menu ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          >
            Menu
          </Menu.Item>
        </Menu>
      </Sider>
      <Sider
        width={400}
        theme="light"
        collapsible
        collapsed={menu}
        onCollapse={() => setMenu(!menu)}
        style={{ marginRight: 3 }}
      >
        <Menu theme="light" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item
            key="home"
            icon={menu ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          >
            Add Node
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Content style={{ height: "100vh" }}>
          <ForceGraph3D
            backgroundColor="white"
            graphData={testData}
            linkColor="green"
            linkOpacity={1}
            linkWidth={2}
            nodeThreeObject={(node: NodeData) => {
              const sprite = new SpriteText(node.id);
              sprite.color = "green";
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
