# Flowchart Builder

An interactive flowchart builder tool that leverages React Flow to create, manage, and visualize node relationships. This tool allows users to create complex flowcharts with custom node types, define relationships between nodes, and export/import flow data via JSON.

## Features

- **Drag-and-drop Interface**: Easily create and position nodes with intuitive drag-and-drop functionality
- **Relationship Management**:
  - Parent-child hierarchies
  - Custom relationship types (e.g., "triggers")
  - Automatic attachment of sub-nodes when connecting parent nodes
- **History Management**:
  - Undo/redo functionality for all actions
  - Session persistence via local storage
- **Data Import/Export**:
  - Export flowcharts as JSON -> make a flow, click on export, reset and then paste the json back.
  - Import previously saved flowcharts
  - Structured data model for nodes, relationships, and styling
- **Custom Styling**:
  - Different node types with distinct visual styles
  - Customizable edge appearances based on relationship types
  - Responsive design that works across device sizes

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/Raviikumar001/Supervaisor-Task.git

# Navigate to project directory
cd Supervaisor-Task

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

## Usage

1. **Create Nodes**: Click the toolbar buttons to add different node types (parent, child, step)
2. **Connect Nodes**: Drag from one node's handle to another to create relationships
3. **Edit Properties**: Select a node to edit its properties in the sidebar
4. **Save/Load**: Use the toolbar to export your flowchart as JSON or load a previously saved one

## Data Structure and Visual Mapping

The flowchart is represented as a JSON object with the following structure:

```json
{
  "nodes": [
    {
      "id": "node_id",
      "type": "default",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "Node Label",
        "nodeType": "parent|child|step",
        "hasChildren": true|false,
        "relationships": [
          {
            "type": "parent-child|triggers",
            "targetId": "target_node_id"
          }
        ]
      },
      "style": { /* Custom styling properties */ }
    }
  ],
  "edges": [
    {
      "id": "edge_id",
      "source": "source_node_id",
      "target": "target_node_id",
      "type": "smoothstep",
      "style": { /* Edge styling */ },
      "data": {
        "relationshipType": "parent-child|triggers"
      }
    }
  ]
}
```

### How JSON Maps to Visual Flowchart

Here's an example of how a simple JSON representation maps to a visual flowchart:

```json
{
  "nodes": [
    {
      "id": "node_1740655355966",
      "type": "default",
      "position": { "x": -39.218936603511345, "y": -18.109468301755665 },
      "data": {
        "label": "Step 5965",
        "type": "default",
        "nodeType": "step",
        "step": "",
        "parentId": "",
        "hasChildren": false,
        "relationships": []
      },
      "style": {
        "background": "#fff7ed",
        "color": "#1e293b",
        "border": "1px solid #e2e8f0",
        "padding": "8px",
        "borderRadius": "8px",
        "boxShadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "width": "auto",
        "minWidth": "180px",
        "fontSize": "14px",
        "fontWeight": "500",
        "transition": "all 0.2s ease",
        "cursor": "move"
      }
    },
    {
      "id": "node_1740655361399",
      "type": "default",
      "position": { "x": 0.41858434679197387, "y": 157.9377264333896 },
      "data": {
        "label": "Parent Node",
        "type": "default",
        "nodeType": "parent",
        "step": "",
        "parentId": "",
        "hasChildren": true,
        "relationships": []
      },
      "style": {
        "background": "#f3e8ff",
        "color": "#1e293b",
        "border": "1px solid #e2e8f0",
        "padding": "8px",
        "borderRadius": "8px",
        "boxShadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "width": "auto",
        "minWidth": "180px",
        "fontSize": "14px",
        "fontWeight": "500",
        "transition": "all 0.2s ease",
        "cursor": "move"
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1740655368480",
      "source": "node_1740655355966",
      "target": "node_1740655361399",
      "type": "smoothstep",
      "style": { "stroke": "#94a3b8", "strokeWidth": 2 },
      "data": { "relationshipType": "custom" }
    }
  ]
}
```

This JSON creates a simple flowchart with:

1. **Step Node** (node_1740655355966):
   - Position: x: -39, y: -18
   - Label: "Step 5965"
   - Type: step (with orange background #fff7ed)
   - Located at the top of the flowchart

2. **Parent Node** (node_1740655361399):
   - Position: x: 0.4, y: 157
   - Label: "Parent Node"
   - Type: parent (with purple background #f3e8ff)
   - Located below the Step node

3. **Edge** (edge_1740655368480):
   - Connects from "Step 5965" to "Parent Node"
   - Gray line (#94a3b8)
   - Custom relationship type

The visual result is a flowchart with two differently styled nodes connected by a gray line, with the nodes positioned according to their x/y coordinates.

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn-ui components
- **Flowchart Library**: React Flow
- **State Management**: Zustand

## Key Implementation Files

- `flowStore.ts`: Core state management (undo/redo)
- `FlowToolbar.tsx`: UI controls for manipulating flowcharts 
- `index.css`: Custom node styling 
- `flowStore.ts`: Relationship type definitions and handling

