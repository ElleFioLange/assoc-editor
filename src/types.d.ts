declare module "react-graph-vis";
declare module "uuid";

type ImageInfo = {
  type: "image";
  uri: string;
  w: number;
  h: number;
};

type VideoInfo = {
  type: "video";
  videoUri: string;
  posterUri: string;
  w: number;
  h: number;
};

type MapInfo = {
  type: "map";
  lat: number;
  lon: number;
  viewDelta: number;
  title: string;
  description: string;
};

type ContentInfo = ({ type: string } & ImageInfo) | VideoInfo | MapInfo;

type ConnectionData = {
  id: string;
  isSource: boolean;
  sourceName: string;
  sourceId: string;
  sinkName: string;
  sinkId: string;
  key: string;
};

type ItemData = {
  id: string;
  name: string;
  description: string;
  parentName: string;
  parentId: string;
  content: ContentInfo[];
  connections: Record<string, ConnectionData>;
  link?: string;
};

type LocationData = {
  id: string;
  name: string;
  description: string;
  minD: Record<string, number>;
  items: Record<string, ItemData>;
};

type ImageFormData = {
  type: "image";
  file: import("antd/lib/upload/interface").UploadFile;
};

type VideoFormData = {
  type: "video";
  poster: import("antd/lib/upload/interface").UploadFile;
  video: import("antd/lib/upload/interface").UploadFile;
};

type MapFormData = {
  type: "map";
  lat: number;
  lon: number;
  viewDelta: number;
  title: string;
  description: string;
};

type ContentFormData = ImageFormData | VideoFormData | MapFormData;

type ConnectionFormData = {
  isSource: boolean;
  id: string;
};

type ItemFormData = {
  name: string;
  description: string;
  content: ContentFormData[];
  connections: ConnectionFormData[];
  link: string;
};

type TNode = {
  id: string;
  name: string;
  group: string;
  location?: boolean;
  color?: string;
};

type TLink = { source: string; target: string; group: string };
