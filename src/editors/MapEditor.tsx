import React, { useState, useRef, useEffect } from "react";
import { Layout, Menu, Space, message, Input } from "antd";
import firebase from "firebase/app";
import "firebase/firestore";
import {
  PlusSquareOutlined,
  LoadingOutlined,
  UploadOutlined,
  SyncOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { v4 as uuid } from "uuid";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import useWindowDims from "../useWindowDims";

const { Sider, Content } = Layout;

export default function GraphEditor(): JSX.Element {
  // ------------------
  const [networkMap, setNetworkMap] = useState<TMapData>();
  const [localMap, setLocalMap] = useState<TMapData>();
  // ------------------
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState("new-location");
  const [checkItemId, setCheckItemId] = useState("");
  const [filePath, setFilePath] = useState(
    "/Users/sage/Google Drive/ASSOC CONTENT"
  );
  // ------------------
  const windowDims = useWindowDims();
  // ------------------
  const pathRef = useRef<Input>(null);

  // Load data from firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!localMap) {
        const locations: Record<string, TLocalLocation> = {};
        await firebase
          .firestore()
          .collection("locations")
          .get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              const location = doc.data() as TNetworkLocation;
              locations[location.id] = {
                ...location,
                items: [],
              };
            });
          });
        const items: Record<string, TLocalItem> = {};
        await firebase.firestore().collection("items").get().then((snapshot) => {
          snapshot.forEach((doc) => {
            const item = doc.data() as TNetworkItem;
            items[item.id] = {
              ...item,
              connections: [],
              content: item.content.map((c) => {
                
              })
            }
          })
        })
      }
    };

    fetchData();
  }, []);

  function processMap({ locations, items }: TMapDataForm): {
    nodes: TNode[];
    links: TLink[];
  } {
    const nodes: TNode[] = [];
    const links: TLink[] = [];
    Object.values(locations).forEach((location) =>
      nodes.push({
        id: location.id,
        name: location.name,
        group: location.id,
        location: true,
      })
    );
    Object.values(items).forEach((item) => {
      nodes.push({ id: item.id, name: item.name, group: item.parentId });
      links.push({
        source: item.parentId,
        target: item.id,
        group: item.parentId,
      });
      Object.values(item.connections).forEach((connection) => {
        if (connection.isSource)
          links.push({
            source: item.id,
            target: connection.partnerId,
            group: item.parentId,
          });
      });
    });

    return { nodes, links };
  }

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        width={450}
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
            // onClick={upload}
          >
            Upload
          </Menu.Item>
          <Menu.Item
            icon={<SyncOutlined />}
            title="check"
            // onClick={checkAgainstLocal}
          >
            Check
          </Menu.Item>
          <Menu.Item
            icon={<UndoOutlined />}
            title="undo"
            // onClick={() => {
            //   const reset = [...initialData!];
            //   setSelected("new-location");
            //   setData(reset);
            //   console.log(reset);
            // }}
          >
            Reset
          </Menu.Item>
        </Menu>
        <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
          <Input
            onChange={(event) => setCheckItemId(event.target.value)}
            value={checkItemId}
          />
          {map.items[checkItemId] ? map.items[checkItemId].name : "N/A"}
        </Space>
        <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
          <Input
            ref={pathRef}
            placeholder="custom file path"
            style={{ width: 450 }}
            defaultValue="/Users/sage/Google Drive/ASSOC CONTENT"
            onPressEnter={() => setFilePath(pathRef?.current?.state.value)}
          />
        </Space>
        {/* {selected ? <Editor selected={selected} /> : null} */}
      </Sider>
      <Layout className="site-layout">
        <Content style={{ height: "100vh" }}>
          <ForceGraph3D
            height={windowDims.height}
            width={windowDims.width - 450}
            graphData={
              map !== { locations: {}, items: {} } ? processMap(map) : undefined
            }
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
