
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/stores/flowStore";
import { toast } from "@/hooks/use-toast";

const FlowToolbar = () => {
  const { resetCanvas, addNode } = useFlowStore();

  const handleReset = () => {
    resetCanvas();
    toast({
      title: "Canvas Reset",
      description: "All nodes and connections have been cleared.",
    });
  };

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', 'default');
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-sm z-50">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-10 w-10 cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={onDragStart}
        onClick={() => {
          addNode('default', 'New Node');
          toast({
            title: "Node Added",
            description: "Added new node to canvas.",
          });
        }}
      >
        <Plus className="h-5 w-5" />
      </Button>

      <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleReset}>
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default FlowToolbar;
