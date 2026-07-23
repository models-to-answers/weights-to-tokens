import type {
  ChapterDefinition,
  ChapterId,
  GlossaryId,
  SourceId,
} from "../domain";
import { chapterRegistry } from "./catalog";

export interface GlossaryTerm {
  id: GlossaryId;
  term: string;
  definition: string;
}

export interface SourceReference {
  id: SourceId;
  title: string;
  publisher: string;
  url: string;
  note: string;
}

export const glossaryTerms: readonly GlossaryTerm[] = [
  { id: "glossary.parameter", term: "Parameter", definition: "A numeric value used by a model operation. Trainable parameters are adjusted during learning." },
  { id: "glossary.checkpoint", term: "Checkpoint", definition: "A saved snapshot of model tensors and associated training or configuration state." },
  { id: "glossary.tokenizer", term: "Tokenizer", definition: "The rules and vocabulary that map text to token IDs and token IDs back to text." },
  { id: "glossary.gradient", term: "Gradient", definition: "A signal describing how a small parameter change would affect the training objective." },
  { id: "glossary.lora", term: "LoRA", definition: "A parameter-efficient adaptation method that trains low-rank update matrices while keeping base weights frozen." },
  { id: "glossary.artifact", term: "Model artifact", definition: "The versioned collection of weights, configuration, tokenizer assets, and metadata needed to reconstruct a model." },
  { id: "glossary.admission", term: "Admission control", definition: "The decision to accept, delay, or reject work based on service capacity and policy." },
  { id: "glossary.kv-cache", term: "KV cache", definition: "Per-layer attention keys and values retained so decode can reuse earlier token context." },
  { id: "glossary.tensor-parallel", term: "Tensor parallelism", definition: "A strategy that partitions a model operation across devices that must exchange partial results." },
  { id: "glossary.sm", term: "Streaming multiprocessor (SM)", definition: "A GPU compute neighborhood containing schedulers, execution pipelines, registers, and shared memory." },
  { id: "glossary.warp", term: "Warp", definition: "A group of 32 CUDA threads scheduled together for instruction execution." },
  { id: "glossary.coalescing", term: "Coalescing", definition: "Combining nearby memory requests from threads in a warp into fewer memory transactions." },
];

export const sourceReferences: readonly SourceReference[] = [
  { id: "source.pytorch-autograd", title: "Autograd mechanics", publisher: "PyTorch", url: "https://docs.pytorch.org/docs/main/notes/autograd.html", note: "Primary reference for forward computation graphs and reverse automatic differentiation." },
  { id: "source.hf-models", title: "Transformers model loading", publisher: "Hugging Face", url: "https://huggingface.co/docs/transformers/main_classes/model", note: "Primary runtime documentation for model configuration and state dictionaries." },
  { id: "source.hf-tokenizer", title: "Tokenizer API", publisher: "Hugging Face", url: "https://huggingface.co/docs/transformers/main_classes/tokenizer", note: "Primary reference for producing model input IDs and attention metadata." },
  { id: "source.hf-peft", title: "Parameter-efficient fine-tuning methods", publisher: "Hugging Face PEFT", url: "https://huggingface.co/docs/peft/main/methods/overview", note: "Primary library documentation for PEFT approaches and LoRA-family methods." },
  { id: "source.pytorch-tp", title: "Tensor Parallelism", publisher: "PyTorch", url: "https://docs.pytorch.org/docs/stable/distributed.tensor.parallel.html", note: "Primary framework reference for tensor-parallel module plans." },
  { id: "source.triton-batcher", title: "Triton batchers", publisher: "NVIDIA", url: "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html", note: "Primary reference for request queues, dynamic batching, and iterative inference scheduling." },
  { id: "source.triton-warmup", title: "Triton model configuration and warmup", publisher: "NVIDIA", url: "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/model_configuration.html", note: "Primary reference for model instances, loading, warmup, and readiness behavior." },
  { id: "source.hf-kv-cache", title: "Cache strategies", publisher: "Hugging Face", url: "https://huggingface.co/docs/transformers/kv_cache", note: "Primary reference for autoregressive generation and reuse of attention key/value state." },
  { id: "source.cuda-model", title: "CUDA Programming Model", publisher: "NVIDIA", url: "https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html", note: "Primary reference for grids, blocks, SM assignment, warps, and SIMT execution." },
  { id: "source.cuda-memory", title: "CUDA C++ Best Practices Guide", publisher: "NVIDIA", url: "https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html", note: "Primary reference for global-memory coalescing and performance considerations." },
];

export const glossaryRegistry = Object.freeze(
  Object.fromEntries(glossaryTerms.map((term) => [term.id, term])),
) as Readonly<Record<GlossaryId, GlossaryTerm>>;

export const sourceRegistry = Object.freeze(
  Object.fromEntries(sourceReferences.map((source) => [source.id, source])),
) as Readonly<Record<SourceId, SourceReference>>;

export function glossaryForChapter(chapterId: ChapterId): readonly GlossaryTerm[] {
  const chapter = (
    chapterRegistry as Readonly<Record<ChapterId, ChapterDefinition>>
  )[chapterId];
  return chapter.glossaryIds.map(
    (id) => glossaryRegistry[id],
  );
}

export function sourcesForChapter(chapterId: ChapterId): readonly SourceReference[] {
  const chapter = (
    chapterRegistry as Readonly<Record<ChapterId, ChapterDefinition>>
  )[chapterId];
  return chapter.sourceIds.map((id) => sourceRegistry[id]);
}
