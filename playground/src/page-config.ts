import { definePageConfig } from '@page-composer/vue'
import Hero from './components/Hero.vue'
import Card from './components/Card.vue'
import Grid from './components/Grid.vue'
import Section from './components/Section.vue'
import Heading from './components/Heading.vue'
import TextBlock from './components/TextBlock.vue'
import ActionButton from './components/ActionButton.vue'
import Repeater from './components/Repeater.vue'

export const config = definePageConfig({
  categories: {
    layout: { title: 'Layout', order: 0 },
    content: { title: 'Content', order: 1 },
    data: { title: 'Data', order: 2 },
  },
  components: {
    Section: {
      label: 'Section',
      category: 'layout',
      icon: 'section',
      render: Section,
      zones: ['content'],
      fields: {
        tone: {
          type: 'segment',
          label: 'Tone',
          options: ['paper', 'tint', 'dark'],
          default: 'paper',
        },
      },
      defaultProps: { tone: 'paper' },
    },
    Grid: {
      label: 'Grid',
      category: 'layout',
      icon: 'grid',
      render: Grid,
      zones: ['items'],
      fields: {
        cols: { type: 'number', label: 'Columns', default: 3, min: 1, max: 6 },
        gap: { type: 'number', label: 'Gap', unit: 'px', default: 18, min: 0, max: 64 },
      },
      defaultProps: { cols: 3, gap: 18 },
    },
    Hero: {
      label: 'Hero',
      category: 'content',
      icon: 'hero',
      render: Hero,
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow', bindable: true },
        title: { type: 'text', label: 'Title', bindable: true },
        subtitle: { type: 'textarea', label: 'Subtitle', bindable: true },
        primaryLabel: { type: 'text', label: 'Primary button' },
        secondaryLabel: { type: 'text', label: 'Secondary button' },
        badges: {
          type: 'array',
          label: 'Badges',
          of: { type: 'text' },
          description: 'Small pills shown under the buttons.',
        },
      },
      defaultProps: {
        eyebrow: 'Open source · MIT',
        title: 'Compose pages from the components you already ship.',
        subtitle: 'Drag your registered Vue components onto the canvas. Save a portable tree.',
      },
    },
    Heading: {
      label: 'Heading',
      category: 'content',
      icon: 'heading',
      render: Heading,
      fields: {
        text: { type: 'text', label: 'Text', bindable: true },
        level: { type: 'segment', label: 'Level', options: ['1', '2', '3'], default: '2' },
        align: { type: 'segment', label: 'Align', options: ['left', 'center'], default: 'center' },
      },
      defaultProps: { text: 'Section heading', level: '2', align: 'center' },
    },
    Text: {
      label: 'Text',
      category: 'content',
      icon: 'text',
      render: TextBlock,
      fields: {
        content: { type: 'textarea', label: 'Content', bindable: true },
        align: { type: 'segment', label: 'Align', options: ['left', 'center'], default: 'center' },
      },
      defaultProps: { content: 'Write some copy here.', align: 'center' },
    },
    Card: {
      label: 'Card',
      category: 'content',
      icon: 'card',
      render: Card,
      fields: {
        title: { type: 'text', label: 'Title', bindable: true },
        body: { type: 'textarea', label: 'Body', bindable: true },
        icon: { type: 'custom', label: 'Icon', component: 'iconPicker' },
        variant: {
          type: 'segment',
          label: 'Variant',
          options: ['plain', 'bordered', 'filled'],
          default: 'bordered',
        },
        elevated: { type: 'boolean', label: 'Elevated shadow', default: false },
        padding: { type: 'number', label: 'Padding', unit: 'px', default: 22 },
        accent: { type: 'color', label: 'Accent', default: '#e0a049' },
      },
      defaultProps: { variant: 'bordered', padding: 22, accent: '#e0a049', icon: 'zap' },
    },
    Button: {
      label: 'Button',
      category: 'content',
      icon: 'button',
      render: ActionButton,
      fields: {
        label: { type: 'text', label: 'Label' },
        variant: {
          type: 'segment',
          label: 'Variant',
          options: ['primary', 'secondary'],
          default: 'primary',
        },
      },
      defaultProps: { label: 'Get started', variant: 'primary' },
    },
    Repeater: {
      label: 'Repeater',
      category: 'data',
      icon: 'repeater',
      render: Repeater,
      zones: ['item'],
      // Render the `item` zone once per record in the bound `source` list.
      repeat: { zone: 'item', source: 'source' },
      fields: {
        source: {
          type: 'text',
          label: 'Data source',
          bindable: true,
          description: 'Bind to a list in your data, for example features.',
        },
        cols: { type: 'number', label: 'Columns', default: 3, min: 1, max: 6 },
      },
      defaultProps: { cols: 3 },
    },
  },
})
