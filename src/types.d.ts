declare module "uuid";
declare module "indexOfId";

// ============== NETWORK MAP ===============

type TNetworkImage = {
  type: "image";
  id: string;
  name: string;
  uri: string;
  ext: string;
  width: number;
  height: number;
};

type TNetworkVideo = {
  type: "video";
  id: string;
  name: string;
  posterUri: string;
  posterExt: string;
  posterWidth: number;
  posterHeight: number;
  videoUri: string;
  videoExt: string;
  videoWidth: number;
  videoHeight: number;
};

type TNetworkAudio = {
  
}

type TNetworkCoord = {
  type: "map";
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  viewDelta: number;
};

type TNetworkContent = TNetworkImage | TNetworkVideo | TNetworkCoord;
type ContentType = "image" | "video" | "map";

type TNetworkConnection = {
  id: string;
  key: string;
  preReqs?: string[];
  sourceId: string;
  targetId: string;
  ad?: [{ adId: string; advertiserId: string }] | [string, string, number][];
};

type TNetworkItem = {
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
  locationId: string;
  locationName: string;
  connections: Record<string, TNetworkConnection>;
  content: TNetworkContent[];
  link?: string;
};

type TNetworkLocation = {
  id: string;
  name: string;
  description: string;
  minD: Record<string, number>;
  items: Record<string, TNetworkItem>;
};

// ============== LOCAL MAP ===============

type TLocalImage = {
  type: "image";
  ext: string;
  width: number;
  height: number;
};

type TLocalVideo = {
  type: "video";
  posterExt: string;
  posterWidth: number;
  posterHeight: number;
  videoExt: string;
  videoWidth: number;
  videoHeight: number;
};

type TLocalCoord = {
  type: "map";
  description: string;
  latitude: number;
  longitude: number;
  viewDelta: number;
};

type TLocalContent = (TLocalImage | TLocalVideo | TLocalCoord) & {
  changed: boolean;
  name: string;
  id: string;
  itemId: string;
  locationId: string;
};

type TLocalConnection = TNetworkConnection & {
  changed: boolean;
};

type TLocalItem = {
  changed: boolean;
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
  locationId: string;
  locationName: string;
  connections: { id: string; isSource: boolean }[];
  content: TLocalContent[];
  link?: string;
};

type TLocalLocation = {
  changed: boolean;
  id: string;
  name: string;
  description: string;
  items: string[];
};

// ============== FORMS ===============

type TImageForm = {
  changed: boolean;
  type: "image";
  id: string;
  name: string;
  ext: string;
  width: number;
  height: number;
};

type TVideoForm = {
  changed: boolean;
  type: "video";
  id: string;
  name: string;
  posterExt: string;
  posterWidth: number;
  posterHeight: number;
  videoExt: string;
  videoWidth: number;
  videoHeight: number;
};

type TCoordForm = {
  changed: boolean;
  type: "map";
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  viewDelta: number;
};

type TContentForm = (TImageForm | TVideoForm | TCoordForm) & {
  changed: boolean;
  name: string;
  id: string;
  itemId: string;
  locationId: string;
};

type TConnectionForm = {
  changed: boolean;
  id: string;
  key: string;
  preReqs?: string[];
  isSource: boolean;
  ownerId: string;
  partnerId: string;
  ad?: [{ adId: string; advertiserId: string }] | [string, string, number][];
};

type TItemForm = {
  changed: boolean;
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
  locationId: string;
  locationName: string;
  connections: TConnectionForm[];
  content: TContentForm[];
  link?: string;
};

type TLocationForm = {
  changed: boolean;
  id: string;
  name: string;
  description: string;
  items: TItemForm[];
};

// ============== OTHER DATA STRUCTS ===============

type TMap = {
  locations: Record<string, TLocalLocation>;
  items: Record<string, TLocalItem>;
  connections: Record<string, TLocalConnection>;
  ads: Record<string, TAd>;
};

type TAdvertiser = {
  id: string;
  ads: string[];
  property: string[];
};

type TAd = {
  id: string;
  advertiserId: string;
  connections: (string | [string, number])[];
};

type TFeedback = {
  id: string;
  email: string;
  name: string;
  birthday: Date;
  timeStamp: Date;
  message: string;
};

type TReport = {
  id: string;
  reportingUserId: string;
  reportedUserId: string;
  code: string;
  timeStamp: Date;
};

type TUserData = {
  id: string;
  email: string;
  name: string;
  birthday: Date;
  curLocationId: string;
  lastFeedbackReward: string;
  reports: string[];
  locations: Record<string, string[]>;
  items: Record<string, string[]>;
  tokens: number;
  saved: Record<string, Date>;
};

// ============== GRAPH & SELECTION ===============

type TSelection = {
  type: "location" | "item";
  id: string;
};

type TNode = {
  id: string;
  name: string;
  group: string;
  location?: boolean;
  color?: string;
};

type TLink = { source: string; target: string; group: string };
