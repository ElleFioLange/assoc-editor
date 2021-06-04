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

type TNetworkMap = {
  type: "map";
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  viewDelta: number;
};

type TNetworkContent = TNetworkImage | TNetworkVideo | TNetworkMap;
type ContentType = "image" | "video" | "map";

type TNetworkConnection = {
  id: string;
  key: string;
  preReqs?: string[];
  isSource: boolean;
  partnerId: string;
  ad?: [{ adId: string; advertiserId: string }] | [string, string, number][];
};

type TNetworkItem = {
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
  parentId: string;
  parentName: string;
  connections: import("firebase").default.firestore.DocumentReference<TNetworkConnection>[];
  content: TNetworkContent[];
  link?: string;
};

type TNetworkLocation = {
  id: string;
  name: string;
  description: string;
  minD: Record<string, number>;
  items: import("firebase").default.firestore.DocumentReference<TNetworkItem>[];
};

// ============== LOCAL MAP ===============

type TLocalImage = {
  changed: boolean;
  type: "image";
  id: string;
  name: string;
  width: number;
  height: number;
};

type TLocalVideo = {
  changed: boolean;
  type: "video";
  id: string;
  name: string;
  posterWidth: number;
  posterHeight: number;
  videoWidth: number;
  videoHeight: number;
};

type TLocalMap = {
  changed: boolean;
  type: "map";
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  viewDelta: number;
};

type TLocalContent = TLocalImage | TLocalVideo | TLocalMap;

type TLocalConnection = {
  id: string;
  key: string;
  preReqs?: string[];
  isSource: boolean;
  partnerId: string;
  ad?: [string, string] | [string, string, number][];
};

type TLocalItem = {
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
  parentId: string;
  connections: string[];
  content: TLocalContent[];
  link?: string;
};

type TLocalLocation = {
  id: string;
  name: string;
  description: string;
  items: string[];
};

// ============== DATA & FORMS ===============

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

type TIdea = TFeedback;

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

type TMapData = {
  locations: Record<string, TLocalLocation>;
  items: Record<string, TLocalItem>;
  connections: Record<string, TLocalConnection>;
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
