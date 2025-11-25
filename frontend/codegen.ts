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
        enumsAsTypes: true, // Required for `erasableSyntaxOnly` in tsconfig.app.json
        useTypeImports: true, // Required for `verbatimModuleSyntax` in tsconfig.app.json
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
