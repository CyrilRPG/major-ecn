import { loadArenaNavigation } from '@/lib/arena/navigation-context';
import { ExperienceNavigation } from './experience-navigation';

/** Server entry point for pages without a tournament context of their own. */
export async function ArenaNavigation({ slug }: { slug?: string }) {
  return <ExperienceNavigation nav={await loadArenaNavigation(slug)} />;
}
