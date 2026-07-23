import type { ComponentType } from "react";
import type { ChapterId } from "../domain";
import WeightsLesson from "../../content/chapters/weights.mdx";
import TrainingLesson from "../../content/chapters/training-loop.mdx";
import AdaptationLesson from "../../content/chapters/adaptation.mdx";
import ArtifactLesson from "../../content/chapters/model-artifact.mdx";
import ArrivalLesson from "../../content/chapters/request-arrival.mdx";
import ReadinessLesson from "../../content/chapters/model-readiness.mdx";
import SingleGpuLesson from "../../content/chapters/single-gpu-inference.mdx";
import MultiGpuLesson from "../../content/chapters/multi-gpu-inference.mdx";
import AnatomyLesson from "../../content/chapters/gpu-anatomy.mdx";
import KernelLesson from "../../content/chapters/kernel-launch.mdx";
import SchedulerLesson from "../../content/chapters/warp-scheduler.mdx";
import MemoryLesson from "../../content/chapters/memory-hierarchy.mdx";

export const lessonComponents: Readonly<Record<ChapterId, ComponentType>> = {
  "chapter.model-factory.weights": WeightsLesson,
  "chapter.model-factory.training": TrainingLesson,
  "chapter.model-factory.adaptation": AdaptationLesson,
  "chapter.model-factory.artifact": ArtifactLesson,
  "chapter.inference-system.arrival": ArrivalLesson,
  "chapter.inference-system.readiness": ReadinessLesson,
  "chapter.inference-system.single-gpu": SingleGpuLesson,
  "chapter.inference-system.multi-gpu": MultiGpuLesson,
  "chapter.inside-gpu.anatomy": AnatomyLesson,
  "chapter.inside-gpu.kernel-launch": KernelLesson,
  "chapter.inside-gpu.warp-scheduler": SchedulerLesson,
  "chapter.inside-gpu.memory": MemoryLesson,
};
