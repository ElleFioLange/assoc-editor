declare module "uuid";

type TImageData = {
  type: "image";
  id: string;
  name: string;
  uri: string;
  w: number;
  h: number;
};

type TVideoData = {
  type: "video";
  id: string;
  name: string;
  videoUri: string;
  posterUri: string;
  w: number;
  h: number;
};

type TMapData = {
  type: "map";
  id: string;
  name: string;
  lat: number;
  lon: number;
  viewDelta: number;
  description: string;
};

type TContentData = TImageData | TVideoData | TMapData;

type TConnectionData = {
  id: string;
  key: string;
  isSource: boolean;
  partnerId: string;
};

type TItemData = {
  id: string;
  name: string;
  description: string;
  parentId: string;
  parentName: string;
  connections: Record<string, TConnectionData>;
  content: TContentData[];
  link?: string;
};

type TLocationData = {
  id: string;
  name: string;
  description: string;
  minD: Record<string, number>;
  items: Record<string, TItemData>;
};

type TImageFormData = {
  type: "image";
  id: string;
  name: string;
  path: string;
};

type TVideoFormData = {
  type: "video";
  id: string;
  name: string;
  posterPath: string;
  videoPath: string;
};

type TMapFormData = {
  type: "map";
  id: string;
  name: string;
  lat: number;
  lon: number;
  viewDelta: number;
  description: string;
};

type ContentType = "image" | "video" | "map";

type TContentFormData = TImageFormData | TVideoFormData | TMapFormData;

type TConnectionFormData = {
  id: string;
  key: string;
  isSource: boolean;
  partnerId: string;
};

type TItemFormData = {
  id: string;
  name: string;
  description: string;
  parentId: string;
  connections: Record<string, TConnectionFormData>;
  content: TContentFormData[];
  link?: string;
};

type TLocationFormData = {
  id: string;
  name: string;
  description: string;
  items: TItemFormData[];
};

type TNode = {
  id: string;
  name: string;
  group: string;
  location?: boolean;
  color?: string;
};

type TLink = { source: string; target: string; group: string };
