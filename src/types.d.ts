declare module "uuid";
declare module "indexOfId";

// ============== NETWORK MAP ===============

type TImage = {
  type: "image";
  id: string;
  name: string;
  width: number;
  height: number;
};

type TVideo = {
  type: "video";
  id: string;
  name: string;
  posterWidth: number;
  posterHeight: number;
  videoWidth: number;
  videoHeight: number;
};

type TMap = {
  type: "map";
  id: string;
  name: string;
  description: string;
  coord: [number, number];
  viewDelta: number;
};

type TContent = TImage | TVideo | TMap;
type ContentType = "image" | "video" | "map";

type TAdvertiserInfo = {
  name: string;
  id: string;
  ads: string[];
};

type TAdInfo = {
  advertiser: TAdvertiserInfo;
  ad: string[] | Record<string[], number>;
};

type TConnection = {
  id: string;
  key: string;
  preReqs?: string[];
  isSource: boolean;
  partnerId: string;
  adInfo?: TAdInfo;
};

type TItem = {
  id: string;
  name: string;
  description: string;
  locationId: string;
  locationName: string;
  connections: TConnection[];
  content: TContent[];
  minDist: Record<string, number>;
  link?: string;
};

type TLocation = {
  id: string;
  name: string;
  description: string;
  items: string[];
};

type TData = {
  graph: {
    locations: TLocation[];
    items: TItem[];
  };
  ads: TAdInfo[];
  users: TUserData[];

};

// ============== LOCAL MAP ===============

type TImageForm = {
  changed: boolean;
  type: "image";
  id: string;
  name: string;
  width: number;
  height: number;
};

type TVideoForm = {
  changed: boolean;
  type: "video";
  id: string;
  name: string;
  posterWidth: number;
  posterHeight: number;
  videoWidth: number;
  videoHeight: number;
};

type TMapForm = {
  changed: boolean;
  type: "map";
  id: string;
  name: string;
  description: string;
  coord: [number, number];
  viewDelta: number;
};

type TContentForm = TImageForm | TVideoForm | TMapForm;

// No TAdvertiserInfoForm or TAdInfoForm bc they are redundant

type TConnectionForm = {
  id: string;
  key: string;
  preReqs?: string[];
  isSource: boolean;
  partnerId: string;
  adInfo?: TAdInfoForm;
};

type TItemForm = {
  id: string;
  name: string;
  description: string;
  locationId: string;
  connections: TConnectionForm[];
  content: TContentForm[];
  link?: string;
};

type TLocationForm = {
  id: string;
  name: string;
  description: string;
  items: string[];
};

type TDataForm = {
  locations: TLocationForm[];
  items: TItemForm[];
};

// ============== GRAPH ===============

type TNode = {
  id: string;
  name: string;
  group: string;
  location?: boolean;
  color?: string;
};

type TLink = { source: string; target: string; group: string };

// ============== OTHER ===============

type TFeedback = {
  id: string;
  email: string;
  name: string;
  birthday: Date;
  timeStamp: Date;
  message: string;
};

type TIdea = TFeedback;

type TAdvertiser = {
  id: string;
  ads: string[];
  property: string[];
};

type TAd = {
  id: string;
  advertiserId: string;
  connection: string;
};

type TUserData = {
  id: string;
  items: Record<string, string[]>;
  tokens: number;
  birthday: Date;
};
