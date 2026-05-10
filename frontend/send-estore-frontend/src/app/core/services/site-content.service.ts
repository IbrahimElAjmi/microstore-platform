import { Injectable } from '@angular/core';

export interface AboutContent {
  title: string;
  subtitle: string;
  story: string;
  mission: string;
  values: string;
}

export interface ContactContent {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  supportText: string;
}

export interface SiteContent {
  about: AboutContent;
  contact: ContactContent;
}

const DEFAULT_CONTENT: SiteContent = {
  about: {
    title: 'A propos de E-Store',
    subtitle: 'Une boutique en ligne simple, rapide et fiable pour acheter vos produits essentiels.',
    story: 'E-Store rassemble catalogue, panier, paiement et suivi de commandes dans une experience claire. Notre objectif est de proposer des produits bien organises, un parcours d achat fluide et un service client accessible.',
    mission: 'Aider les clients a trouver rapidement les bons produits, avec des informations claires et une commande facile a suivre.',
    values: 'Qualite des produits, transparence des prix, service client reactif, gestion fiable des commandes.'
  },
  contact: {
    title: 'Contactez-nous',
    subtitle: 'Notre equipe est disponible pour les questions sur les produits, les commandes et le support.',
    email: 'support@estore.com',
    phone: '+212 600 000 000',
    address: 'Casablanca, Maroc',
    hours: 'Lundi - Samedi: 09:00 - 18:00',
    supportText: 'Envoyez-nous un message avec votre question. Nous vous repondrons dans les meilleurs delais.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class SiteContentService {
  private readonly storageKey = 'estoreSiteContent';

  getContent(): SiteContent {
    if (typeof localStorage === 'undefined') {
      return DEFAULT_CONTENT;
    }

    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return DEFAULT_CONTENT;
    }

    try {
      return { ...DEFAULT_CONTENT, ...JSON.parse(stored) };
    } catch {
      localStorage.removeItem(this.storageKey);
      return DEFAULT_CONTENT;
    }
  }

  saveContent(content: SiteContent): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(content));
    }
  }

  resetContent(): SiteContent {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
    return DEFAULT_CONTENT;
  }
}
