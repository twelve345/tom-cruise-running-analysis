import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['src/**/*.ts', 'src/**/*.tsx'],
  generates: {
    './src/gql/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        scalars: {
          ID: 'string',
        },
        // TypeScript config compatibility
        enumsAsTypes: true, // Required for erasableSyntaxOnly
        useTypeImports: true, // Required for verbatimModuleSyntax
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
