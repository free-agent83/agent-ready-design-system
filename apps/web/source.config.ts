import { defineDocs, defineConfig } from "fumadocs-mdx/config";

// Docs content lives in content/docs (authored MDX). Task 4.2 generates the
// component pages from the COMPONENT.md files into here.
export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig();
