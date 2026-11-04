"use client";

import type { StoryChapter as StoryChapterType } from "./types";

export interface StoryChapterProps {
  chapter: StoryChapterType;
  index: number;
  total: number;
  active: boolean;
}

/**
 * A chapter is plain semantic HTML. It never depends on the canvas: if the scene
 * fails, the text, the links and the CTA are still exactly here.
 */
export function StoryChapter({ chapter, index, total, active }: StoryChapterProps) {
  return (
    <article
      id={chapter.id}
      data-mk-chapter
      data-mk-index={index}
      data-active={active}
      className="mk-chapter"
      aria-label={`Chương ${chapter.index} trên ${total}`}
    >
      <header className="mk-chapter__head">
        <span className="mk-chapter__index">{chapter.index}</span>
        {chapter.kicker ? <span className="mk-chapter__kicker">{chapter.kicker}</span> : null}
      </header>
      <h3 className="mk-chapter__title">{chapter.title}</h3>
      <p className="mk-chapter__body">{chapter.body}</p>
      {chapter.points && chapter.points.length > 0 ? (
        <ul className="mk-chapter__points">
          {chapter.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
