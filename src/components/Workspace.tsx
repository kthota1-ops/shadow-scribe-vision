import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { GraphView } from "./GraphView";
import { VideoPlayer } from "./VideoPlayer";

export const Workspace = () => {
  const [activeTab, setActiveTab] = useState("graph");

  return (
    <div className="h-screen flex flex-col bg-gradient-subtle">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background-secondary/50 backdrop-blur-sm flex items-center px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Malware Analysis Platform</h1>
          <p className="text-sm text-muted-foreground">Advanced threat intelligence and visualization</p>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border bg-background-secondary/30">
          <TabsList className="h-12 p-1 m-4 bg-background-tertiary">
            <TabsTrigger value="graph" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Graph View
            </TabsTrigger>
            <TabsTrigger value="video" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Execution Video
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1">
          <TabsContent value="graph" className="h-full m-0">
            <GraphView />
          </TabsContent>
          <TabsContent value="video" className="h-full m-0">
            <VideoPlayer />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};