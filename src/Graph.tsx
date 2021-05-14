import Graph from "react-graph-vis";
import { v4 as uuid } from "uuid";
import React, { useState } from "react";

const options = {
  layout: {
    hierarchical: false
  },
  edges: {
    color: "#000000"
  }
};

function randomColor() {
  const red = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const green = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const blue = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return `#${red}${green}${blue}`;
}

const GraphView = (): JSX.Element => {

  const createNode = (x: number, y: number) => {
    const color = randomColor();
    setState(({ graph: { nodes, edges }, counter }) => {
      const id = counter + 1;
      const from = Math.floor(Math.random() * (counter - 1)) + 1;
      return {
        graph: {
          nodes: [
            ...nodes,
            { id, label: `Node ${id}`, color, x, y }
          ],
          edges: [
            ...edges,
            { from, to: id+1 }
          ]
        },
        counter: id,
        key: uuid(),
      }
    });
  }

  const [state, setState] = useState({
    counter: 5,
    graph: {
      nodes: [
        { id: 1, label: "Node 1", color: "#e04141" },
        { id: 2, label: "Node 2", color: "#e09c41" },
        { id: 3, label: "Node 3", color: "#e0df41" },
        { id: 4, label: "Node 4", color: "#7be041" },
        { id: 5, label: "Node 5", color: "#41e0c9" }
      ],
      edges: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
        { from: 2, to: 5 }
      ]
    },
    key: uuid(),
  })

  const events = {
    select: ({ nodes, edges }: { nodes: NodeData[], edges: EdgeData[]}) => {
      console.log("Selected nodes:");
      console.log(nodes);
      console.log("Selected edges:");
      console.log(edges);
      alert("Selected node: " + nodes);
    },
    doubleClick: ({ pointer }: { pointer: any }) => {
      createNode(pointer.canvas.x, pointer.canvas.y);
    }
  }

  const { graph } = state;

  return <Graph graph={graph} options={options} events={events} style={{ height: "100vh" }} />;

}

export default GraphView;
