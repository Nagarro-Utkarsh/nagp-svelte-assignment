import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'recipe-ui',
  hydratedFlag: { selector: 'attribute' },
  outputTargets: [
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
      generateTypeDeclarations: true,
    },
    { type: 'docs-readme' },
  ],
};
