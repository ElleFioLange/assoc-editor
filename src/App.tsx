import React, { useState } from 'react';
import { Layout, Menu } from "antd";
import { PlusSquareOutlined } from "@ant-design/icons";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import "antd/dist/antd.css";
import "./App.css";

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
      target: "feajiljba"
    },
    {
      source: "feajiljba",
      target: "asdfljae"
    },
    {
      source: "makvlaoiwe",
      target: "asddjalfeafljae"
    },
  ]
}

function App(): JSX.Element {
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={siderCollapsed} onCollapse={() => setSiderCollapsed(!siderCollapsed)}>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="home" icon={<PlusSquareOutlined />}>
            Add Node
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Content style={{ height: "100vh", }}>
          <ForceGraph3D
            backgroundColor="white"
            graphData={testData}
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
