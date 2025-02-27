import React, { useState } from "react";
import { Plus, Trash2, Monitor, Layers, Box, CircleDot, Link2, Undo2, Redo2, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/stores/flowStore";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const FlowToolbar = () => {
  const { 
    resetCanvas, 
    addNode, 
    importData, 
    exportData, 
    nodes, 
    createRelationship, 
    undo, 
    redo, 
    history 
  } = useFlowStore();
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeType, setNodeType] = useState<"step" | "parent" | "child">("step");
  const [stepId, setStepId] = useState("");
  const [parentId, setParentId] = useState("");
  const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState("");
  const [targetNodeId, setTargetNodeId] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  
  
  // New state for import modal
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [jsonImportText, setJsonImportText] = useState("");
  const [importError, setImportError] = useState("");

  const handleReset = () => {
    resetCanvas();
    toast({
      title: "Canvas Reset",
      description: "All nodes and connections have been cleared.",
    });
  };

  const handleAddNode = () => {
    const label = nodeLabel || `New ${nodeType} Node`;
    addNode('default', label, undefined, nodeType, stepId, parentId);
    setNodeLabel("");
    toast({
      title: "Node Added",
      description: `Added new ${nodeType} node to canvas.`,
    });
  };

  const onDragStart = (event: React.DragEvent, nodeType: "step" | "parent" | "child", step?: string, parentId?: string) => {
    event.dataTransfer.setData('application/reactflow', 'default');
    event.dataTransfer.setData('node-type', nodeType);
    if (step) event.dataTransfer.setData('step', step);
    if (parentId) event.dataTransfer.setData('parent-id', parentId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleCreateRelationship = () => {
    if (sourceNodeId && targetNodeId && relationshipType) {
      createRelationship(sourceNodeId, targetNodeId, relationshipType);
      toast({
        title: "Relationship Created",
        description: `Created a '${relationshipType}' relationship between nodes.`,
      });
      setIsRelationshipDialogOpen(false);
      setSourceNodeId("");
      setTargetNodeId("");
      setRelationshipType("");
    }
  };

  const handleExport = () => {
    const data = exportData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "flowchart-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Data Exported",
      description: "Flowchart data exported successfully.",
    });
  };

  const handleImportFromJson = () => {
    setImportError("");
    
    try {
      const data = JSON.parse(jsonImportText);
      importData(data);
      toast({
        title: "Flow Imported",
        description: "Flow data has been imported successfully.",
      });
      setIsImportDialogOpen(false);
      setJsonImportText("");
    } catch (error) {
      setImportError("Invalid JSON format. Please check your input.");
      toast({
        title: "Import Failed",
        description: "Failed to import flow data. Please check the JSON format.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white border-b">
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between p-2">
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Add Node
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="node-label">Node Label</Label>
                  <Input 
                    id="node-label" 
                    placeholder="Enter node label" 
                    value={nodeLabel}
                    onChange={(e) => setNodeLabel(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="node-type">Node Type</Label>
                  <Select 
                    value={nodeType} 
                    onValueChange={(value: any) => setNodeType(value)}
                  >
                    <SelectTrigger id="node-type">
                      <SelectValue placeholder="Select node type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="step">Step</SelectItem>
                      <SelectItem value="parent">Parent Node</SelectItem>
                      <SelectItem value="child">Child Node</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {nodeType === "child" && (
                  <div className="space-y-2">
                    <Label htmlFor="parent-id">Parent Node</Label>
                    <Select 
                      value={parentId} 
                      onValueChange={setParentId}
                    >
                      <SelectTrigger id="parent-id">
                        <SelectValue placeholder="Select parent node" />
                      </SelectTrigger>
                      <SelectContent>
                        {nodes
                          .filter(node => node.data.nodeType === "parent")
                          .map(node => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.data.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {(nodeType === "step" || nodeType === "parent") && (
                  <div className="space-y-2">
                    <Label htmlFor="step-id">Step ID (Optional)</Label>
                    <Input 
                      id="step-id" 
                      placeholder="Enter step ID" 
                      value={stepId}
                      onChange={(e) => setStepId(e.target.value)}
                    />
                  </div>
                )}
                
                <Button onClick={handleAddNode} className="w-full">
                  Add Node
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="flex gap-2">
            <Button variant="outline" onDragStart={(e) => onDragStart(e, "step")} draggable>
              <Box className="h-4 w-4 mr-1" />
              Step
            </Button>
            
            <Button variant="outline" onDragStart={(e) => onDragStart(e, "parent")} draggable>
              <Layers className="h-4 w-4 mr-1" />
              Parent
            </Button>
            
            <Button variant="outline" onDragStart={(e) => onDragStart(e, "child")} draggable>
              <CircleDot className="h-4 w-4 mr-1" />
              Child
            </Button>
          </div>
          
          <Dialog open={isRelationshipDialogOpen} onOpenChange={setIsRelationshipDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Link2 className="h-4 w-4 mr-1" />
                Define Relationship
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Relationship</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="source-node">Source Node</Label>
                  <Select 
                    value={sourceNodeId} 
                    onValueChange={setSourceNodeId}
                  >
                    <SelectTrigger id="source-node">
                      <SelectValue placeholder="Select source node" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map(node => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.data.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-node">Target Node</Label>
                  <Select 
                    value={targetNodeId} 
                    onValueChange={setTargetNodeId}
                  >
                    <SelectTrigger id="target-node">
                      <SelectValue placeholder="Select target node" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map(node => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.data.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="relationship-type">Relationship Type</Label>
                  <Input 
                    id="relationship-type" 
                    placeholder="E.g., 'depends-on', 'triggers', etc." 
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value)}
                  />
                </div>
                
                <Button onClick={handleCreateRelationship} className="w-full">
                  Create Relationship
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            Export
          </Button>
          
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import Flow Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="json-input">Paste JSON Data</Label>
                  <Textarea 
                    id="json-input" 
                    placeholder='{"nodes": [], "edges": []}' 
                    value={jsonImportText}
                    onChange={(e) => setJsonImportText(e.target.value)}
                    className="min-h-[200px] font-mono"
                  />
                  {importError && (
                    <p className="text-sm text-red-500">{importError}</p>
                  )}
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleImportFromJson}>
                  Import Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={undo}
            disabled={history.past.length === 0}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={redo}
            disabled={history.future.length === 0}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" onClick={handleReset}>
            <Trash2 className="h-4 w-4 mr-2" />
            Reset Canvas
          </Button>
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex flex-col p-2 space-y-2">
        <div className="flex justify-between items-center">
          {/* First row - Main node operations */}
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="node-label-mobile">Node Label</Label>
                    <Input 
                      id="node-label-mobile" 
                      placeholder="Enter node label" 
                      value={nodeLabel}
                      onChange={(e) => setNodeLabel(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="node-type-mobile">Node Type</Label>
                    <Select 
                      value={nodeType} 
                      onValueChange={(value: any) => setNodeType(value)}
                    >
                      <SelectTrigger id="node-type-mobile">
                        <SelectValue placeholder="Select node type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="step">Step</SelectItem>
                        <SelectItem value="parent">Parent Node</SelectItem>
                        <SelectItem value="child">Child Node</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {nodeType === "child" && (
                    <div className="space-y-2">
                      <Label htmlFor="parent-id-mobile">Parent Node</Label>
                      <Select 
                        value={parentId} 
                        onValueChange={setParentId}
                      >
                        <SelectTrigger id="parent-id-mobile">
                          <SelectValue placeholder="Select parent node" />
                        </SelectTrigger>
                        <SelectContent>
                          {nodes
                            .filter(node => node.data.nodeType === "parent")
                            .map(node => (
                              <SelectItem key={node.id} value={node.id}>
                                {node.data.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {(nodeType === "step" || nodeType === "parent") && (
                    <div className="space-y-2">
                      <Label htmlFor="step-id-mobile">Step ID (Optional)</Label>
                      <Input 
                        id="step-id-mobile" 
                        placeholder="Enter step ID" 
                        value={stepId}
                        onChange={(e) => setStepId(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <Button onClick={handleAddNode} className="w-full">
                    Add Node
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Fixed draggable node buttons */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Box className="h-4 w-4 mr-1" />
                  Nodes
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-0">
                <div className="p-1 flex flex-col gap-1">
                  <Button variant="ghost" size="sm" className="justify-start" 
                    onDragStart={(e) => onDragStart(e, "step")} draggable>
                    <Box className="h-4 w-4 mr-2" />
                    Step
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" 
                    onDragStart={(e) => onDragStart(e, "parent")} draggable>
                    <Layers className="h-4 w-4 mr-2" />
                    Parent
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" 
                    onDragStart={(e) => onDragStart(e, "child")} draggable>
                    <CircleDot className="h-4 w-4 mr-2" />
                    Child
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          
            <Dialog open={isRelationshipDialogOpen} onOpenChange={setIsRelationshipDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Link2 className="h-4 w-4 mr-1" />
                  Relate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Relationship</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="source-node-mobile">Source Node</Label>
                    <Select 
                      value={sourceNodeId} 
                      onValueChange={setSourceNodeId}
                    >
                      <SelectTrigger id="source-node-mobile">
                        <SelectValue placeholder="Select source node" />
                      </SelectTrigger>
                      <SelectContent>
                        {nodes.map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.data.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-node-mobile">Target Node</Label>
                    <Select 
                      value={targetNodeId} 
                      onValueChange={setTargetNodeId}
                    >
                      <SelectTrigger id="target-node-mobile">
                        <SelectValue placeholder="Select target node" />
                      </SelectTrigger>
                      <SelectContent>
                        {nodes.map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.data.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="relationship-type-mobile">Relationship Type</Label>
                    <Input 
                      id="relationship-type-mobile" 
                      placeholder="E.g., 'depends-on', 'triggers', etc." 
                      value={relationshipType}
                      onChange={(e) => setRelationshipType(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={handleCreateRelationship} className="w-full">
                    Create Relationship
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={undo}
              disabled={history.past.length === 0}
              className="h-8 w-8"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={redo}
              disabled={history.future.length === 0}
              className="h-8 w-8"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Second row - Import/Export and Reset */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export
            </Button>
            
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw]">
                <DialogHeader>
                  <DialogTitle>Import Flow Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="json-input-mobile">Paste JSON Data</Label>
                    <Textarea 
                      id="json-input-mobile" 
                      placeholder='{"nodes": [], "edges": []}' 
                      value={jsonImportText}
                      onChange={(e) => setJsonImportText(e.target.value)}
                      className="min-h-[150px] font-mono"
                    />
                    {importError && (
                      <p className="text-sm text-red-500">{importError}</p>
                    )}
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="secondary" onClick={() => setIsImportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleImportFromJson}>
                    Import Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleReset}>
            <Trash2 className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlowToolbar;


// import React, { useState } from "react";
// import { Plus, Trash2, Monitor, Layers, Box, CircleDot, Link2, Undo2, Redo2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useFlowStore } from "@/stores/flowStore";
// import { toast } from "@/hooks/use-toast";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";

// const FlowToolbar = () => {
//   const { 
//     resetCanvas, 
//     addNode, 
//     importData, 
//     exportData, 
//     nodes, 
//     createRelationship, 
//     undo, 
//     redo, 
//     history 
//   } = useFlowStore();
//   const [nodeLabel, setNodeLabel] = useState("");
//   const [nodeType, setNodeType] = useState<"step" | "parent" | "child">("step");
//   const [stepId, setStepId] = useState("");
//   const [parentId, setParentId] = useState("");
//   const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
//   const [sourceNodeId, setSourceNodeId] = useState("");
//   const [targetNodeId, setTargetNodeId] = useState("");
//   const [relationshipType, setRelationshipType] = useState("");
  
//   // New state for import modal
//   const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
//   const [jsonImportText, setJsonImportText] = useState("");
//   const [importError, setImportError] = useState("");

//   const handleReset = () => {
//     resetCanvas();
//     toast({
//       title: "Canvas Reset",
//       description: "All nodes and connections have been cleared.",
//     });
//   };

//   const handleAddNode = () => {
//     const label = nodeLabel || `New ${nodeType} Node`;
//     addNode('default', label, undefined, nodeType, stepId, parentId);
//     setNodeLabel("");
//     toast({
//       title: "Node Added",
//       description: `Added new ${nodeType} node to canvas.`,
//     });
//   };

//   const onDragStart = (event: React.DragEvent, nodeType: "step" | "parent" | "child", step?: string, parentId?: string) => {
//     event.dataTransfer.setData('application/reactflow', 'default');
//     event.dataTransfer.setData('node-type', nodeType);
//     if (step) event.dataTransfer.setData('step', step);
//     if (parentId) event.dataTransfer.setData('parent-id', parentId);
//     event.dataTransfer.effectAllowed = 'move';
//   };

//   const handleCreateRelationship = () => {
//     if (sourceNodeId && targetNodeId && relationshipType) {
//       createRelationship(sourceNodeId, targetNodeId, relationshipType);
//       toast({
//         title: "Relationship Created",
//         description: `Created a '${relationshipType}' relationship between nodes.`,
//       });
//       setIsRelationshipDialogOpen(false);
//       setSourceNodeId("");
//       setTargetNodeId("");
//       setRelationshipType("");
//     }
//   };

//   const handleExport = () => {
//     const data = exportData();
//     const jsonString = JSON.stringify(data, null, 2);
//     const blob = new Blob([jsonString], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
    
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "flowchart-data.json";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
    
//     toast({
//       title: "Data Exported",
//       description: "Flowchart data exported successfully.",
//     });
//   };

//   // New import function that uses the text from the modal
//   const handleImportFromJson = () => {
//     setImportError("");
    
//     try {
//       const data = JSON.parse(jsonImportText);
//       importData(data);
//       toast({
//         title: "Flow Imported",
//         description: "Flow data has been imported successfully.",
//       });
//       setIsImportDialogOpen(false);
//       setJsonImportText("");
//     } catch (error) {
//       setImportError("Invalid JSON format. Please check your input.");
//       toast({
//         title: "Import Failed",
//         description: "Failed to import flow data. Please check the JSON format.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="flex items-center justify-between p-2 bg-white border-b">
//       <div className="flex items-center space-x-2">
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button variant="outline" className="flex items-center">
//               <Plus className="h-4 w-4 mr-1" />
//               Add Node
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-80">
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="node-label">Node Label</Label>
//                 <Input 
//                   id="node-label" 
//                   placeholder="Enter node label" 
//                   value={nodeLabel}
//                   onChange={(e) => setNodeLabel(e.target.value)}
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="node-type">Node Type</Label>
//                 <Select 
//                   value={nodeType} 
//                   onValueChange={(value: any) => setNodeType(value)}
//                 >
//                   <SelectTrigger id="node-type">
//                     <SelectValue placeholder="Select node type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="step">Step</SelectItem>
//                     <SelectItem value="parent">Parent Node</SelectItem>
//                     <SelectItem value="child">Child Node</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               {nodeType === "child" && (
//                 <div className="space-y-2">
//                   <Label htmlFor="parent-id">Parent Node</Label>
//                   <Select 
//                     value={parentId} 
//                     onValueChange={setParentId}
//                   >
//                     <SelectTrigger id="parent-id">
//                       <SelectValue placeholder="Select parent node" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {nodes
//                         .filter(node => node.data.nodeType === "parent")
//                         .map(node => (
//                           <SelectItem key={node.id} value={node.id}>
//                             {node.data.label}
//                           </SelectItem>
//                         ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )}
              
//               {(nodeType === "step" || nodeType === "parent") && (
//                 <div className="space-y-2">
//                   <Label htmlFor="step-id">Step ID (Optional)</Label>
//                   <Input 
//                     id="step-id" 
//                     placeholder="Enter step ID" 
//                     value={stepId}
//                     onChange={(e) => setStepId(e.target.value)}
//                   />
//                 </div>
//               )}
              
//               <Button onClick={handleAddNode} className="w-full">
//                 Add Node
//               </Button>
//             </div>
//           </PopoverContent>
//         </Popover>
        
//         <div className="flex gap-2">
//           <Button variant="outline" onDragStart={(e) => onDragStart(e, "step")} draggable>
//             <Box className="h-4 w-4 mr-1" />
//             Step
//           </Button>
          
//           <Button variant="outline" onDragStart={(e) => onDragStart(e, "parent")} draggable>
//             <Layers className="h-4 w-4 mr-1" />
//             Parent
//           </Button>
          
//           <Button variant="outline" onDragStart={(e) => onDragStart(e, "child")} draggable>
//             <CircleDot className="h-4 w-4 mr-1" />
//             Child
//           </Button>
//         </div>
        
//         <Dialog open={isRelationshipDialogOpen} onOpenChange={setIsRelationshipDialogOpen}>
//           <DialogTrigger asChild>
//             <Button variant="outline">
//               <Link2 className="h-4 w-4 mr-1" />
//               Define Relationship
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Create Custom Relationship</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 mt-4">
//               <div className="space-y-2">
//                 <Label htmlFor="source-node">Source Node</Label>
//                 <Select 
//                   value={sourceNodeId} 
//                   onValueChange={setSourceNodeId}
//                 >
//                   <SelectTrigger id="source-node">
//                     <SelectValue placeholder="Select source node" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {nodes.map(node => (
//                       <SelectItem key={node.id} value={node.id}>
//                         {node.data.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="target-node">Target Node</Label>
//                 <Select 
//                   value={targetNodeId} 
//                   onValueChange={setTargetNodeId}
//                 >
//                   <SelectTrigger id="target-node">
//                     <SelectValue placeholder="Select target node" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {nodes.map(node => (
//                       <SelectItem key={node.id} value={node.id}>
//                         {node.data.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="relationship-type">Relationship Type</Label>
//                 <Input 
//                   id="relationship-type" 
//                   placeholder="E.g., 'depends-on', 'triggers', etc." 
//                   value={relationshipType}
//                   onChange={(e) => setRelationshipType(e.target.value)}
//                 />
//               </div>
              
//               <Button onClick={handleCreateRelationship} className="w-full">
//                 Create Relationship
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>
      
//       <div className="flex items-center space-x-2">
//         <Button variant="outline" onClick={handleExport}>
//           Export
//         </Button>
        
//         {/* New Import Dialog */}
//         <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
//           <DialogTrigger asChild>
//             <Button variant="outline">
//               Import
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>Import Flow Data</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 mt-4">
//               <div className="space-y-2">
//                 <Label htmlFor="json-input">Paste JSON Data</Label>
//                 <Textarea 
//                   id="json-input" 
//                   placeholder='{"nodes": [], "edges": []}' 
//                   value={jsonImportText}
//                   onChange={(e) => setJsonImportText(e.target.value)}
//                   className="min-h-[200px] font-mono"
//                 />
//                 {importError && (
//                   <p className="text-sm text-red-500">{importError}</p>
//                 )}
//               </div>
//             </div>
//             <DialogFooter className="mt-4">
//               <Button type="button" variant="secondary" onClick={() => setIsImportDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button type="button" onClick={handleImportFromJson}>
//                 Import Data
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
        
//         <Button 
//           variant="outline" 
//           size="icon"
//           onClick={undo}
//           disabled={history.past.length === 0}
//         >
//           <Undo2 className="h-4 w-4" />
//         </Button>
        
//         <Button 
//           variant="outline" 
//           size="icon"
//           onClick={redo}
//           disabled={history.future.length === 0}
//         >
//           <Redo2 className="h-4 w-4" />
//         </Button>
        
//         <Button variant="outline" onClick={handleReset}>
//           <Trash2 className="h-4 w-4 mr-2" />
//           Reset Canvas
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default FlowToolbar;