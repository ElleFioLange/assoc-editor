import React, { useState } from "react";
import { Layout, Typography } from "antd";

export default function GraphEditor({
  data,
  update,
}: {
  data: TDataForm;
  update: (newData: TDataForm) => void;
}): JSX.Element {
  return (
    <Typography.Title>Ahhhh it&apos;s unfinished ahhhhhh</Typography.Title>
  );
}

{
  /* <Layout style={{ height: "100vh" }}>
      <Sider
        width={SIDER_WIDTH}
        theme="light"
        style={{ height: "100%", overflow: "auto" }}
      >
        <Menu selectable={false}>
          <Menu.Item
            icon={<LoginOutlined />}
            title="login"
            onClick={() => {
              firebase
                .auth()
                .signInWithEmailAndPassword(
                  "sage.fio.lange@gmail.com",
                  "uncutgemswasafuckingmasterpiece"
                );
            }}
          >
            Login
          </Menu.Item>
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
          <Menu.Item
            icon={<SyncOutlined />}
            title="check"
            onClick={checkAgainstLocal}
          >
            Check
          </Menu.Item>
          <Menu.Item
            icon={<UndoOutlined />}
            title="undo"
            onClick={() => {
              const reset = [...initialData!];
              setSelected("new-location");
              setData(reset);
              console.log(reset);
            }}
          >
            Reset
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
        <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
          <Input
            ref={pathRef}
            placeholder="custom file path"
            style={{ width: 450 }}
            defaultValue="/Users/sage/Google Drive/ASSOC CONTENT"
            onPressEnter={() => setFilePath(pathRef?.current?.state.value)}
          />
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
    </Layout> */
}
