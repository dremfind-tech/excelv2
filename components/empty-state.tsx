"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Upload, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  type: "initial" | "no-data" | "error";
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  type, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  const configs = {
    initial: {
      icon: <FileSpreadsheet size={48} className="text-muted" />,
      title: "Ready to visualize your data",
      description: "Upload a data file (Excel, CSV, TSV, ODS) and enter a prompt to generate beautiful charts with AI assistance.",
      showUploadHint: true
    },
    "no-data": {
      icon: <Upload size={48} className="text-muted" />,
      title: title || "No data to display",
      description: description || "Upload a file with data to start creating visualizations.",
      showUploadHint: false
    },
    error: {
      icon: <Sparkles size={48} className="text-red-400" />,
      title: title || "Something went wrong",
      description: description || "We couldn't generate charts from your data. Please try again with a different prompt or file.",
      showUploadHint: false
    }
  };

  const config = configs[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="col-span-full"
    >
      <Card className="border-dashed border-2 border-white/10">
        <CardContent className="py-16 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6 max-w-md mx-auto"
          >
            {config.icon}
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{config.title}</h3>
              <p className="text-muted leading-relaxed">{config.description}</p>
            </div>

            {config.showUploadHint && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
                <div className="text-sm font-medium text-primary">Quick start tips:</div>
                <div className="text-sm text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Upload Excel (.xlsx, .xls), CSV, TSV, or ODS files up to 10MB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>First row should contain your column names (e.g., &quot;Project&quot;, &quot;Date&quot;, &quot;Amount&quot;)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Try prompts like &quot;show sales by month&quot; or &quot;compare categories&quot;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Generate multiple chart types automatically</span>
                  </div>
                </div>
              </div>
            )}

            {action && (
              <Button onClick={action.onClick} className="flex items-center gap-2">
                {action.label}
                <ArrowRight size={16} />
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}