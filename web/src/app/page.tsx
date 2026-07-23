import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories, threads, users } from "@/db/schema";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CharacterCard } from "@/components/CharacterCard";
import { StoryTile } from "@/components/StoryTile";
import { StarRating } from "@/components/StarRating";
import { listCharacters, trendingScore } from "@/lib/discovery";
import { ratingAggregates } from "@/lib/ratings";
import { getCurrentUserId } from "@/lib/session";
import { HomePersonalization } from "@/components/HomePersonalization";
import type { CompanionGender } from "@/lib/gender";

/**
 * THESIS: The home page starts with a person and a moment, not a generic promise.
 * OWN-WORLD: An after-hours character index mixes a focused feature entry with a compact, image-led catalogue.
 * STORY: Meet one companion, enter one scene, then choose the next thread that catches your attention.
 * FIRST VIEWPORT: A real portrait, a specific hook, and two clear routes - read or chat.
 * FORM: Editorial two-column lead on wide screens; portrait-first vertical entry on small screens.
 */

export const dynamic = "force-dynamic";

async function recentStories() {
  try {
    const rows = await db
      .select({
        id: stories.id,
        title: stories.title,
        content: stories.content,
        characterId: stories.characterId,
        reads: stories.reads,
        name: sql<string>`${characters.definition}->>'name'`,
      })
      .from(stories)
      .innerJoin(characters, eq(stories.characterId, characters.id))
      .where(and(eq(stories.isPublic, true), eq(characters.status, "published")))
      .orderBy(desc(stories.createdAt))
      .limit(9);
    let ratingByStory = new Map<string, { average: number; count: number }>();
    try {
      ratingByStory = await ratingAggregates("story", rows.map((row) => row.id));
    } catch {
      // Ratings are intentionally optional while older deployments catch up.
    }
    return rows.map((row) => {
      const rating = ratingByStory.get(row.id) ?? { average: 0, count: 0 };
      return {
        id: row.id,
        title: row.title,
        name: row.name,
        characterId: row.characterId,
        reads: row.reads,
        rating: rating.average,
        ratingCount: rating.count,
        snippet: row.content.replace(/\s+/g, " ").slice(0, 150),
      };
    });
  } catch {
    return [];
  }
}

async function recentThreads(userId: string) {
  try {
    const rows = await db
      .select({
        characterId: threads.characterId,
        name: sql<string>`${characters.definition}->>'name'`,
        lastActiveAt: threads.lastActiveAt,
      })
      .from(threads)
      .innerJoin(characters, eq(threads.characterId, characters.id))
      .where(and(eq(threads.userId, userId), eq(characters.status, "published")))
      .orderBy(desc(threads.lastActiveAt))
      .limit(30);
    const seen = new Set<string>();
    const output: { characterId: string; name: string; lastActiveAt: Date }[] = [];
    for (const row of rows) {
      if (seen.has(row.characterId)) continue;
      seen.add(row.characterId);
      output.push(row);
      if (output.length === 8) break;
    }
    return output;
  } catch {
    return [];
  }
}

async function topStoryFor(characterId: string): Promise<string | null> {
  try {
    const [row] = await db
      .select({ id: stories.id })
      .from(stories)
      .where(and(eq(stories.characterId, characterId), eq(stories.isPublic, true)))
      .orderBy(desc(stories.reads))
      .limit(1);
    return row?.id ?? null;
  } catch {
    return null;
  }
}

function dailyPick<T>(list: T[], seed: string): T | null {
  if (!list.length) return null;
  const day = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (const character of day + seed) hash = (hash * 31 + character.charCodeAt(0)) % 1_000_000;
  return list[hash % list.length];
}

export default async function Home() {
  const viewerId = await getCurrentUserId();
  const [feed, preferences, continueWith] = await Promise.all([
    recentStories(),
    viewerId
      ? db
          .select({ companionGenderPreferences: users.companionGenderPreferences })
          .from(users)
          .where(eq(users.id, viewerId))
          .limit(1)
          .then(([row]) =>
            Array.isArray(row?.companionGenderPreferences)
              ? (row.companionGenderPreferences as CompanionGender[])
              : null,
          )
          .catch(() => null)
      : Promise.resolve(null),
    viewerId ? recentThreads(viewerId) : Promise.resolve([]),
  ]);

  const allCharacters = await listCharacters({
    viewerId: viewerId ?? undefined,
    genders: preferences ?? undefined,
  }).catch(() => []);
  const trending = [...allCharacters]
    .sort((a, b) => trendingScore(b.reads, b.createdAt) - trendingScore(a.reads, a.createdAt))
    .slice(0, 6);
  const empty = trending.length === 0 && feed.length === 0;
  const withImage = allCharacters.filter((character) => character.hasImage);
  const knownIds = new Set(continueWith.map((thread) => thread.characterId));
  const spotlightCandidates = withImage.length ? withImage : allCharacters;
  const undiscovered = spotlightCandidates.filter((character) => !knownIds.has(character.id));
  const spotlight = dailyPick(undiscovered.length ? undiscovered : spotlightCandidates, viewerId ?? "anon");
  const spotlightStoryId = spotlight ? await topStoryFor(spotlight.id) : null;
  const worldPool = (withImage.length >= 4 ? withImage : allCharacters).filter((character) => character.id !== spotlight?.id);
  const worlds = worldPool.slice(0, 8);
  const moodCounts = new Map<string, number>();
  for (const character of allCharacters) {
    for (const tag of character.tags) moodCounts.set(tag, (moodCounts.get(tag) ?? 0) + 1);
  }
  const moods = [...moodCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);

  return (
    <main className="rv-home rv-home-index">
      {spotlight ? (
        <section className="rv-home-entry rv-reveal" aria-labelledby="home-entry-title">
          <div className="rv-home-entry-copy">
            <div className="rv-home-entry-kicker"><span>Tonight&apos;s entry</span><span>01 / discover</span></div>
            <p className="rv-home-entry-type">Interactive fiction with a character who remembers where the scene left off.</p>
            <h1 id="home-entry-title">{spotlight.name}</h1>
            {spotlight.tagline ? <p className="rv-home-entry-hook">{spotlight.tagline}</p> : null}
            {spotlight.greeting ? <p className="rv-home-entry-quote">&ldquo;{spotlight.greeting}&rdquo;</p> : null}
            {spotlight.tags.length ? <div className="rv-home-entry-tags">{spotlight.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
            <div className="rv-home-entry-actions">
              <a href={spotlightStoryId ? `/story/${spotlightStoryId}` : `/story?characterId=${spotlight.id}`} className="rv-btn rv-btn-primary rv-home-entry-primary">Read the opening</a>
              <a href={`/chat?characterId=${spotlight.id}`} className="rv-btn rv-home-entry-secondary">Chat with {spotlight.name}</a>
            </div>
            <a className="rv-home-entry-browse" href="/browse">Or browse every companion</a>
          </div>
          <div className="rv-home-entry-art">
            <div className="rv-home-entry-art-frame"><CharacterAvatar characterId={spotlight.id} name={spotlight.name} shape="rect" /></div>
            <div className="rv-home-entry-caption"><span>Tonight&apos;s scene</span><strong>{spotlight.tags[0] ?? "A new connection"}</strong></div>
          </div>
        </section>
      ) : (
        <section className="rv-home-fallback rv-reveal">
          <p>Interactive fiction</p><h1>Pick a person. Enter a scene.</h1><a className="rv-btn rv-btn-primary" href="/browse">Browse companions</a>
        </section>
      )}

      {viewerId ? <HomePersonalization /> : null}

      {continueWith.length > 0 ? (
        <section className="rv-home-continue rv-reveal rv-d1">
          <div className="rv-home-section-head"><div><p>Continue your thread</p><span>Pick up the last thing you shared.</span></div></div>
          <div className="rv-home-continue-row">
            {continueWith.map((thread) => (
              <a key={thread.characterId} href={`/chat?characterId=${thread.characterId}`} className="rv-home-continue-item">
                <div className="rv-home-continue-ring"><CharacterAvatar characterId={thread.characterId} name={thread.name} size={58} /></div>
                <span>{thread.name}</span>
                <small>{new Date(thread.lastActiveAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {moods.length ? (
        <section className="rv-home-filters rv-reveal rv-d1">
          <div className="rv-home-section-head"><div><p>Find a feeling</p></div><a href="/browse">Browse all</a></div>
          <div className="rv-home-filter-strip">
            <a href="/browse" className="rv-chip rv-home-filter-current">All companions</a>
            <a href="/companions/female" className="rv-chip rv-home-filter">Women</a>
            <a href="/companions/male" className="rv-chip rv-home-filter">Men</a>
            {moods.map((tag) => <a key={tag} href={`/tag/${encodeURIComponent(tag)}`} className="rv-chip rv-home-filter">{tag}</a>)}
          </div>
        </section>
      ) : null}

      {worlds.length > 0 ? (
        <section className="rv-home-shelf rv-reveal rv-d2">
          <div className="rv-home-section-head"><div><p>Choose a thread</p><span>Opening moments that can become a conversation.</span></div><a href="/story">Start your own</a></div>
          <div className="rv-home-story-grid">
            {worlds.map((character) => <StoryTile key={character.id} t={{ id: character.id, name: character.name, hook: character.tagline, tags: character.tags, hasImage: character.hasImage }} />)}
          </div>
        </section>
      ) : null}

      {trending.length > 0 ? (
        <section className="rv-home-shelf rv-reveal rv-d2">
          <div className="rv-home-section-head"><div><p>People moving tonight</p><span>Characters readers are opening scenes with.</span></div><a href="/browse">See everyone</a></div>
          <div className="rv-companion-grid">{trending.map((character) => <CharacterCard key={character.id} c={character} />)}</div>
        </section>
      ) : null}

      {feed.length > 0 ? (
        <section className="rv-home-shelf rv-reveal rv-d3">
          <div className="rv-home-section-head"><div><p>Fresh from the community</p><span>Scenes readers have already started.</span></div><a href="/stories">Browse stories</a></div>
          <div className="rv-home-community-grid">
            {feed.map((story) => (
              <a key={story.id} href={`/story/${story.id}`} className="rv-home-community-card">
                <div className="rv-home-community-top"><CharacterAvatar characterId={story.characterId} name={story.name} size={34} /><div><strong>{story.title}</strong><span>with {story.name}</span></div></div>
                <p>{story.snippet}...</p>
                <span className="rv-home-community-meta">{story.reads} view{story.reads === 1 ? "" : "s"}{story.ratingCount ? <> <StarRating value={story.rating} count={story.ratingCount} size={11} showNumber={false} /> {story.rating.toFixed(1)}</> : null}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {empty ? (
        <div className="rv-home-empty rv-reveal rv-d1">
          <p>The library is waiting for its first story.</p>
          <span>Create a companion, set the opening, then let readers meet them there.</span>
          <div><a href="/create" className="rv-btn rv-btn-primary rv-home-entry-primary">Create a companion</a><a href="/story" className="rv-btn rv-home-entry-secondary">Begin a story</a></div>
        </div>
      ) : null}
    </main>
  );
}
