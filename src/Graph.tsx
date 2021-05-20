import React from "react";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";

type GraphProps = {
  width: number;
  graphData:
    | {
        nodes: TNode[];
        links: TLink[];
      }
    | undefined;
  setSelected: (id: string) => void;
};

class Graph extends React.PureComponent<GraphProps> {
  render(): JSX.Element {
    const { width, graphData, setSelected } = this.props;
    return (
      <ForceGraph3D
        // width={width}
        graphData={graphData}
        nodeAutoColorBy="group"
        linkDirectionalArrowLength={6.5}
        linkDirectionalArrowRelPos={0.5}
        linkCurvature={0}
        linkWidth={1.15}
        // Copy the item or location id on right click
        onNodeRightClick={(node) =>
          navigator.permissions
            .query({ name: "clipboard-write" })
            .then((result) => {
              if (result.state == "granted" || result.state == "prompt") {
                navigator.clipboard.writeText(`${node.id}`);
              }
            })
        }
        onNodeClick={(node) => setSelected(node.id as string)}
        linkAutoColorBy="group"
        nodeThreeObject={(node: TNode) => {
          const sprite = new SpriteText(node.name);
          sprite.fontWeight = node.location ? "900" : "100";
          sprite.color = node.color ? node.color : "black";
          sprite.textHeight = node.location ? 12 : 8;
          return sprite;
        }}
      />
    );
  }
}

export default Graph;
