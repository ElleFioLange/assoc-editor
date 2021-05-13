import React from "react";
import {
  GraphView,
  IGraphInput,
  IGraphViewProps,
  SelectionT,
  Edge,
  IEdge,
  Node,
  INode,
  GraphUtils
} from "react-digraph";

const GraphConfig = {
  NodeTypes: {
    location: {
      typeText: "Location",
      shapeId: "#location",
      shape: (
        <symbol viewBox="0 0 100 100" id="location" key="0">
          <rect width="100" height="100" rx="15" />
        </symbol>
      )
    },
    item: {
      typeText: "Item",
      shapeId: "#item",
      shape: (
        <symbol viewBox="0 0 100 100" id="item" key="0">
          <circle cx="50" cy="50" r="45" />
        </symbol>
      )
    }
  },
  NodeSubtypes: {},
  EdgeTypes: {
    defaultEdge: {
      typeText: "Default",
      shapeId: "#defaultEdge",
      shape: (
        <symbol viewBox="0 0 50 50" id="defaultEdge" key="0">
          <circle cx="25" cy="25" r="8" fill="currentColor" />
        </symbol>
      )
    }
  }
}

const NODE_KEY = "id";

class Graph extends React.Component<{}, { graph: IGraphInput; selected: SelectionT | null | undefined }> {

  constructor(props: {}) {
    super(props);

    this.state = {
      graph: {
        nodes: [],
        edges: [],
      },
      selected: null,
    }
  }

  getNodeIndex(searchNode: INode | any) {
    return this.state.graph.nodes.findIndex(node => {
      return node[NODE_KEY] === searchNode[NODE_KEY];
    });
  }

  getEdgeIndex(searchEdge: IEdge) {
    return this.state.graph.edges.findIndex(edge => {
      return (
        edge.source === searchEdge.source && edge.target === searchEdge.target
      );
    });
  }

  onSelect = (selected: SelectionT) => {
    this.setState({
      selected,
    });
  };

  onCreateNode = (x: number, y: number, event: any) => {
    const graph = this.state.graph;

    // This is just an example - any sort of logic
    // could be used here to determine node type
    // There is also support for subtypes. (see 'sample' above)
    // The subtype geometry will underlay the 'type' geometry for a node
    const type = event.type;

    const viewNode = {
      id: Date.now(),
      title: event.title,
      type,
      x,
      y,
    };

    graph.nodes = [...graph.nodes, viewNode];
    this.setState({ graph });
  };

  onUpdateNode = (viewNode: INode, updatedNodes: Map<string, INode> | null | undefined) => {
    const graph = this.state.graph;
    const i = this.getNodeIndex(viewNode);

    graph.nodes[i] = viewNode;
    this.setState({ graph });
  };

  onDeleteNode = (viewNode: INode, nodeId: string, nodeArr: INode[]) => {
    // Note: onDeleteEdge is also called from react-digraph for connected nodes
    const graph = this.state.graph;

    graph.nodes = nodeArr;

    this.deleteEdgesForNode(nodeId);

    this.setState({ graph, selected: null });
  };

  deleteEdgesForNode(nodeID: string) {
    const { graph } = this.state;
    const edgesToDelete = graph.edges.filter(
      edge => edge.source === nodeID || edge.target === nodeID
    );

    const newEdges = graph.edges.filter(
      edge => edge.source !== nodeID && edge.target !== nodeID
    );

    edgesToDelete.forEach(edge => {
      this.onDeleteEdge(edge, newEdges);
    });
  }

  onDeleteEdge = (viewEdge: IEdge, edges: IEdge[]) => {
    const graph = this.state.graph;

    graph.edges = edges;
    this.setState({
      graph,
      selected: null,
    });
  };

  onCreateEdge = (sourceViewNode: INode, targetViewNode: INode) => {
    const graph = this.state.graph;
    // This is just an example - any sort of logic
    // could be used here to determine edge type
    const type = "Default"

    const viewEdge = {
      source: sourceViewNode[NODE_KEY],
      target: targetViewNode[NODE_KEY],
      type,
    };

    // Only add the edge when the source node is not the same as the target
    if (viewEdge.source !== viewEdge.target) {
      graph.edges = [...graph.edges, viewEdge];
      this.setState({
        graph,
        selected: {
          nodes: null,
          edges: new Map([[`${viewEdge.source}_${viewEdge.target}`, viewEdge]]),
        },
      });
    }
  };

  onSwapEdge = (
    sourceViewNode: INode,
    targetViewNode: INode,
    viewEdge: IEdge
  ) => {
    const graph = this.state.graph;
    const i = this.getEdgeIndex(viewEdge);
    const edge = JSON.parse(JSON.stringify(graph.edges[i]));

    edge.source = sourceViewNode[NODE_KEY];
    edge.target = targetViewNode[NODE_KEY];
    graph.edges[i] = edge;
    // reassign the array reference if you want the graph to re-render a swapped edge
    graph.edges = [...graph.edges];

    this.setState({
      graph,
      selected: edge,
    });
  };

  render() {
    const { nodes, edges } = this.state.graph;
    const selected = this.state.selected;

    const { NodeTypes, NodeSubtypes, EdgeTypes} = GraphConfig;

    return (
      <div id="graph">
        <GraphView
          ref="GraphView"
          nodeKey={NODE_KEY}
          nodes={nodes}
          edges={edges}
          selected={selected}
          nodeTypes={NodeTypes}
          nodeSubtypes={NodeSubtypes}
          edgeTypes={EdgeTypes}
          allowMultiselect={false} // true by default, set to false to disable multi select.
          canCreateEdge={(startNode?: INode, endNode?: INode) => startNode?.type === "Item" && endNode?.type === "Item"}
          onSelect={this.onSelect}
          onCreateNode={this.onCreateNode}
          onUpdateNode={this.onUpdateNode}
          onCreateEdge={this.onCreateEdge}
          onSwapEdge={this.onSwapEdge}
          />
      </div>
    )
  }
}

export default Graph;
