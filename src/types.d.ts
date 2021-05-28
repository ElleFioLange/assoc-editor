declare module "uuid";
declare module "indexOfId";

// ============== NETWORK MAP ===============

type TImage = {
  type: "image";
  id: string;
  name: string;
  uri: string;
  width: number;
  height: number;
};

type TVideo = {
  type: "video";
  id: string;
  name: string;
  posterUri: string;
  posterWidth: number;
  posterHeight: number;
  videoUri: string;
  videoWidth: number;
  videoHeight: number;
};

type TMap = {
  type: "map";
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  viewDelta: number;
};

type TContent = TImage | TVideo | TMap;
type ContentType = "image" | "video" | "map";

type TConnection = {
  id: string;
  key: string;
  preReqs?: string[];
  isSource: boolean;
  ownerId: string;
  partnerId: string;
  ad?: [string, string] | [string, string, number][];
};

type TItem = {
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
  parentId: string;
  parentName: string;
  connections: TConnection[];
  content: TContent[];
  link?: string;
};

type TLocation = {
  id: string;
  name: string;
  description: string;
  minD: Record<string, number>;
  items: string[];
};

type TData = {
  locations: Record<string, TLocation>;
  items: Record<string, TItem>;
  advertisers: Record<string, TAdvertiser>;
  users: Record<string, TUserData>;
  ads: Record<string, TAd>;
  feedback: Record<string, TFeedback>;
  ideas: Record<string, TIdea>;
  reports: Record<string, TReport>;
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
  latitude: number;
  longitude: number;
  viewDelta: number;
};

type TContentForm = TImageForm | TVideoForm | TMapForm;

type TConnectionForm = {
  id: string;
  key: string;
  preReqs?: string[];
  isSource: boolean;
  partnerId: string;
  ad?: [string, string] | [string, string, number][];
};

type TItemForm = {
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
  parentId: string;
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
  locations: TLocation[];
  items: TItem[];
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
  saved: Record<string, boolean>;
};
