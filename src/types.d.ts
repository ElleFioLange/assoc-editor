declare module "uuid";

type TImage = {
  type: "image";
  id: string;
  name: string;
  uri: string;
  w: number;
  h: number;
};

type TVideo = {
  type: "video";
  id: string;
  name: string;
  videoUri: string;
  posterUri: string;
  w: number;
  h: number;
};

type TMap = {
  type: "map";
  id: string;
  name: string;
  lat: number;
  lon: number;
  viewDelta: number;
  description: string;
};

type TContent = TImage | TVideo | TMap;

type TConnection = {
  id: string;
  key: string;
  isSource: boolean;
  partnerId: string;
};

type TItem = {
  id: string;
  name: string;
  description: string;
  parentId: string;
  parentName: string;
  connections: Record<string, TConnection>;
  content: TContent[];
  link?: string;
};

type TLocation = {
  id: string;
  name: string;
  description: string;
  minD: Record<string, number>;
  items: Record<string, TItem>;
};

type TImageForm = {
  changed: boolean;
  type: "image";
  id: string;
  name: string;
  path: string;
  w: number;
  h: number;
};

type TVideoForm = {
  changed: boolean;
  type: "video";
  id: string;
  name: string;
  posterPath: string;
  videoPath: string;
  w: number;
  h: number;
};

type TMapForm = {
  changed: boolean;
  type: "map";
  id: string;
  name: string;
  lat: number;
  lon: number;
  viewDelta: number;
  description: string;
};

type ContentType = "image" | "video" | "map";

type TContentForm = TImageForm | TVideoForm | TMapForm;

type TConnectionForm = {
  id: string;
  key: string;
  isSource: boolean;
  partnerId: string;
};

type TItemForm = {
  id: string;
  name: string;
  description: string;
  parentId: string;
  connections: TConnectionForm[];
  content: TContentForm[];
  link?: string;
};

type TLocationForm = {
  id: string;
  name: string;
  description: string;
  items: TItemForm[];
};

type TNode = {
  id: string;
  name: string;
  group: string;
  location?: boolean;
  color?: string;
};

type TLink = { source: string; target: string; group: string };
