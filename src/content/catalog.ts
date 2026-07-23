import type {
  AcademyCatalog,
  ChapterDefinition,
  MultipleChoiceQuestion,
  PartDefinition,
} from "../domain/catalog";
import type {
  AnimationDefinition,
  ReplayStageDefinition,
} from "../domain/animation";

export const parts = [
  {
    id: "model-factory",
    order: 1,
    title: "Part I — The AI Model Factory",
    shortTitle: "Model Factory",
    promise:
      "Understand what weights are, how training creates them, and how a model artifact becomes deployable.",
    chapterIds: [
      "chapter.model-factory.weights",
      "chapter.model-factory.training",
      "chapter.model-factory.adaptation",
      "chapter.model-factory.artifact",
    ],
  },
  {
    id: "inference-system",
    order: 2,
    title: "Part II — The AI Inference System",
    shortTitle: "Inference System",
    promise:
      "Follow one prompt through model readiness, single-GPU inference, and coordinated multi-GPU execution.",
    chapterIds: [
      "chapter.inference-system.arrival",
      "chapter.inference-system.readiness",
      "chapter.inference-system.single-gpu",
      "chapter.inference-system.multi-gpu",
    ],
  },
  {
    id: "inside-gpu",
    order: 3,
    title: "Part III — Inside the GPU",
    shortTitle: "Inside the GPU",
    promise:
      "Zoom from a kernel launch into blocks, warps, schedulers, execution units, and memory.",
    chapterIds: [
      "chapter.inside-gpu.anatomy",
      "chapter.inside-gpu.kernel-launch",
      "chapter.inside-gpu.warp-scheduler",
      "chapter.inside-gpu.memory",
    ],
  },
] as const satisfies readonly PartDefinition[];

export const chapters = [
  {
    id: "chapter.model-factory.weights",
    partId: "model-factory",
    slug: "weights",
    order: 1,
    title: "What a model carries",
    eyebrow: "Parameters become capability",
    estimatedMinutes: 7,
    beginner: {
      summary:
        "A model is a learned function whose parameters, or weights, shape how inputs become outputs.",
      objectives: [
        "Distinguish architecture, parameters, and weights.",
        "Explain why a checkpoint is not the same as a running service.",
      ],
      blocks: [
        {
          type: "paragraph",
          text: "Think of the architecture as a machine design and the weights as billions of learned settings inside that machine.",
        },
        {
          type: "callout",
          label: "Carry this forward",
          text: "Inference does not learn new weights; it repeatedly reads the trained weights to predict tokens.",
        },
      ],
    },
    expert: {
      summary:
        "Parameter tensors are typed, shaped arrays whose precision, layout, and quantization determine storage and compute behavior.",
      objectives: [
        "Relate parameter count and numeric precision to artifact size.",
        "Recognize checkpoint sharding and tensor metadata.",
      ],
      blocks: [
        {
          type: "paragraph",
          text: "A rough dense-weight footprint is parameter count multiplied by bytes per parameter, before metadata, quantization scales, or runtime buffers.",
        },
      ],
    },
    animationIds: ["animation.model-factory.weights-map"],
    questionIds: ["question.model-factory.weights.01"],
    replayStageIds: ["replay.weights-created"],
    prerequisites: [],
  },
  {
    id: "chapter.model-factory.training",
    partId: "model-factory",
    slug: "training-loop",
    order: 2,
    title: "How training changes weights",
    eyebrow: "Predict, measure, update",
    estimatedMinutes: 9,
    beginner: {
      summary:
        "Training repeats a loop: make a prediction, measure error, and adjust weights to reduce future error.",
      objectives: [
        "Trace one forward and backward training step.",
        "Explain the purpose of loss and an optimizer.",
      ],
      blocks: [
        {
          type: "bullets",
          items: [
            "The forward pass produces a prediction.",
            "Loss measures how far it is from the target.",
            "Backpropagation assigns responsibility.",
            "The optimizer updates the weights.",
          ],
        },
      ],
    },
    expert: {
      summary:
        "Gradients flow through the computation graph and an optimizer applies parameter updates across many distributed training steps.",
      objectives: [
        "Separate activations, gradients, optimizer state, and parameters.",
        "Explain why training memory exceeds inference memory.",
      ],
      blocks: [
        {
          type: "paragraph",
          text: "Mixed precision and distributed training change storage and communication, but preserve the same causal learning loop.",
        },
      ],
    },
    animationIds: ["animation.model-factory.training-loop"],
    questionIds: ["question.model-factory.training.01"],
    replayStageIds: ["replay.weights-created"],
    prerequisites: ["chapter.model-factory.weights"],
  },
  {
    id: "chapter.model-factory.adaptation",
    partId: "model-factory",
    slug: "adaptation",
    order: 3,
    title: "Choose how to adapt",
    eyebrow: "Prompt, retrieve, tune, or train",
    estimatedMinutes: 8,
    beginner: {
      summary:
        "Different problems call for prompting, retrieval, fine-tuning, continued pretraining, or training from scratch.",
      objectives: [
        "Choose the least costly method that changes the needed behavior.",
        "Separate adding knowledge at request time from changing weights.",
      ],
      blocks: [
        {
          type: "callout",
          label: "Decision rule",
          text: "Start with prompting; add retrieval for changing facts; change weights only when behavior or domain capability requires it.",
        },
      ],
    },
    expert: {
      summary:
        "Adaptation choices trade off freshness, latency, evaluation burden, data quality, and operational complexity.",
      objectives: [
        "Compare parameter-efficient and full fine-tuning.",
        "Identify evaluation and rollback requirements.",
      ],
      blocks: [],
    },
    animationIds: ["animation.model-factory.adaptation-lab"],
    questionIds: ["question.model-factory.adaptation.01"],
    replayStageIds: [],
    prerequisites: ["chapter.model-factory.training"],
  },
  {
    id: "chapter.model-factory.artifact",
    partId: "model-factory",
    slug: "model-artifact",
    order: 4,
    title: "Package the model artifact",
    eyebrow: "From checkpoint to deployable inputs",
    estimatedMinutes: 7,
    beginner: {
      summary:
        "Serving needs weights plus configuration, tokenizer files, and enough metadata to reconstruct the model correctly.",
      objectives: [
        "Name the main pieces of a model artifact.",
        "Explain why artifact compatibility matters.",
      ],
      blocks: [
        {
          type: "bullets",
          items: [
            "Weight shards hold learned tensors.",
            "Configuration describes the architecture.",
            "Tokenizer assets map text and token IDs.",
            "Runtime metadata records formats and compatibility.",
          ],
        },
      ],
    },
    expert: {
      summary:
        "Safe artifact delivery depends on immutable versions, manifests, integrity checks, and compatible kernels.",
      objectives: [
        "Trace a sharded artifact manifest.",
        "Explain integrity and compatibility checks.",
      ],
      blocks: [],
    },
    animationIds: ["animation.model-factory.artifact-packaging"],
    questionIds: ["question.model-factory.artifact.01"],
    replayStageIds: ["replay.artifact-stored"],
    prerequisites: ["chapter.model-factory.weights"],
  },
  {
    id: "chapter.inference-system.arrival",
    partId: "inference-system",
    slug: "request-arrival",
    order: 1,
    title: "Before the request reaches a GPU",
    eyebrow: "A short arrival summary",
    estimatedMinutes: 5,
    beginner: {
      summary:
        "Authentication, routing, admission control, and batching prepare a request for inference.",
      objectives: [
        "Name the essential pre-GPU phases.",
        "Explain why batching changes throughput and wait time.",
      ],
      blocks: [
        {
          type: "paragraph",
          text: "This is intentionally a short system summary—not a packet-networking course. We follow the request only far enough to understand the GPU work it creates.",
        },
      ],
    },
    expert: {
      summary:
        "Schedulers balance queue delay, batch composition, cache locality, and service-level objectives.",
      objectives: [
        "Relate continuous batching to iteration-level scheduling.",
        "Recognize admission-control tradeoffs.",
      ],
      blocks: [],
    },
    animationIds: ["animation.inference-system.request-arrival"],
    questionIds: ["question.inference-system.arrival.01"],
    replayStageIds: ["replay.request-arrives"],
    prerequisites: ["chapter.model-factory.artifact"],
  },
  {
    id: "chapter.inference-system.readiness",
    partId: "inference-system",
    slug: "model-readiness",
    order: 2,
    title: "Load and ready the model",
    eyebrow: "Cold start to warm worker",
    estimatedMinutes: 8,
    beginner: {
      summary:
        "The runtime loads model shards into GPU memory, initializes execution, warms up, and declares the worker ready.",
      objectives: [
        "Distinguish cold and warm inference.",
        "Trace weights from storage to GPU HBM.",
      ],
      blocks: [
        {
          type: "callout",
          label: "Key distinction",
          text: "Loading prepares the model once; inference then reuses those resident weights across requests.",
        },
      ],
    },
    expert: {
      summary:
        "Readiness includes allocation, deserialization, device transfer, graph or kernel setup, communication-group initialization, and warm-up.",
      objectives: [
        "Identify cold-start bottlenecks.",
        "Explain why readiness is more than copying weight bytes.",
      ],
      blocks: [],
    },
    animationIds: ["animation.inference-system.model-loading"],
    questionIds: ["question.inference-system.readiness.01"],
    replayStageIds: ["replay.model-loaded"],
    prerequisites: ["chapter.model-factory.artifact"],
  },
  {
    id: "chapter.inference-system.single-gpu",
    partId: "inference-system",
    slug: "single-gpu-inference",
    order: 3,
    title: "Inference on one GPU",
    eyebrow: "Prompt to streamed tokens",
    estimatedMinutes: 12,
    beginner: {
      summary:
        "Tokenization, prefill, KV-cache creation, iterative decode, sampling, and streaming turn a prompt into output tokens.",
      objectives: [
        "Trace the complete single-GPU inference lifecycle.",
        "Distinguish time to first token from inter-token latency.",
      ],
      blocks: [
        {
          type: "bullets",
          items: [
            "Tokenization converts text to token IDs.",
            "Prefill processes the prompt in parallel.",
            "The KV cache preserves reusable attention state.",
            "Decode predicts one next token per sequence iteration.",
            "Sampling chooses and streams the next token.",
          ],
        },
      ],
    },
    expert: {
      summary:
        "Serving efficiency emerges from batch scheduling, kernel choice, KV-cache allocation, memory bandwidth, and sampling policy.",
      objectives: [
        "Connect prefill and decode to different bottlenecks.",
        "Explain paged KV-cache allocation and continuous batching.",
      ],
      blocks: [],
    },
    animationIds: ["animation.inference-system.prefill-decode"],
    questionIds: ["question.inference-system.single-gpu.01"],
    replayStageIds: [
      "replay.tokenized",
      "replay.prefill",
      "replay.decode",
      "replay.streamed",
    ],
    prerequisites: [
      "chapter.inference-system.arrival",
      "chapter.inference-system.readiness",
    ],
  },
  {
    id: "chapter.inference-system.multi-gpu",
    partId: "inference-system",
    slug: "multi-gpu-inference",
    order: 4,
    title: "Inference across multiple GPUs",
    eyebrow: "Replicate or cooperate",
    estimatedMinutes: 11,
    beginner: {
      summary:
        "Replicas serve independent requests, while tensor, pipeline, or expert parallelism make several GPUs cooperate on one model.",
      objectives: [
        "Distinguish replication from model parallelism.",
        "Explain why model fit, capacity, or latency can require more GPUs.",
      ],
      blocks: [
        {
          type: "callout",
          label: "Mental model",
          text: "Replication adds more identical checkout lanes. Model parallelism splits one oversized job across workers who must communicate.",
        },
      ],
    },
    expert: {
      summary:
        "Parallelism choices trade memory capacity and compute against collective communication, synchronization, cache locality, and fault domains.",
      objectives: [
        "Compare tensor, pipeline, and expert parallelism.",
        "Identify all-reduce and all-to-all communication costs.",
      ],
      blocks: [],
    },
    animationIds: ["animation.inference-system.multi-gpu"],
    questionIds: ["question.inference-system.multi-gpu.01"],
    replayStageIds: [],
    prerequisites: ["chapter.inference-system.single-gpu"],
  },
  {
    id: "chapter.inside-gpu.anatomy",
    partId: "inside-gpu",
    slug: "gpu-anatomy",
    order: 1,
    title: "Zoom into GPU anatomy",
    eyebrow: "Device to streaming multiprocessor",
    estimatedMinutes: 9,
    beginner: {
      summary:
        "A GPU contains many streaming multiprocessors that execute large numbers of related threads while sharing a memory hierarchy.",
      objectives: [
        "Locate HBM, cache, streaming multiprocessors, and execution units.",
        "Explain why GPUs favor throughput.",
      ],
      blocks: [],
    },
    expert: {
      summary:
        "Architecture-specific counts vary, but the hierarchy from device to SM, warp schedulers, register file, and functional units is durable.",
      objectives: [
        "Separate portable concepts from architecture-specific numbers.",
        "Relate occupancy resources to the SM.",
      ],
      blocks: [],
    },
    animationIds: ["animation.inside-gpu.zoom-anatomy"],
    questionIds: ["question.inside-gpu.anatomy.01"],
    replayStageIds: ["replay.gpu-zoom"],
    prerequisites: ["chapter.inference-system.single-gpu"],
  },
  {
    id: "chapter.inside-gpu.kernel-launch",
    partId: "inside-gpu",
    slug: "kernel-launch",
    order: 2,
    title: "Launch one kernel end to end",
    eyebrow: "Grid to blocks to warps",
    estimatedMinutes: 12,
    beginner: {
      summary:
        "The host launches a kernel grid; hardware assigns thread blocks to streaming multiprocessors and executes their threads in warps.",
      objectives: [
        "Trace one kernel launch from host to execution.",
        "Distinguish grids, blocks, threads, and warps.",
      ],
      blocks: [],
    },
    expert: {
      summary:
        "Launch configuration, resource usage, occupancy limits, and dependency ordering shape how quickly blocks become eligible to run.",
      objectives: [
        "Explain block residency constraints.",
        "Recognize asynchronous launch and synchronization boundaries.",
      ],
      blocks: [],
    },
    animationIds: ["animation.inside-gpu.kernel-launch"],
    questionIds: ["question.inside-gpu.kernel-launch.01"],
    replayStageIds: ["replay.kernel-launched"],
    prerequisites: ["chapter.inside-gpu.anatomy"],
  },
  {
    id: "chapter.inside-gpu.warp-scheduler",
    partId: "inside-gpu",
    slug: "warp-scheduler",
    order: 3,
    title: "How warps are scheduled",
    eyebrow: "Hide latency with eligible work",
    estimatedMinutes: 10,
    beginner: {
      summary:
        "When one warp waits, a scheduler can issue instructions from another ready warp, keeping execution units busy.",
      objectives: [
        "Explain eligible versus stalled warps.",
        "Describe how concurrency hides latency.",
      ],
      blocks: [],
    },
    expert: {
      summary:
        "Scoreboards, dependencies, divergence, instruction mix, and occupancy determine which warps can issue.",
      objectives: [
        "Interpret a scheduler timeline.",
        "Separate occupancy from achieved utilization.",
      ],
      blocks: [],
    },
    animationIds: ["animation.inside-gpu.warp-scheduler"],
    questionIds: ["question.inside-gpu.warp-scheduler.01"],
    replayStageIds: ["replay.warps-scheduled"],
    prerequisites: ["chapter.inside-gpu.kernel-launch"],
  },
  {
    id: "chapter.inside-gpu.memory",
    partId: "inside-gpu",
    slug: "memory-hierarchy",
    order: 4,
    title: "Move data through GPU memory",
    eyebrow: "Coalescing, locality, and bandwidth",
    estimatedMinutes: 11,
    beginner: {
      summary:
        "Fast execution depends on getting nearby threads to access nearby data and on reusing data close to the compute units.",
      objectives: [
        "Order the major GPU memory layers.",
        "Explain coalesced versus scattered access.",
      ],
      blocks: [],
    },
    expert: {
      summary:
        "Access width, alignment, cache behavior, shared-memory banking, and arithmetic intensity determine memory efficiency.",
      objectives: [
        "Analyze a coalesced load.",
        "Connect arithmetic intensity to compute- or memory-bound behavior.",
      ],
      blocks: [],
    },
    animationIds: ["animation.inside-gpu.coalesced-memory"],
    questionIds: ["question.inside-gpu.memory.01"],
    replayStageIds: ["replay.memory-served"],
    prerequisites: ["chapter.inside-gpu.kernel-launch"],
  },
] as const satisfies readonly ChapterDefinition[];

const choice = (
  id: string,
  label: string,
): { id: string; label: string } => ({ id, label });

export const questions = [
  {
    id: "question.model-factory.weights.01",
    chapterId: "chapter.model-factory.weights",
    kind: "single-choice",
    prompt: "During inference, what happens to the trained weights?",
    choices: [
      choice("a", "They are repeatedly read to compute predictions."),
      choice("b", "They are retrained after every token."),
      choice("c", "They are replaced by the tokenizer."),
    ],
    correctChoiceId: "a",
    explanation:
      "Inference uses fixed trained weights; it does not run the training update loop.",
  },
  {
    id: "question.model-factory.training.01",
    chapterId: "chapter.model-factory.training",
    kind: "single-choice",
    prompt: "What provides the signal used to update weights?",
    choices: [
      choice("a", "The loss and its gradients"),
      choice("b", "The tokenizer vocabulary alone"),
      choice("c", "The deployment router"),
    ],
    correctChoiceId: "a",
    explanation:
      "Loss measures error, and gradients carry that signal to the parameters.",
  },
  {
    id: "question.model-factory.adaptation.01",
    chapterId: "chapter.model-factory.adaptation",
    kind: "single-choice",
    prompt: "Which approach adds changing knowledge without modifying weights?",
    choices: [
      choice("a", "Retrieval-augmented generation"),
      choice("b", "Full fine-tuning"),
      choice("c", "Training from scratch"),
    ],
    correctChoiceId: "a",
    explanation:
      "Retrieval supplies current context at request time while leaving model weights unchanged.",
  },
  {
    id: "question.model-factory.artifact.01",
    chapterId: "chapter.model-factory.artifact",
    kind: "single-choice",
    prompt: "Which item is required alongside weights to map text to token IDs?",
    choices: [
      choice("a", "Tokenizer assets"),
      choice("b", "A GPU scheduler"),
      choice("c", "A network packet capture"),
    ],
    correctChoiceId: "a",
    explanation: "Tokenizer assets define the text-to-token mapping.",
  },
  {
    id: "question.inference-system.arrival.01",
    chapterId: "chapter.inference-system.arrival",
    kind: "single-choice",
    prompt: "Why might a serving system briefly queue compatible requests?",
    choices: [
      choice("a", "To form a batch and improve throughput"),
      choice("b", "To retrain the weights"),
      choice("c", "To remove tokenization"),
    ],
    correctChoiceId: "a",
    explanation:
      "Batching lets the GPU process work from multiple requests together.",
  },
  {
    id: "question.inference-system.readiness.01",
    chapterId: "chapter.inference-system.readiness",
    kind: "single-choice",
    prompt: "What distinguishes a warm worker from a cold one?",
    choices: [
      choice("a", "The model is already loaded and initialized."),
      choice("b", "It has no model weights."),
      choice("c", "It only accepts training jobs."),
    ],
    correctChoiceId: "a",
    explanation:
      "A warm worker has completed loading, initialization, and warm-up.",
  },
  {
    id: "question.inference-system.single-gpu.01",
    chapterId: "chapter.inference-system.single-gpu",
    kind: "single-choice",
    prompt: "What does the KV cache avoid recomputing during decode?",
    choices: [
      choice("a", "Attention state for earlier tokens"),
      choice("b", "The model architecture"),
      choice("c", "The request authentication"),
    ],
    correctChoiceId: "a",
    explanation:
      "Cached keys and values preserve attention state from tokens already processed.",
    expertExplanation:
      "The cache trades memory capacity and memory movement for lower repeated attention computation.",
  },
  {
    id: "question.inference-system.multi-gpu.01",
    chapterId: "chapter.inference-system.multi-gpu",
    kind: "single-choice",
    prompt: "Which setup makes GPUs communicate while serving one model?",
    choices: [
      choice("a", "Tensor parallelism"),
      choice("b", "Independent replicas"),
      choice("c", "Client-side tokenization"),
    ],
    correctChoiceId: "a",
    explanation:
      "Tensor parallelism splits model operations across GPUs and requires collective communication.",
  },
  {
    id: "question.inside-gpu.anatomy.01",
    chapterId: "chapter.inside-gpu.anatomy",
    kind: "single-choice",
    prompt: "Where do resident thread blocks execute?",
    choices: [
      choice("a", "On streaming multiprocessors"),
      choice("b", "In object storage"),
      choice("c", "Inside the tokenizer"),
    ],
    correctChoiceId: "a",
    explanation:
      "Thread blocks are assigned to streaming multiprocessors for execution.",
  },
  {
    id: "question.inside-gpu.kernel-launch.01",
    chapterId: "chapter.inside-gpu.kernel-launch",
    kind: "single-choice",
    prompt: "What is a grid made of?",
    choices: [
      choice("a", "Thread blocks"),
      choice("b", "Model replicas"),
      choice("c", "Weight checkpoints"),
    ],
    correctChoiceId: "a",
    explanation: "A kernel launch defines a grid containing thread blocks.",
  },
  {
    id: "question.inside-gpu.warp-scheduler.01",
    chapterId: "chapter.inside-gpu.warp-scheduler",
    kind: "single-choice",
    prompt: "How does a GPU hide a long memory wait?",
    choices: [
      choice("a", "Issue work from another eligible warp"),
      choice("b", "Retrain the model"),
      choice("c", "Restart the request"),
    ],
    correctChoiceId: "a",
    explanation:
      "Warp-level concurrency lets the scheduler issue independent ready work.",
  },
  {
    id: "question.inside-gpu.memory.01",
    chapterId: "chapter.inside-gpu.memory",
    kind: "single-choice",
    prompt: "Which access pattern is usually easier to serve efficiently?",
    choices: [
      choice("a", "Neighboring threads reading neighboring addresses"),
      choice("b", "Every thread reading an unrelated distant address"),
      choice("c", "Reading no model data"),
    ],
    correctChoiceId: "a",
    explanation:
      "Nearby addresses can be combined into fewer memory transactions.",
  },
] as const satisfies readonly MultipleChoiceQuestion[];

const stages = (
  labels: readonly string[],
): AnimationDefinition["stages"] =>
  labels.map((title, index) => ({
    id: `stage-${index + 1}`,
    title,
    beginnerNarration: title,
    expertNarration: `Inspect the runtime state for: ${title}.`,
    durationMs: 1200,
    checkpoint: index === labels.length - 1,
  }));

export const animations = [
  ["animation.model-factory.weights-map", "Map architecture to weights", ["Architecture", "Parameter tensors", "Learned weights"]],
  ["animation.model-factory.training-loop", "Run one training step", ["Forward pass", "Loss", "Backpropagation", "Optimizer update"]],
  ["animation.model-factory.adaptation-lab", "Choose an adaptation path", ["Prompt", "Retrieve", "Fine-tune", "Evaluate"]],
  ["animation.model-factory.artifact-packaging", "Package a model artifact", ["Weight shards", "Configuration", "Tokenizer", "Manifest"]],
  ["animation.inference-system.request-arrival", "Prepare a request", ["Authenticate", "Route", "Admit", "Batch"]],
  ["animation.inference-system.model-loading", "Ready an inference worker", ["Read artifact", "Transfer weights", "Initialize runtime", "Warm up", "Ready"]],
  ["animation.inference-system.prefill-decode", "Follow single-GPU inference", ["Tokenize", "Prefill", "Create KV cache", "Decode", "Sample", "Stream"]],
  ["animation.inference-system.multi-gpu", "Compare multi-GPU strategies", ["Replicate", "Shard", "Communicate", "Synchronize"]],
  ["animation.inside-gpu.zoom-anatomy", "Zoom into a GPU", ["GPU", "Streaming multiprocessor", "Warp scheduler", "Execution unit"]],
  ["animation.inside-gpu.kernel-launch", "Launch one kernel", ["Host launch", "Grid", "Block assignment", "Warp formation", "Instruction issue"]],
  ["animation.inside-gpu.warp-scheduler", "Schedule eligible warps", ["Warp ready", "Instruction issued", "Warp stalls", "Another warp issues"]],
  ["animation.inside-gpu.coalesced-memory", "Compare memory access", ["Addresses requested", "Transactions formed", "Cache checked", "Data returned"]],
  ["animation.replay.one-prompt", "Replay one prompt end to end", ["Weights created", "Artifact stored", "Model loaded", "Request arrives", "Prefill", "Kernel launch", "Warp execution", "Decode", "Token streamed"]],
] as const satisfies readonly (readonly [
  AnimationDefinition["id"],
  string,
  readonly string[],
])[];

export const animationDefinitions: readonly AnimationDefinition[] =
  animations.map(([id, title, labels]) => ({
    id,
    title,
    description: `A deterministic, stepable view of ${title.toLowerCase()}.`,
    stages: stages(labels),
    modeStrategy: "shared-progressive-disclosure",
    expertOverlays: ["timing", "queues", "memory state", "runtime details"],
  }));

export const replayStages = [
  ["replay.weights-created", 1, "Weights are learned", "model", "chapter.model-factory.training", "animation.model-factory.training-loop"],
  ["replay.artifact-stored", 2, "The artifact is stored", "model", "chapter.model-factory.artifact", "animation.model-factory.artifact-packaging"],
  ["replay.model-loaded", 3, "The model becomes ready", "request", "chapter.inference-system.readiness", "animation.inference-system.model-loading"],
  ["replay.request-arrives", 4, "A prompt is admitted", "request", "chapter.inference-system.arrival", "animation.inference-system.request-arrival"],
  ["replay.tokenized", 5, "Text becomes token IDs", "request", "chapter.inference-system.single-gpu", "animation.inference-system.prefill-decode"],
  ["replay.prefill", 6, "Prefill processes the prompt", "gpu", "chapter.inference-system.single-gpu", "animation.inference-system.prefill-decode"],
  ["replay.gpu-zoom", 7, "The view enters the GPU", "gpu", "chapter.inside-gpu.anatomy", "animation.inside-gpu.zoom-anatomy"],
  ["replay.kernel-launched", 8, "A kernel is launched", "gpu", "chapter.inside-gpu.kernel-launch", "animation.inside-gpu.kernel-launch"],
  ["replay.warps-scheduled", 9, "Warps execute instructions", "gpu", "chapter.inside-gpu.warp-scheduler", "animation.inside-gpu.warp-scheduler"],
  ["replay.memory-served", 10, "Memory supplies operands", "gpu", "chapter.inside-gpu.memory", "animation.inside-gpu.coalesced-memory"],
  ["replay.decode", 11, "Decode predicts a token", "request", "chapter.inference-system.single-gpu", "animation.inference-system.prefill-decode"],
  ["replay.streamed", 12, "The token is streamed", "request", "chapter.inference-system.single-gpu", "animation.inference-system.prefill-decode"],
] as const satisfies readonly (readonly [
  ReplayStageDefinition["id"],
  number,
  string,
  ReplayStageDefinition["systemLevel"],
  ReplayStageDefinition["chapterId"],
  ReplayStageDefinition["animationId"],
])[];

export const replayStageDefinitions: readonly ReplayStageDefinition[] =
  replayStages.map(
    ([id, order, title, systemLevel, chapterId, animationId]) => ({
      id,
      order,
      title,
      systemLevel,
      chapterId,
      animationId,
      beginnerNarration: title,
      expertNarration: `Reveal timing, data movement, and execution state as ${title.toLowerCase()}.`,
    }),
  );

function indexById<T extends { id: string }>(
  entries: readonly T[],
): Readonly<Record<T["id"], T>> {
  return Object.freeze(
    Object.fromEntries(entries.map((entry) => [entry.id, entry])),
  ) as Readonly<Record<T["id"], T>>;
}

export const partRegistry = indexById(parts);
export const chapterRegistry = indexById(chapters);
export const questionRegistry = indexById(questions);
export const animationRegistry = indexById(animationDefinitions);
export const replayStageRegistry = indexById(replayStageDefinitions);

export const academyCatalog: AcademyCatalog = {
  parts,
  chapters,
  questions,
};
