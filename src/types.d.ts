declare module "react-graph-vis";
declare module "uuid";

type ContentData = {
  image?: {
    uri: string;
    w: number;
    h: number;
  };
  video?: {
    videoUri: string;
    posterUri: string;
    w: number;
    h: number;
  };
  map?: {
    latitude: number;
    longitude: number;
    viewDelta: number;
    title: string;
    description: string;
  };
};

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
  content: ContentData[];
  minD: Record<string, number>;
  numUnlocked: number;
  connections: Record<string, ConnectionData>;
  purchaseInfo: {
    static?: number;
    dynamic?: {
      maxPrice: number;
      minPrice: number;
      numNeededForMin: number;
      maxAvailable?: number;
    };
  };
  link?: string;
};

type LocationData = {
  id: string;
  name: string;
  description: string;
  minD: Record<string, number>;
  items: Record<string, ItemData>;
};

type TNode = {
  id: string;
  name: string;
  group: string;
  location?: boolean;
  color?: string;
};

type TLink = { source: string; target: string; group: string };
