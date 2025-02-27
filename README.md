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

## Data Structure

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

