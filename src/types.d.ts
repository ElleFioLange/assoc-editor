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
  ext: string;
  width: number;
  height: number;
};

type TLocalVideo = {
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

type TLocalCoord = {
  changed: boolean;
  type: "map";
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  viewDelta: number;
};

type TLocalContent = TLocalImage | TLocalVideo | TLocalCoord;

type TLocalConnection = TNetworkConnection;

// To make entering connections simpler the forms have a different data struct
type TConnectionForm = {
  id: string;
  key: string;
  preReqs?: string[];
  partnerId: string;
  isSource: boolean;
  ad?: [{ adId: string; advertiserId: string }] | [string, string, number][];
}

type TLocalItem = {
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
  locationId: string;
  connections: Record<string, TLocalConnection>;
  content: TLocalContent[];
  link?: string;
};

type TLocalLocation = {
  id: string;
  name: string;
  description: string;
  items: Record<string, TLocalItem>;
};

// ============== OTHER DATA STRUCTS ===============

type TMap = {
  locations: Record<string, TLocalLocation>;
  items: Record<string, TLocalItem>;
  connections: Record<string, TLocalConnection>;
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

type TCallbacks = {
  uploadCB: () => void;
  downloadCB: () => void;
  checkCB: () => void;
  undoCB: () => void;
};

// ============== GRAPH & SELECTION ===============

type TSelection = {
  type: "location" | "item" | "connection";
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
