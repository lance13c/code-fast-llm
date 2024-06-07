export type CodeBlock = {
  type: 'add' | 'replace' | 'delete';
  start: number;
  end?: number;
  code?: string;
};

export type CodeResponse = {
  codeBlocks: CodeBlock[];
};
