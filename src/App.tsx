import React, { useState, useRef } from 'react';
import { Layout, Menu } from "antd";
import { PlusSquareOutlined } from "@ant-design/icons";
import GraphView from "./Graph";
import "antd/dist/antd.css";
import "./App.css";

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

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
          <GraphView />
        </Content>
      </Layout>
    </Layout>
  );
}

import Graph from "react-graph-vis";
// import React, { useState } from "react";
import ReactDOM from "react-dom";

const options = {
  layout: {
    hierarchical: false
  },
  edges: {
    color: "#000000"
  }
};

function randomColor() {
  const red = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const green = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const blue = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return `#${red}${green}${blue}`;
}

export default App;
