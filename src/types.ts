export type CodeBlock = {
  type: 'add' | 'replace' | 'delete';
  start: string; // Regular expression string
  end?: string; // Optional regular expression string
  code?: string;
};

export type CodeResponse = {
  codeBlocks: CodeBlock[];
};
