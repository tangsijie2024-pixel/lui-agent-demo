import { Place, UserMemory } from '../../types';

function vibeScore(place: Place, memory: UserMemory): number {
  const userVibes = new Set(memory.lifestyle.vibes.map(v => v.toLowerCase()));
  const placeVibes = place.vibes.map(v => v.toLowerCase());
  return placeVibes.filter(v => userVibes.has(v)).length;
}

function areaScore(place: Place, memory: UserMemory): number {
  return memory.lifestyle.favorite_areas.includes(place.area) ? 1 : 0;
}

function avoidPenalty(place: Place, memory: UserMemory): number {
  const avoidTerms = memory.lifestyle.avoid.map(a => a.toLowerCase());
  const placeText = [place.name, place.category, ...place.vibes]
    .join(' ')
    .toLowerCase();
  return avoidTerms.filter(term => placeText.includes(term)).length;
}

function bestForScore(place: Place, memory: UserMemory): number {
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 4;
  const isEvening = hour >= 17 && hour < 20;

  let score = 0;
  if (memory.social.solo_comfort && place.best_for.includes('独处')) score += 1;
  if (memory.social.usual_group_size <= 2 && place.best_for.includes('小聚')) score += 1;
  if (memory.schedule.night_owl && isNight && place.best_for.includes('深夜')) score += 1;
  if (isEvening && place.best_for.includes('夜晚')) score += 1;
  if (place.best_for.includes('下班放松') || place.best_for.includes('解压')) score += 1;
  return score;
}

export function filterByProfile(places: Place[], memory: UserMemory): Place[] {
  const { range_min, range_max } = memory.consumption;

  const scored = places
    .filter(p => p.price_per_person >= range_min && p.price_per_person <= range_max)
    .map(p => ({
      place: p,
      score:
        vibeScore(p, memory) * 3 +
        areaScore(p, memory) * 2 +
        bestForScore(p, memory) * 2 -
        avoidPenalty(p, memory) * 4,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map(({ place }) => place);
}
