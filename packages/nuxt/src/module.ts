import { defineNuxtModule, addComponent, addImportsDir, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Also register the PageComposer editor as a global component. It is client
   * only, since authoring does not happen on the server. Default false.
   */
  editor: boolean
  /** Inject the Page Composer stylesheet. Default true. */
  css: boolean
  /** Prefix for the registered component names, for example `Pc`. Default ''. */
  prefix: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-page-composer',
    configKey: 'pageComposer',
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: {
    editor: false,
    css: true,
    prefix: '',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // The renderer is SSR-safe, so register it globally for any route.
    addComponent({
      name: `${options.prefix}ComposedPage`,
      export: 'ComposedPage',
      filePath: '@page-composer/vue',
    })

    // The editor is client only.
    if (options.editor) {
      addComponent({
        name: `${options.prefix}PageComposer`,
        export: 'PageComposer',
        filePath: '@page-composer/vue',
        mode: 'client',
      })
    }

    if (options.css) {
      nuxt.options.css.push('@page-composer/vue/styles.css')
    }

    addImportsDir(resolver.resolve('./runtime/composables'))
  },
})
