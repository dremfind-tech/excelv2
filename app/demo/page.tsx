"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, ArrowLeft, Upload, BarChart3, Download } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const demoSteps = [
    {
      title: "Upload Your Excel File",
      description: "Simply drag and drop your Excel spreadsheet or click to browse and select your file.",
      icon: <Upload className="h-8 w-8 text-primary" />,
      demo: (
        <div className="p-8 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-primary/60" />
            <p className="mt-2 text-sm text-muted-foreground">Drop your Excel file here or click to browse</p>
          </div>
        </div>
      )
    },
    {
      title: "AI Analysis & Chart Generation",
      description: "Our AI analyzes your data and automatically generates the most appropriate visualizations.",
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      demo: (
        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="h-3 bg-blue-500 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="h-16 w-full bg-gradient-to-t from-green-500 to-green-300 rounded"></div>
              <div className="h-2 bg-gray-200 rounded mt-2"></div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm">AI analyzing your data...</span>
          </div>
        </div>
      )
    },
    {
      title: "Export & Share",
      description: "Download your visualizations in multiple formats or share them directly with your team.",
      icon: <Download className="h-8 w-8 text-primary" />,
      demo: (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium">Sales Dashboard.png</span>
            <Button size="sm" variant="outline">Download</Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium">Revenue Chart.pdf</span>
            <Button size="sm" variant="outline">Download</Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium">Data Analysis.svg</span>
            <Button size="sm" variant="outline">Download</Button>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % demoSteps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + demoSteps.length) % demoSteps.length);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % demoSteps.length;
          if (next === 0) {
            clearInterval(interval);
            setIsPlaying(false);
          }
          return next;
        });
      }, 3000);
    }
  };

  return (
    <section className="container-section">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">How Excel Visualizer Works</h1>
          <p className="text-xl text-muted-foreground">
            Transform your spreadsheets into beautiful visualizations in three simple steps
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Steps Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            {demoSteps.map((step, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  currentStep === index 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-primary/50'
                }`}
                onClick={() => setCurrentStep(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Demo Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {demoSteps[currentStep].title}
                  </h3>
                  <div className="h-48">
                    {demoSteps[currentStep].demo}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextStep}
                      disabled={currentStep === demoSteps.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePlayback}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetDemo}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Step {currentStep + 1} of {demoSteps.length}</span>
                    <span>{Math.round(((currentStep + 1) / demoSteps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center space-y-4"
        >
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">
            Join thousands of users who are already creating beautiful visualizations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/signup'}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}