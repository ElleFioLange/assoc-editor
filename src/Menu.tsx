/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState } from "react";
import { Menu as AMenu, Space, Input, Typography } from "antd";
import { PlusSquareOutlined } from "@ant-design/icons";
import { v4 as uuid } from "uuid";
import { LocationEditor, ItemEditor } from "./Editors";
import "antd/dist/antd.css";

const { Title } = Typography;

export default function Menu({
  data,
  setData,
  itemLookUp,
  updateItemLookUp,
  selected,
  setSelected,
}: {
  data: TLocationForm[] | undefined;
  setData: (data: TLocationForm[]) => void;
  itemLookUp: Record<string, TItemForm> | undefined;
  updateItemLookUp: (item: TItemForm) => void;
  selected: string;
  setSelected: (selected: string) => void;
}): JSX.Element {
  const [checkItemId, setCheckItemId] = useState("");
  // const [selected, setSelected] = useState<string>("new-location");

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
    <>
      <AMenu selectable={false}>
        <AMenu.Item
          icon={<PlusSquareOutlined />}
          title="new-location"
          onClick={() => setSelected("new-location")}
        >
          New Location
        </AMenu.Item>
      </AMenu>
      <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
        <Input
          onChange={(event) => setCheckItemId(event.target.value)}
          value={checkItemId}
        />
        {itemLookUp && itemLookUp[checkItemId]
          ? itemLookUp[checkItemId].name
          : "N/A"}
      </Space>
      {selected ? <Editor selected={selected} /> : null}
    </>
  );
}
