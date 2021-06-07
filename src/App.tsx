/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect, useRef } from "react";
const fs = window.require("fs");
const deepEqual = window.require("deep-equal");
const { dialog } = window.require("electron").remote;
import firebase from "firebase";
import Graph from "node-dijkstra";
import {
  Menu,
  Layout,
  Typography,
  Button,
  Space,
  Input,
  message,
  Tabs,
  Modal,
} from "antd";
import {
  LoadingOutlined,
  UploadOutlined,
  LoginOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  UndoOutlined,
  FolderOpenOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { v4 as uuid } from "uuid";
// import { LocationEditor, ItemEditor } from "./Editors";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import useWindowDims from "./useWindowDims";
import indexOfId from "./indexOfId";
import "antd/dist/antd.css";
import MapEditor from "./editors/MapEditor";
// import AdsEditor from "./editors/AdsEditor";
// import FeedbackEditor from "./editors/FeedbackEditor";
// import HistoryEditor from "./editors/HistoryEditor";
// import IdeasEditor from "./editors/IdeasEditor";
// import ReportsEditor from "./editors/ReportsEditor";
// import UsersEditor from "./editors/UsersEditor";

// TODO literally just kys
// TODO start from scratch to better use firestore's abilities

const SIDER_WIDTH = 450;

const { Content, Sider } = Layout;
const { Title } = Typography;

function App(): JSX.Element {
  const [login, setLogin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const userRef = useRef<Input>(null);
  const passwordRef = useRef<Input>(null);
  // const [networkState, setNetworkState] = useState<TNetworkData>();
  // const [history, setHistory] = useState<TDataForm[]>();
  const [uploading, setUploading] = useState(false);
  const [filePath, setFilePath] = useState(
    "/Users/sage/Google Drive/ASSOC CONTENT"
  );
  const [networkMap, setNetworkMap] = useState<TMap>();
  const [localMap, setLocalMap] = useState<TMap>();

  useEffect(() => {
    const fetchData = async () => {
      if (!localMap) {
        console.log("huh");
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
        await firebase
          .firestore()
          .collection("items")
          .get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              const networkItem = doc.data() as TNetworkItem;
              const localItem = {
                ...networkItem,
                connections: [],
                content: networkItem.content.map((c) => ({
                  ...c,
                  changed: false,
                })),
              };
              items[localItem.id] = localItem;
              locations[localItem.locationId].items.push(localItem.id);
            });
          });
        const connections: Record<string, TLocalConnection> = {};
        await firebase
          .firestore()
          .collection("connections")
          .get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              const connection = doc.data() as TNetworkConnection;
              connections[connection.id] = connection;
              items[connection.sourceId].connections.push({
                id: connection.id,
                isSource: true,
              });
              items[connection.targetId].connections.push({
                id: connection.id,
                isSource: false,
              });
            });
          });
        setLocalMap({ locations, items, connections });
        setNetworkMap({ locations, items, connections });
      }
    };
    fetchData();
  }, [loggedIn]);

  // const windowDims = useWindowDims();

  // const pathRef = useRef<Input>(null);

  // function update(newMap: TMapDataForm) {
  //   return;
  // }

  // useEffect(() => {
  //   console.log(map);
  //   // Load data from firestore and process it to match the Forms
  //   if (!map.items.test)
  //     firebase
  //       .firestore()
  //       .collection("map")
  //       .get()
  //       .then(
  //         (snapshot) => {
  //           const raw: TLocation[] = [];
  //           snapshot.forEach((doc) => {
  //             raw.push(doc.data() as TLocation);
  //           });
  //           setNetworkState([...raw]);
  //           const processed = raw.map((location) => ({
  //             ...location,
  //             items: Object.values(location.items).map((item) => ({
  //               id: item.id,
  //               name: item.name,
  //               description: item.description,
  //               parentId: item.parentId,
  //               connections: Object.values(item.connections),
  //               content: item.content.map((content) => {
  //                 switch (content.type) {
  //                   case "image":
  //                     return {
  //                       ...content,
  //                       changed: false,
  //                     };
  //                   case "video":
  //                     return {
  //                       ...content,
  //                       changed: false,
  //                     };
  //                   case "map":
  //                     return {
  //                       ...content,
  //                       changed: false,
  //                     };
  //                 }
  //               }),
  //             })),
  //             minD: undefined,
  //           }));
  //           setData([...processed]);
  //           setInitialData([...processed]);
  //           processed.forEach((location) => {
  //             location.items.forEach((item) => updateItemLookUp(item));
  //           });
  //         },
  //         (e) => console.error(e)
  //       );
  // });

  // function updateData(
  //   update: TLocationForm | TItemForm,
  //   prevData: (string | TLocationForm) | TItemForm
  // ) {
  //   if (data) {
  //     const newData = [...data];
  //     if ("items" in update) {
  //       // Update itemLookUp and sync connections across items
  //       update.items.forEach((item) => updateItemLookUp(item));
  //       const index = indexOfId(newData, update.id);
  //       if (
  //         index !== undefined &&
  //         typeof prevData !== "string" &&
  //         "items" in prevData
  //       ) {
  //         // If the location already existed, then check for new and deleted connections
  //         newData[index] = update;
  //         update.items.forEach((item) => {
  //           const prevItemIndex = indexOfId(prevData.items, item.id);
  //           const prevConnections = prevItemIndex
  //             ? newData[index].items[prevItemIndex!].connections
  //             : undefined;
  //           console.log({ prevItemIndex, prevConnections });
  //           item.connections.forEach((connection) => {
  //             // If this is a new connection add it to the partner
  //             if (prevConnections && !prevConnections.includes(connection)) {
  //               const partner = itemLookUp![connection.partnerId];
  //               const parentIndex = indexOfId(newData, partner.parentId);
  //               const parent = newData[parentIndex!];
  //               const partnerIndex = indexOfId(parent.items, partner.id);
  //               const connectionMirror = {
  //                 id: connection.id,
  //                 isSource: !connection.isSource,
  //                 key: connection.key,
  //                 partnerId: item.id,
  //               };
  //               newData[parentIndex!].items[partnerIndex!].connections.push(
  //                 connectionMirror
  //               );
  //             }
  //           });
  //           if (prevConnections)
  //             prevConnections.forEach((connection) => {
  //               // If there's a connection that got deleted remove it from the partner
  //               if (!item.connections.includes(connection)) {
  //                 const partner = itemLookUp![connection.partnerId];
  //                 const parentIndex = indexOfId(newData, partner.parentId);
  //                 const parent = newData[parentIndex!];
  //                 const partnerIndex = indexOfId(parent.items, partner.id);
  //                 const connectionIndex = indexOfId(
  //                   partner.connections,
  //                   connection.id
  //                 );
  //                 newData[parentIndex!].items[partnerIndex!].connections.splice(
  //                   connectionIndex!,
  //                   1
  //                 );
  //               }
  //             });
  //         });
  //         const prevItems = prevData.items;
  //         prevItems.forEach((item) => {
  //           if (
  //             !update.items.map((updateItem) => updateItem.id).includes(item.id)
  //           ) {
  //             // If an item got deleted then remove all its connections from their partners
  //             item.connections.forEach((connection) => {
  //               const partner = itemLookUp![connection.partnerId];
  //               const parentIndex = indexOfId(newData, partner.parentId);
  //               const parent = newData[parentIndex!];
  //               const partnerIndex = indexOfId(parent.items, partner.id);
  //               const connectionIndex = indexOfId(
  //                 partner.connections,
  //                 connection.id
  //               );
  //               newData[parentIndex!].items[partnerIndex!].connections.splice(
  //                 connectionIndex!,
  //                 1
  //               );
  //             });
  //           }
  //         });
  //       } else {
  //         newData.push(update);
  //         // If the location is new then just add all connections to their partners
  //         update.items.forEach((item) => {
  //           updateItemLookUp(item);
  //           item.connections.forEach((connection) => {
  //             const partner = itemLookUp![connection.partnerId];
  //             const parentIndex = indexOfId(newData, partner.parentId);
  //             const parent = newData[parentIndex!];
  //             const partnerIndex = indexOfId(parent.items, partner.id);
  //             const connectionMirror = {
  //               id: connection.id,
  //               isSource: !connection.isSource,
  //               key: connection.key,
  //               partnerId: item.id,
  //             };
  //             newData[parentIndex!].items[partnerIndex!].connections.push(
  //               connectionMirror
  //             );
  //           });
  //         });
  //       }
  //     } else {
  //       // Update itemLookUp and check for new and deleted connections
  //       updateItemLookUp(update);
  //       const parentIndex = indexOfId(newData, update.parentId);
  //       const index = indexOfId(newData[parentIndex!].items, update.id);
  //       if (
  //         index !== undefined &&
  //         typeof prevData !== "string" &&
  //         "connections" in prevData
  //       ) {
  //         // If the item already existed, then check for new and deleted connections
  //         newData[parentIndex!].items[index] = update;
  //         const prevConnections = prevData.connections;
  //         update.connections.forEach((connection) => {
  //           if (prevConnections && !prevConnections.includes(connection)) {
  //             // If this is a new connection add it to the partner
  //             const partner = itemLookUp![connection.partnerId];
  //             const parentIndex = indexOfId(newData, partner.parentId);
  //             const parent = newData[parentIndex!];
  //             const partnerIndex = indexOfId(parent.items, partner.id);
  //             const connectionMirror = {
  //               id: connection.id,
  //               isSource: !connection.isSource,
  //               key: connection.key,
  //               partnerId: update.id,
  //             };
  //             newData[parentIndex!].items[partnerIndex!].connections.push(
  //               connectionMirror
  //             );
  //           }
  //         });
  //         if (prevConnections)
  //           prevConnections.forEach((connection) => {
  //             if (!update.connections.includes(connection)) {
  //               // If there's a connection that got deleted remove it from the partner
  //               const partner = itemLookUp![connection.partnerId];
  //               const parentIndex = indexOfId(newData, partner.parentId);
  //               const parent = newData[parentIndex!];
  //               const partnerIndex = indexOfId(parent.items, partner.id);
  //               const connectionIndex = indexOfId(
  //                 partner.connections,
  //                 connection.id
  //               );
  //               console.log({
  //                 partnerId: connection.partnerId,
  //                 partner,
  //                 parentIndex,
  //                 parent,
  //                 partnerIndex,
  //                 connectionIndex,
  //               });
  //               newData[parentIndex!].items[partnerIndex!].connections.splice(
  //                 connectionIndex!,
  //                 1
  //               );
  //             }
  //           });
  //       } else {
  //         // If the item is new then just add all connections to their partners
  //         newData[parentIndex!].items.push(update);
  //         update.connections.forEach((connection) => {
  //           const partner = itemLookUp![connection.partnerId];
  //           const parentIndex = indexOfId(newData, partner.parentId);
  //           const parent = newData[parentIndex!];
  //           const partnerIndex = indexOfId(parent.items, partner.id);
  //           const connectionMirror = {
  //             id: connection.id,
  //             isSource: !connection.isSource,
  //             key: connection.key,
  //             partnerId: update.id,
  //           };
  //           newData[parentIndex!].items[partnerIndex!].connections.push(
  //             connectionMirror
  //           );
  //         });
  //       }
  //     }
  //     setData(newData);
  //   }
  // }

  // function deleteLocation(location: TLocationForm) {
  //   if (data) {
  //     const newData = [...data];
  //     location.items.forEach(({ connections }) => {
  //       connections.forEach((connection) => {
  //         const partner = itemLookUp![connection.partnerId];
  //         const parentIndex = indexOfId(newData, partner.parentId);
  //         const parent = newData[parentIndex!];
  //         const partnerIndex = indexOfId(parent.items, partner.id);
  //         const connectionIndex = indexOfId(partner.connections, connection.id);
  //         newData[parentIndex!].items[partnerIndex!].connections.splice(
  //           connectionIndex!,
  //           1
  //         );
  //       });
  //     });
  //     const idx = indexOfId(newData, location.id);
  //     newData.splice(idx!, 1);
  //     setSelected("new-location");
  //     setData(newData);
  //   }
  // }

  // function Editor({ selected }: { selected: string }): JSX.Element | null {
  //   if (selected === "new-location") {
  //     return (
  //       <LocationEditor filePath={filePath} data={uuid()} submit={updateData} />
  //     );
  //   }
  //   const index = indexOfId(data!, selected);
  //   const object = index !== undefined ? data![index] : itemLookUp![selected];
  //   if ("items" in object) {
  //     return (
  //       <LocationEditor
  //         deleteLocation={deleteLocation}
  //         filePath={filePath}
  //         data={object}
  //         submit={updateData}
  //       />
  //     );
  //   } else {
  //     return (
  //       <div style={{ margin: 8, overflow: "auto" }}>
  //         <Title level={3}>Edit Item</Title>
  //         <ItemEditor filePath={filePath} data={object} submit={updateData} />
  //       </div>
  //     );
  //   }
  // }

  // async function upload() {
  //   if (data && networkState) {
  //     console.log("NETWORK STATE BEGINNING");
  //     console.log(networkState);
  //     setUploading(true);
  //     const graph = new Graph();
  //     // Go over every item
  //     for (const { items } of data) {
  //       for (const { id, parentId, connections, content } of items) {
  //         // Add all the nodes so for dijkstras
  //         graph.addNode(
  //           id,
  //           Object.fromEntries(
  //             connections.map(({ partnerId }) => [partnerId, 1])
  //           )
  //         );
  //         // Upload all the changed content
  //         for (const contentItem of content) {
  //           if (contentItem.changed) {
  //             contentItem.changed = false;
  //             switch (contentItem.type) {
  //               case "image": {
  //                 await firebase
  //                   .storage()
  //                   .ref(`${parentId}/${id}/${contentItem.id}.jpeg`)
  //                   .put(
  //                     fs.readFileSync(
  //                       `${filePath}/${parentId}/${id}/${contentItem.id}.jpeg`
  //                     )
  //                   );
  //                 break;
  //               }
  //               case "video": {
  //                 await firebase
  //                   .storage()
  //                   .ref(`${parentId}/${id}/${contentItem.id}.jpeg`)
  //                   .put(
  //                     fs.readFileSync(
  //                       `${filePath}/${parentId}/${id}/${contentItem.id}.jpeg`
  //                     )
  //                   );
  //                 await firebase
  //                   .storage()
  //                   .ref(`${parentId}/${id}/${contentItem.id}.mp4`)
  //                   .put(
  //                     fs.readFileSync(
  //                       `${filePath}/${parentId}/${id}/${contentItem.id}.mp4`
  //                     )
  //                   );
  //               }
  //             }
  //           }
  //         }
  //         // Delete the deleted content
  //         // console.log("NETWORK STATE");
  //         // console.log(networkState);
  //         const initLocationIdx = indexOfId(networkState, parentId);
  //         const initLocation =
  //           initLocationIdx !== undefined
  //             ? networkState[initLocationIdx]
  //             : undefined;
  //         const initItem = initLocation ? initLocation.items[id] : undefined;
  //         // console.log("--------------------");
  //         // console.log(initLocationIdx);
  //         // console.log(initLocation);
  //         // console.log(initItemIdx);
  //         // console.log(initItem);
  //         // console.log("--------------------");
  //         if (initItem) {
  //           const idsToCheck = content.map((c) => c.id);
  //           for (const contentItem of initItem.content) {
  //             // console.log("--------------------");
  //             // console.log(content);
  //             // console.log(contentItem);
  //             // console.log("--------------------");
  //             if (!idsToCheck.includes(contentItem.id)) {
  //               switch (contentItem.type) {
  //                 case "image": {
  //                   await firebase
  //                     .storage()
  //                     .ref(`${parentId}/${id}/${contentItem.id}.jpeg`)
  //                     .delete();
  //                   break;
  //                 }
  //                 case "video": {
  //                   await firebase
  //                     .storage()
  //                     .ref(`${parentId}/${id}/${contentItem.id}.jpeg`)
  //                     .delete();
  //                   await firebase
  //                     .storage()
  //                     .ref(`${parentId}/${id}/${contentItem.id}.mp4`)
  //                     .delete();
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //     // Delete all deleted locations
  //     for (const location of networkState) {
  //       if (!data.map((l) => l.id).includes(location.id)) {
  //         await firebase
  //           .firestore()
  //           .collection("master")
  //           .doc(location.id)
  //           .delete();
  //       }
  //     }
  //     const uploadData = data.map((location) => ({
  //       ...location,
  //       items: Object.fromEntries(
  //         location.items.map((item) => [
  //           item.id,
  //           {
  //             ...item,
  //             parentName: location.name,
  //             connections: Object.fromEntries(
  //               item.connections.map((connection) => [
  //                 connection.id,
  //                 {
  //                   ...connection,
  //                   parentId: itemLookUp![connection.partnerId].parentId,
  //                 },
  //               ])
  //             ),
  //             content: item.content.map((contentItem) => {
  //               switch (contentItem.type) {
  //                 case "image": {
  //                   return {
  //                     ...contentItem,
  //                     changed: undefined,
  //                   };
  //                 }
  //                 case "video": {
  //                   return {
  //                     ...contentItem,
  //                     changed: undefined,
  //                   };
  //                 }
  //                 case "map": {
  //                   return {
  //                     ...contentItem,
  //                     changed: undefined,
  //                   };
  //                 }
  //               }
  //             }),
  //           },
  //         ])
  //       ),
  //       minD: Object.fromEntries(
  //         data.map((otherLocation) => [
  //           otherLocation.id,
  //           location.id === otherLocation.id
  //             ? 0
  //             : Math.min(
  //                 ...location.items.map((item) =>
  //                   Math.min(
  //                     ...otherLocation.items.map(
  //                       (otherItem) =>
  //                         graph.path(item.id, otherItem.id).length - 1
  //                     )
  //                   )
  //                 )
  //               ),
  //         ])
  //       ),
  //     }));
  //     console.log(uploadData);
  //     for (const location of uploadData) {
  //       await firebase
  //         .firestore()
  //         .collection("master")
  //         .doc(location.id)
  //         .set(location);
  //     }
  //     setNetworkState(uploadData);
  //     setUploading(false);
  //   }
  // }

  // async function checkAgainstLocal() {
  //   firebase
  //     .firestore()
  //     .collection("master")
  //     .get()
  //     .then((snapshot) => {
  //       const raw: TLocation[] = [];
  //       snapshot.forEach((doc) => {
  //         raw.push(doc.data() as TLocation);
  //       });
  //       console.log(raw);
  //       const processed = raw.map((location) => ({
  //         ...location,
  //         items: Object.values(location.items).map((item) => ({
  //           id: item.id,
  //           name: item.name,
  //           description: item.description,
  //           parentId: item.parentId,
  //           connections: Object.values(item.connections),
  //           content: item.content.map((content) => {
  //             switch (content.type) {
  //               case "image":
  //                 return {
  //                   ...content,
  //                   changed: false,
  //                 };
  //               case "video":
  //                 return {
  //                   ...content,
  //                   changed: false,
  //                 };
  //               case "map":
  //                 return {
  //                   ...content,
  //                   changed: false,
  //                 };
  //             }
  //           }),
  //         })),
  //         minD: undefined,
  //       }));
  //       console.log(processed);
  //       const ordered = data?.map(({ id }) => {
  //         const idx = indexOfId(processed, id);
  //         return idx !== undefined ? processed[idx] : "MISSING";
  //       });
  //       if (deepEqual(data, ordered) && ordered?.length === processed.length) {
  //         message.success("Equal");
  //         console.log("sakdjflasdkjfas;ldj;asld");
  //         console.log(ordered);
  //         console.log(data);
  //       } else {
  //         console.log("---------LOCAL----------");
  //         console.log(data);
  //         console.log("------------------------");
  //         console.log("--------NETWORK---------");
  //         console.log(ordered);
  //         console.log("------------------------");
  //         message.error("Not equal");
  //       }
  //     });
  // }

  function loadFilePath() {
    const path = dialog.showOpenDialogSync({
      properties: ["openDirectory"],
    }) as string[] | undefined;
    if (path) {
      setFilePath(path[0]);
      message.success(path[0]);
    }
  }

  return (
    <Layout
      style={{ backgroundColor: "white", height: "100vh", overflow: "auto" }}
    >
      <Sider width={450} collapsed={true} style={{ backgroundColor: "white" }}>
        <Menu selectable={false}>
          <Menu.Item
            icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
            title="Upload"
          />
          <Menu.Item icon={<SafetyCertificateOutlined />} title="Check" />
          <Menu.Item icon={<UndoOutlined />} title="Undo" />
          <Menu.Item
            icon={<FolderOpenOutlined />}
            title={filePath}
            onClick={loadFilePath}
          />
        </Menu>
      </Sider>
      <Content>
        <Tabs
          defaultActiveKey="map"
          tabBarExtraContent={{
            left: (
              <Button
                style={{ marginRight: 16, marginLeft: 16 }}
                onClick={() => {
                  if (loggedIn) {
                    firebase
                      .auth()
                      .signOut()
                      .then(() => {
                        setLoggedIn(false);
                        message.success("Logged out");
                      })
                      .catch((error) => {
                        console.error(error);
                        message.error("Error logging out");
                      });
                  } else {
                    setLogin(true);
                  }
                }}
                icon={loggedIn ? <LogoutOutlined /> : <LoginOutlined />}
              >
                {loggedIn ? "Log Out" : "Log In"}
              </Button>
            ),
          }}
        >
          <Tabs.TabPane tab="Map" key="map">
            {localMap && (
              <MapEditor {...{ localMap, setLocalMap, filePath, loggedIn }} />
            )}
          </Tabs.TabPane>
          {/* <Tabs.TabPane tab="Ads" key="ads">
            <AdsEditor data={data} update={update} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Users" key="users">
            <UsersEditor data={data} update={update} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Feedback" key="feedback">
            <FeedbackEditor data={data} update={update} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Suggestions" key="suggestions">
            <IdeasEditor data={data} update={update} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Reports" key="reports">
            <ReportsEditor data={data} update={update} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="History" key="history">
            <HistoryEditor data={data} update={update} />
          </Tabs.TabPane> */}
        </Tabs>
      </Content>
      <Modal
        title="Login"
        visible={login}
        onCancel={() => setLogin(false)}
        onOk={() => {
          firebase
            .auth()
            .signInWithEmailAndPassword(
              userRef.current?.state.value,
              passwordRef.current?.state.value
            )
            .then(() => {
              setLoggedIn(true);
              setLogin(false);
              message.success("Logged in");
            })
            .catch((error) => {
              console.error(error);
              message.error("Error logging in");
            });
        }}
      >
        <Input style={{ marginBottom: 16 }} ref={userRef} />
        <Input ref={passwordRef} />
      </Modal>
    </Layout>
  );
}

export default App;
