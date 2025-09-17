"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartDemo } from "@/components/chart-demo";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Hero() {
  const router = useRouter();
  return (
        <section className="container-section grid gap-10 lg:grid-cols-2 items-center">
      <div className="text-center lg:text-left">
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Excel Visualizer
        </motion.h1>
        <motion.p
          className="mt-4 text-lg md:text-xl text-foreground/90 max-w-2xl lg:max-w-none mx-auto lg:mx-0"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Upload spreadsheets, clean data, and generate AI-driven charts with beautiful visualizations that tell your data&apos;s story.
        </motion.p>
        <motion.div
          className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button size="lg" onClick={() => router.push("/signup")} className="w-full sm:w-auto">
            Start Free Trial
          </Button>
          <Button variant="ghost" size="lg" className="w-full sm:w-auto" onClick={() => window.location.href = '/demo'}>
            Watch Demo
          </Button>
        </motion.div>
        <div className="mt-6 flex gap-2 flex-wrap justify-center lg:justify-start">
          <Badge className="text-xs">🔒 Enterprise Security</Badge>
          <Badge className="text-xs">⚡ Lightning Fast</Badge>
          <Badge className="text-xs">🤖 AI-Powered</Badge>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <ChartDemo />
      </motion.div>
    </section>
  );
}
