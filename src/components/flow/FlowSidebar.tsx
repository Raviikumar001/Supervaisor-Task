
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Plus, Box, CircleDot, Square } from "lucide-react";
import { useFlowStore } from "@/stores/flowStore";

const nodeTypes = [
  { id: 'input', label: 'Input Node', icon: CircleDot },
  { id: 'default', label: 'Process Node', icon: Square },
  { id: 'output', label: 'Output Node', icon: Box },
];

const FlowSidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeName', nodeLabel);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <h2 className="font-semibold text-xl">Flow Chart Editor</h2>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-medium">Add Nodes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nodeTypes.map((type) => (
                <SidebarMenuItem key={type.id}>
                  <SidebarMenuButton 
                    draggable
                    onDragStart={(e) => onDragStart(e, type.id, type.label)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-md transition-colors cursor-move"
                  >
                    <type.icon className="h-5 w-5 text-primary" />
                    <span className="flex-1 text-sm font-medium">{type.label}</span>
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default FlowSidebar;
