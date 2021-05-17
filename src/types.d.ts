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
  id: string;
  name: string;
  path: string;
};

type VideoFormData = {
  type: "video";
  id: string;
  name: string;
  posterPath: string;
  videoPath: string;
};

type MapFormData = {
  type: "map";
  id: string;
  name: string;
  lat: number;
  lon: number;
  viewDelta: number;
  description: string;
};

type ContentFormData = ImageFormData | VideoFormData | MapFormData;

type ConnectionFormData = {
  isSource: boolean;
  partnerId: string;
  connectionId: string;
  key: string;
};

type ItemFormData = {
  id: string;
  name: string;
  description: string;
  content: ContentFormData[];
  connections: ConnectionFormData[];
  link?: string;
};

type LocationFormData = {
  id: string;
  name: string;
  description: string;
  items: string[];
};

type TNode = {
  id: string;
  name: string;
  group: string;
  location?: boolean;
  color?: string;
};

type TLink = { source: string; target: string; group: string };
