
// import FlowCanvas from "@/components/flow/FlowCanvas";

// const Index = () => {
//   return (
//     <div className="min-h-screen w-full">
//       <FlowCanvas />
//     </div>
//   );
// };

// export default Index;


import React from "react";
import FlowCanvas from "@/components/flow/FlowCanvas";
import { ReactFlowProvider } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <Card className="flex-1 w-full h-full overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Interactive Flow Chart Application</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-4rem)]">
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;