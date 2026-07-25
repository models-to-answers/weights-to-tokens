import { chapters, parts } from "@/src/content";
import type { ChapterId } from "@/src/domain";

type IntroductionDestination = ChapterId | "replay";

type AcademyIntroductionProps = {
  onNavigate: (destination: IntroductionDestination) => void;
  feedbackUrl: string;
};

const outcomes = [
  "What a model contains and how training produces its weights.",
  "How prompting, RAG, fine-tuning, and pretraining change what a model can do.",
  "How a model artifact is packaged, loaded, and made ready for inference.",
  "What happens during prefill, KV-cache creation, and token-by-token decode.",
  "How single-GPU inference works and why some models coordinate multiple GPUs.",
  "How kernels, blocks, warps, schedulers, and GPU memory execute the work.",
] as const;

const sectionDetails = {
  "model-factory": {
    takeaway: "Understand the model before it starts answering.",
    description:
      "See how architecture, training, adaptation, and packaging create the artifact an inference system can run.",
  },
  "inference-system": {
    takeaway: "Follow a request as it becomes generated tokens.",
    description:
      "Trace request preparation, model readiness, prefill, decode, KV cache, and single- or multi-GPU execution.",
  },
  "inside-gpu": {
    takeaway: "See how the calculations execute inside one GPU.",
    description:
      "Zoom through kernels, blocks, warps, schedulers, execution pipelines, and the memory hierarchy.",
  },
} as const;

export function AcademyIntroduction({
  onNavigate,
  feedbackUrl,
}: AcademyIntroductionProps) {
  return (
    <article className="introduction">
      <section className="introduction-hero">
        <div className="introduction-hero__copy">
          <p className="lesson-number">Interactive academy</p>
          <h1>How AI Models Produce Answers</h1>
          <p className="introduction-subtitle">
            From Weights to Tokens: An Interactive Journey Through Models,
            Inference, and GPUs
          </p>
          <p className="introduction-promise">
            Follow an AI model from how it is created and packaged, through
            inference, into the GPU, until the final answer is generated.
          </p>
          <div className="introduction-actions">
            <a
              className="primary-button"
              href={`/learn/${chapters[0].slug}`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(chapters[0].id);
              }}
            >
              Start the recommended journey
            </a>
            <a className="secondary-link" href="#choose-your-path">
              Choose a section
            </a>
          </div>
        </div>

        <aside className="introduction-hero__map" aria-label="Journey overview">
          <p>One connected story</p>
          <ol>
            <li><span>01</span><strong>Build the model</strong></li>
            <li><span>02</span><strong>Run inference</strong></li>
            <li><span>03</span><strong>Execute on GPUs</strong></li>
            <li><span>04</span><strong>Generate the answer</strong></li>
          </ol>
        </aside>
      </section>

      <section className="introduction-grid" aria-label="Academy introduction">
        <div className="introduction-card">
          <p className="section-label">The learning promise</p>
          <h2>See the entire path, then zoom in without losing the thread.</h2>
          <p>
            The same model, request, and generated answer connect every part.
            Each chapter adds detail while preserving that end-to-end story.
          </p>
        </div>

        <div className="introduction-card">
          <p className="section-label">Audience</p>
          <h2>Who this is for</h2>
          <p>
            Product leaders, architects, software and infrastructure engineers,
            and curious learners who understand AI conceptually but do not need
            to begin as GPU specialists.
          </p>
        </div>
      </section>

      <section className="introduction-outcomes">
        <div>
          <p className="section-label">Key outcomes</p>
          <h2>What you will understand</h2>
          <p>
            By the finale, you should be able to explain one AI response at
            three levels: the model, the inference system, and the GPU.
          </p>
        </div>
        <ul>
          {outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
        </ul>
      </section>

      <section className="introduction-depth">
        <div>
          <span>Beginner</span>
          <strong>Beginner is the complete guided path.</strong>
          <p>
            It uses plain language, causal diagrams, and the essential checks
            needed to understand the whole journey.
          </p>
        </div>
        <div>
          <span>Expert</span>
          <strong>Expert adds the mechanisms underneath.</strong>
          <p>
            It keeps the same chapters and animation state while revealing
            terminology, numbers, implementation choices, and trade-offs.
          </p>
        </div>
      </section>

      <section className="introduction-paths" id="choose-your-path">
        <div className="introduction-section-heading">
          <div>
            <p className="section-label">Four-part journey</p>
            <h2>Follow the sequence or enter where you are curious.</h2>
          </div>
          <p>
            The recommended order builds one mental model. Every section can
            also be opened directly.
          </p>
        </div>

        <nav
          className="introduction-path-grid"
          aria-label="Choose a journey section"
        >
          {parts.map((part) => {
            const firstChapter = chapters.find(
              (chapter) => chapter.partId === part.id,
            )!;
            const detail = sectionDetails[part.id];
            return (
              <a
                key={part.id}
                href={`/learn/${firstChapter.slug}`}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(firstChapter.id);
                }}
              >
                <span>0{part.order}</span>
                <strong>{part.title}</strong>
                <em>{detail.takeaway}</em>
                <p>{detail.description}</p>
                <b>Open section →</b>
              </a>
            );
          })}

          <a
            href="/replay"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("replay");
            }}
          >
            <span>04</span>
            <strong>One Prompt, End to End</strong>
            <em>Connect every stage in one continuous replay.</em>
            <p>
              Watch one request move from arrival and model readiness through
              GPU execution until the completed answer streams back.
            </p>
            <b>Open finale →</b>
          </a>
        </nav>
      </section>

      <section className="introduction-feedback">
        <div>
          <p className="section-label">Help improve the academy</p>
          <h2>What became clearer—and what did not?</h2>
          <p>
            Tell us which section you reviewed, what worked, and what still
            needs a better explanation. Responses are collected in Google
            Forms; the academy does not store your feedback or email address.
          </p>
        </div>
        <a
          className="primary-button"
          href={feedbackUrl}
          target="_blank"
          rel="noreferrer"
        >
          Share feedback
        </a>
      </section>
    </article>
  );
}
