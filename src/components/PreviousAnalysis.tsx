import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Eye, Download, Trash2, Edit3, Check, X } from "lucide-react";
import { z } from "zod";

interface AnalysisReport {
  id: string;
  date: string;
  caseName: string;
  fileHash: string;
  threatLevel: "Low" | "Medium" | "High" | "Critical";
  status: "Completed" | "Processing" | "Failed";
  detections: number;
  size: string;
}

const mockReports: AnalysisReport[] = [
  {
    id: "1",
    date: "2024-01-15",
    caseName: "Operation Shadowbyte",
    fileHash: "a1b2c3d4e5f67890abcdef1234567890",
    threatLevel: "Critical",
    status: "Completed",
    detections: 45,
    size: "2.3 MB"
  },
  {
    id: "2",
    date: "2024-01-14",
    caseName: "Phantom Document Attack",
    fileHash: "f1e2d3c4b5a69870fedcba0987654321",
    threatLevel: "High",
    status: "Completed",
    detections: 23,
    size: "890 KB"
  },
  {
    id: "3",
    date: "2024-01-13",
    caseName: "Binary Ghost Investigation",
    fileHash: "9876543210abcdef0123456789abcdef",
    threatLevel: "Medium",
    status: "Processing",
    detections: 0,
    size: "1.7 MB"
  },
  {
    id: "4",
    date: "2024-01-12",
    caseName: "Clean File Verification",
    fileHash: "abcdef1234567890fedcba0987654321",
    threatLevel: "Low",
    status: "Completed",
    detections: 0,
    size: "156 KB"
  },
  {
    id: "5",
    date: "2024-01-11",
    caseName: "Trojan Hunter Case",
    fileHash: "1234567890abcdeffedcba0987654321",
    threatLevel: "Critical",
    status: "Failed",
    detections: 0,
    size: "3.2 MB"
  }
];

interface PreviousAnalysisProps {
  onSelectReport?: (report: AnalysisReport) => void;
}

// Validation schema for case name
const caseNameSchema = z.string()
  .trim()
  .min(1, { message: "Case name cannot be empty" })
  .max(100, { message: "Case name must be less than 100 characters" })
  .regex(/^[a-zA-Z0-9\s\-_\.]+$/, { message: "Case name can only contain letters, numbers, spaces, hyphens, underscores, and periods" });

export const PreviousAnalysis = ({ onSelectReport }: PreviousAnalysisProps) => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [reports, setReports] = useState<AnalysisReport[]>(mockReports);

  const getThreatLevelVariant = (level: string) => {
    switch (level) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "outline";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "Processing": return "secondary";
      case "Failed": return "destructive";
      default: return "outline";
    }
  };

  const handleRowClick = (report: AnalysisReport) => {
    setSelectedReport(report.id);
    onSelectReport?.(report);
  };

  const handleViewReport = (report: AnalysisReport, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectReport?.(report);
  };

  const handleEditCaseName = (report: AnalysisReport, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingReport(report.id);
    setEditValue(report.caseName);
  };

  const handleSaveCaseName = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const validation = caseNameSchema.safeParse(editValue);
    if (!validation.success) {
      // You could add toast notification here for validation errors
      console.error("Validation error:", validation.error.issues[0].message);
      return;
    }
    
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, caseName: validation.data }
        : report
    ));
    
    setEditingReport(null);
    setEditValue("");
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingReport(null);
    setEditValue("");
  };

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <Card className="flex-1 bg-background-secondary border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground uppercase tracking-wide text-sm font-bold">
            Previous Analysis Reports
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Select a report to view detailed analysis results
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[calc(100vh-200px)]">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-background-tertiary/50">
                  <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Case Name</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Hash (SHA256)</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Size</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Threat Level</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Detections</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow
                    key={report.id}
                    className={`
                      border-border cursor-pointer transition-colors
                      hover:bg-background-tertiary/50
                      ${selectedReport === report.id ? 'bg-primary/10 border-primary/20' : ''}
                    `}
                    onClick={() => handleRowClick(report)}
                  >
                    <TableCell className="text-foreground font-mono text-sm">
                      {report.date}
                    </TableCell>
                     <TableCell className="text-foreground">
                       <div className="overflow-x-auto max-w-[200px]">
                         {editingReport === report.id ? (
                           <Input
                             value={editValue}
                             onChange={(e) => setEditValue(e.target.value)}
                             className="h-8 text-sm bg-background border-primary/50 focus:border-primary"
                             onClick={(e) => e.stopPropagation()}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                 handleSaveCaseName(report.id, e as any);
                               } else if (e.key === 'Escape') {
                                 handleCancelEdit(e as any);
                               }
                             }}
                             autoFocus
                           />
                         ) : (
                           <span className="whitespace-nowrap cursor-pointer hover:text-primary transition-colors" onClick={(e) => handleEditCaseName(report, e)}>
                             {report.caseName}
                           </span>
                         )}
                       </div>
                     </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      <div className="overflow-x-auto max-w-[150px]">
                        <span className="whitespace-nowrap">{report.fileHash}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{report.size}</TableCell>
                    <TableCell>
                      <Badge variant={getThreatLevelVariant(report.threatLevel) as any}>
                        {report.threatLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(report.status) as any}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground font-semibold">
                      {report.detections}
                    </TableCell>
                     <TableCell>
                       <div className="flex gap-1">
                         {editingReport === report.id ? (
                           <>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={(e) => handleSaveCaseName(report.id, e)}
                               className="h-8 w-8 p-0 hover:bg-green-500/20 text-green-600"
                             >
                               <Check className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={handleCancelEdit}
                               className="h-8 w-8 p-0 hover:bg-destructive/20 text-destructive"
                             >
                               <X className="h-4 w-4" />
                             </Button>
                           </>
                         ) : (
                           <>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={(e) => handleEditCaseName(report, e)}
                               className="h-8 w-8 p-0 hover:bg-primary/20"
                             >
                               <Edit3 className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={(e) => handleViewReport(report, e)}
                               className="h-8 w-8 p-0 hover:bg-primary/20"
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={(e) => e.stopPropagation()}
                               className="h-8 w-8 p-0 hover:bg-primary/20"
                             >
                               <Download className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={(e) => e.stopPropagation()}
                               className="h-8 w-8 p-0 hover:bg-destructive/20 text-destructive"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </>
                         )}
                       </div>
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};