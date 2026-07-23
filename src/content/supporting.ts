import type { ChapterId } from "../domain";

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  chapterIds: readonly ChapterId[];
}

export interface SourceReference {
  id: string;
  title: string;
  publisher: string;
  url: string;
  note: string;
  chapterIds: readonly ChapterId[];
}

export const glossaryTerms: readonly GlossaryTerm[] = [
  { id: "glossary.parameter", term: "Parameter", definition: "A numeric value used by a model operation. Trainable parameters are adjusted during learning.", chapterIds: ["chapter.model-factory.weights", "chapter.model-factory.training"] },
  { id: "glossary.checkpoint", term: "Checkpoint", definition: "A saved snapshot of model tensors and associated training or configuration state.", chapterIds: ["chapter.model-factory.weights", "chapter.model-factory.artifact"] },
  { id: "glossary.tokenizer", term: "Tokenizer", definition: "The rules and vocabulary that map text to token IDs and token IDs back to text.", chapterIds: ["chapter.model-factory.artifact", "chapter.inference-system.arrival", "chapter.inference-system.single-gpu"] },
  { id: "glossary.gradient", term: "Gradient", definition: "A signal describing how a small parameter change would affect the training objective.", chapterIds: ["chapter.model-factory.training"] },
  { id: "glossary.lora", term: "LoRA", definition: "A parameter-efficient adaptation method that trains low-rank update matrices while keeping base weights frozen.", chapterIds: ["chapter.model-factory.adaptation"] },
  { id: "glossary.artifact", term: "Model artifact", definition: "The versioned collection of weights, configuration, tokenizer assets, and metadata needed to reconstruct a model.", chapterIds: ["chapter.model-factory.artifact", "chapter.inference-system.readiness"] },
  { id: "glossary.admission", term: "Admission control", definition: "The decision to accept, delay, or reject work based on service capacity and policy.", chapterIds: ["chapter.inference-system.arrival"] },
  { id: "glossary.kv-cache", term: "KV cache", definition: "Per-layer attention keys and values retained so decode can reuse earlier token context.", chapterIds: ["chapter.inference-system.single-gpu"] },
  { id: "glossary.tensor-parallel", term: "Tensor parallelism", definition: "A strategy that partitions a model operation across devices that must exchange partial results.", chapterIds: ["chapter.inference-system.multi-gpu"] },
  { id: "glossary.sm", term: "Streaming multiprocessor (SM)", definition: "A GPU compute neighborhood containing schedulers, execution pipelines, registers, and shared memory.", chapterIds: ["chapter.inside-gpu.anatomy", "chapter.inside-gpu.kernel-launch"] },
  { id: "glossary.warp", term: "Warp", definition: "A group of 32 CUDA threads scheduled together for instruction execution.", chapterIds: ["chapter.inside-gpu.kernel-launch", "chapter.inside-gpu.warp-scheduler"] },
  { id: "glossary.coalescing", term: "Coalescing", definition: "Combining nearby memory requests from threads in a warp into fewer memory transactions.", chapterIds: ["chapter.inside-gpu.memory"] },
];

export const sourceReferences: readonly SourceReference[] = [
  { id: "source.pytorch-autograd", title: "Autograd mechanics", publisher: "PyTorch", url: "https://docs.pytorch.org/docs/main/notes/autograd.html", note: "Primary reference for forward computation graphs and reverse automatic differentiation.", chapterIds: ["chapter.model-factory.training"] },
  { id: "source.hf-models", title: "Transformers model loading", publisher: "Hugging Face", url: "https://huggingface.co/docs/transformers/main_classes/model", note: "Primary runtime documentation for model configuration and state dictionaries.", chapterIds: ["chapter.model-factory.weights", "chapter.model-factory.artifact", "chapter.inference-system.readiness"] },
  { id: "source.hf-tokenizer", title: "Tokenizer API", publisher: "Hugging Face", url: "https://huggingface.co/docs/transformers/main_classes/tokenizer", note: "Primary reference for producing model input IDs and attention metadata.", chapterIds: ["chapter.model-factory.artifact", "chapter.inference-system.arrival", "chapter.inference-system.single-gpu"] },
  { id: "source.hf-peft", title: "Parameter-efficient fine-tuning methods", publisher: "Hugging Face PEFT", url: "https://huggingface.co/docs/peft/main/methods/overview", note: "Primary library documentation for PEFT approaches and LoRA-family methods.", chapterIds: ["chapter.model-factory.adaptation"] },
  { id: "source.pytorch-tp", title: "Tensor Parallelism", publisher: "PyTorch", url: "https://docs.pytorch.org/docs/stable/distributed.tensor.parallel.html", note: "Primary framework reference for tensor-parallel module plans.", chapterIds: ["chapter.inference-system.multi-gpu"] },
  { id: "source.cuda-model", title: "CUDA Programming Model", publisher: "NVIDIA", url: "https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html", note: "Primary reference for grids, blocks, SM assignment, warps, and SIMT execution.", chapterIds: ["chapter.inside-gpu.anatomy", "chapter.inside-gpu.kernel-launch", "chapter.inside-gpu.warp-scheduler"] },
  { id: "source.cuda-memory", title: "CUDA C++ Best Practices Guide", publisher: "NVIDIA", url: "https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html", note: "Primary reference for global-memory coalescing and performance considerations.", chapterIds: ["chapter.inside-gpu.memory"] },
];

export function glossaryForChapter(chapterId: ChapterId): readonly GlossaryTerm[] {
  return glossaryTerms.filter((term) => term.chapterIds.includes(chapterId));
}

export function sourcesForChapter(chapterId: ChapterId): readonly SourceReference[] {
  return sourceReferences.filter((source) => source.chapterIds.includes(chapterId));
}
