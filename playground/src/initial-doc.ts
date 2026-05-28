import type { ComposedDocument } from '@page-composer/vue'

// A starting page so the canvas is not empty. One Hero, then a Grid of three
// Cards. The first card's title is bound to host data to show the resolver.
export const initialDoc: ComposedDocument = {
  version: '1',
  root: 'page',
  nodes: {
    page: { type: 'Root', zones: { main: ['n_hero', 'n_grid'] } },
    n_hero: {
      type: 'Hero',
      props: {
        eyebrow: 'Open source · MIT',
        title: 'Compose pages from the components you already ship.',
        subtitle: 'Drag your registered Vue components onto the canvas. Save a portable tree.',
        primaryLabel: 'Get started',
        secondaryLabel: 'Read the docs',
      },
    },
    n_grid: {
      type: 'Grid',
      props: { cols: 3, gap: 18 },
      zones: { items: ['c_1', 'c_2', 'c_3'] },
    },
    c_1: {
      type: 'Card',
      props: {
        title: { $bind: 'feature.title' },
        body: 'Every block updates live as data changes. No rebuilds, no stale pages.',
        variant: 'bordered',
        padding: 22,
        accent: '#e0a049',
      },
    },
    c_2: {
      type: 'Card',
      props: {
        title: 'Federated content',
        body: 'Pages stay portable across instances and frameworks.',
        variant: 'bordered',
        padding: 22,
        accent: '#54bdb6',
      },
    },
    c_3: {
      type: 'Card',
      props: {
        title: 'You own the data',
        body: 'The document is plain JSON. Store it anywhere. No vendor lock-in.',
        variant: 'bordered',
        padding: 22,
        accent: '#e07a5f',
      },
    },
  },
  data: { feature: { $source: 'collection:features' } },
}

// Sample data the resolver reads against in preview mode.
export const sampleData: Record<string, unknown> = {
  feature: { title: 'Realtime by default' },
}
