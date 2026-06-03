// ============================================================
// TourOS POS — Serviço de Tours (API TourOS)
// ============================================================

import apiClient from './apiClient';
import type { Tour } from '../types';

export async function getExperience(
  id: number,
  language: string = 'pt',
): Promise<Tour> {
  const response = await apiClient.get(`/api/v2/experiences/${id}`, {
    params: { lang: language },
  });

  const raw = response.data?.data ?? response.data;

  // Log completo para debug
  console.log(
    `[API] Tour ${id} prices:`,
    JSON.stringify({
      prices: raw.prices,
      min_price: raw.min_price,
      price: raw.price,
      options_0: raw.options?.[0]?.prices ?? raw.options?.[0]?.price,
    }),
  );

  return mapApiResponseToTour(raw);
}

function mapApiResponseToTour(raw: any): Tour {
  const typeBlock = raw.type ?? raw.experience_type ?? null;
  const typeId = typeBlock?.id ?? null;

  // A API só tem um preço único para todos os tipos
  const price = raw.prices?.price ?? raw.min_price ?? raw.price ?? 0;

  return {
    id: raw.id,
    name: raw.name ?? raw.title ?? 'Experiência sem título',
    status: raw.status ?? 'inactive',
    type: { id: typeId },
    duration: calculateDuration(raw),
    price: {
      adult: price,
      child: price, // mesmo preço que adulto
      baby: 0, // bebés grátis (como na app PHP — "BEBÉ X2" sem preço)
    },
    images: (raw.images ?? []).map((img: any) => ({
      url: img.url ?? img,
    })),
    description: raw.description ?? raw.summary ?? '',
    languages: extractLanguages(raw.options ?? []),
  };
}

function extractLanguages(options: any[]): string[] {
  const langSet = new Set<string>();
  for (const option of options) {
    for (const lang of option.languages ?? []) {
      langSet.add(lang.toLowerCase());
    }
  }
  return Array.from(langSet);
}

function calculateDuration(data: any): string {
  if (data.options?.[0]?.duration) {
    const opt = data.options[0].duration;
    const unit = opt.unit === 'hours' ? 'h' : ' min';
    return opt.amount + unit;
  }

  if (data.itinerary && Array.isArray(data.itinerary)) {
    let totalMinutes = 0;
    for (const step of data.itinerary) {
      const amount = step.duration?.amount ?? 0;
      const type = step.duration?.type ?? 'minutes';
      totalMinutes +=
        type === 'hours' || type === 'hour' ? amount * 60 : amount;
    }
    if (totalMinutes > 0) {
      return totalMinutes >= 60
        ? totalMinutes / 60 + 'h'
        : totalMinutes + ' min';
    }
  }

  if (data.duration) return data.duration;
  return '1h';
}
