import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { GraphView } from "./GraphView";
import { VideoPlayer } from "./VideoPlayer";
import { FileUpload } from "./FileUpload";
import { Report } from "./Report";
import { PreviousAnalysis } from "./PreviousAnalysis";

export const Workspace = () => {
  const [activeTab, setActiveTab] = useState("upload");

  const handleSelectReport = (report: any) => {
    // Switch to report tab and load the selected report data
    setActiveTab("report");
    // Here you would typically load the report data into the Report component
    console.log("Selected report:", report);
  };

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
            <TabsTrigger value="upload" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Graph View
            </TabsTrigger>
            <TabsTrigger value="video" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Execution Video
            </TabsTrigger>
            <TabsTrigger value="report" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Report
            </TabsTrigger>
            <TabsTrigger value="previous" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Previous Analysis
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1">
          <TabsContent value="upload" className="h-full m-0 p-6">
            <FileUpload />
          </TabsContent>
          <TabsContent value="graph" className="h-full m-0">
            <GraphView />
          </TabsContent>
          <TabsContent value="video" className="h-full m-0">
            <VideoPlayer />
          </TabsContent>
          <TabsContent value="report" className="h-full m-0">
            <Report />
          </TabsContent>
          <TabsContent value="previous" className="h-full m-0">
            <PreviousAnalysis onSelectReport={handleSelectReport} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};