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
        enumType: 'string-literal', // Type-only enums, required for `erasableSyntaxOnly` in tsconfig.app.json
        useTypeImports: true, // Required for `verbatimModuleSyntax` in tsconfig.app.json
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
