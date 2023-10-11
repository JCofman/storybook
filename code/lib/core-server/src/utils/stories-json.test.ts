import { describe, beforeEach, it, expect, vi } from 'vitest';

import type { Router, Request, Response } from 'express';
import Watchpack from 'watchpack';
import path from 'path';
import debounce from 'lodash/debounce.js';
// @ts-expect-error -- cannot find declaration file
import { createStoriesMdxIndexer } from '@storybook/addon-docs/preset';
import { STORY_INDEX_INVALIDATED } from '@storybook/core-events';
import type { StoryIndex } from '@storybook/types';
import { normalizeStoriesEntry } from '@storybook/core-common';

import { useStoriesJson, DEBOUNCE, convertToIndexV3 } from './stories-json';
import type { ServerChannel } from './get-server-channel';
import type { StoryIndexGeneratorOptions } from './StoryIndexGenerator';
import { StoryIndexGenerator } from './StoryIndexGenerator';
import { csfIndexer } from '../presets/common-preset';

vi.mock('watchpack');
vi.mock('lodash/debounce');
vi.mock('@storybook/node-logger');

const workingDir = path.join(__dirname, '__mockdata__');
const normalizedStories = [
  normalizeStoriesEntry(
    {
      titlePrefix: '',
      directory: './src',
      files: '**/*.stories.@(ts|js|mjs|jsx)',
    },
    { workingDir, configDir: workingDir }
  ),
  normalizeStoriesEntry(
    {
      titlePrefix: '',
      directory: './src',
      files: '**/*.mdx',
    },
    { workingDir, configDir: workingDir }
  ),
];

const getInitializedStoryIndexGenerator = async (
  overrides: any = {},
  inputNormalizedStories = normalizedStories
) => {
  const options: StoryIndexGeneratorOptions = {
    storyIndexers: [],
    indexers: [csfIndexer, createStoriesMdxIndexer(false)],
    configDir: workingDir,
    workingDir,
    storiesV2Compatibility: false,
    storyStoreV7: true,
    docs: { defaultName: 'docs', autodocs: false },
    ...overrides,
  };
  const generator = new StoryIndexGenerator(inputNormalizedStories, options);
  await generator.initialize();
  return generator;
};

describe('useStoriesJson', () => {
  const use = vi.fn();
  const router: Router = { use } as any;
  const send = vi.fn();
  const write = vi.fn();
  const response: Response = {
    header: vi.fn(),
    send,
    status: vi.fn(),
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
    write,
    flush: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
  } as any;

  beforeEach(async () => {
    use.mockClear();
    send.mockClear();
    write.mockClear();
    vi.mocked(debounce).mockImplementation((cb) => cb);
  });

  const request: Request = {
    headers: { accept: 'application/json' },
  } as any;

  describe('JSON endpoint', () => {
    it('scans and extracts index', async () => {
      const mockServerChannel = { emit: vi.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        serverChannel: mockServerChannel,
        workingDir,
        normalizedStories,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
      });

      expect(use).toHaveBeenCalledTimes(2);
      const route = use.mock.calls[0][1];

      await route(request, response);

      expect(send).toHaveBeenCalledTimes(1);
      expect(JSON.parse(send.mock.calls[0][0])).toMatchInlineSnapshot(`
        {
          "entries": {
            "a--metaof": {
              "id": "a--metaof",
              "importPath": "./src/docs2/MetaOf.mdx",
              "name": "MetaOf",
              "storiesImports": [
                "./src/A.stories.js",
              ],
              "tags": [
                "attached-mdx",
                "docs",
              ],
              "title": "A",
              "type": "docs",
            },
            "a--second-docs": {
              "id": "a--second-docs",
              "importPath": "./src/docs2/SecondMetaOf.mdx",
              "name": "Second Docs",
              "storiesImports": [
                "./src/A.stories.js",
              ],
              "tags": [
                "attached-mdx",
                "docs",
              ],
              "title": "A",
              "type": "docs",
            },
            "a--story-one": {
              "id": "a--story-one",
              "importPath": "./src/A.stories.js",
              "name": "Story One",
              "tags": [
                "component-tag",
                "story-tag",
                "story",
              ],
              "title": "A",
              "type": "story",
            },
            "b--story-one": {
              "id": "b--story-one",
              "importPath": "./src/B.stories.ts",
              "name": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "B",
              "type": "story",
            },
            "d--story-one": {
              "id": "d--story-one",
              "importPath": "./src/D.stories.jsx",
              "name": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "D",
              "type": "story",
            },
            "docs2-componentreference--docs": {
              "id": "docs2-componentreference--docs",
              "importPath": "./src/docs2/ComponentReference.mdx",
              "name": "docs",
              "storiesImports": [],
              "tags": [
                "unattached-mdx",
                "docs",
              ],
              "title": "docs2/ComponentReference",
              "type": "docs",
            },
            "docs2-notitle--docs": {
              "id": "docs2-notitle--docs",
              "importPath": "./src/docs2/NoTitle.mdx",
              "name": "docs",
              "storiesImports": [],
              "tags": [
                "unattached-mdx",
                "docs",
              ],
              "title": "docs2/NoTitle",
              "type": "docs",
            },
            "docs2-yabbadabbadooo--docs": {
              "id": "docs2-yabbadabbadooo--docs",
              "importPath": "./src/docs2/Title.mdx",
              "name": "docs",
              "storiesImports": [],
              "tags": [
                "unattached-mdx",
                "docs",
              ],
              "title": "docs2/Yabbadabbadooo",
              "type": "docs",
            },
            "first-nested-deeply-f--story-one": {
              "id": "first-nested-deeply-f--story-one",
              "importPath": "./src/first-nested/deeply/F.stories.js",
              "name": "Story One",
              "tags": [
                "story",
              ],
              "title": "first-nested/deeply/F",
              "type": "story",
            },
            "h--story-one": {
              "id": "h--story-one",
              "importPath": "./src/H.stories.mjs",
              "name": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "H",
              "type": "story",
            },
            "nested-button--story-one": {
              "id": "nested-button--story-one",
              "importPath": "./src/nested/Button.stories.ts",
              "name": "Story One",
              "tags": [
                "component-tag",
                "story",
              ],
              "title": "nested/Button",
              "type": "story",
            },
            "nested-page--docs": {
              "id": "nested-page--docs",
              "importPath": "./src/nested/Page.stories.mdx",
              "name": "docs",
              "storiesImports": [],
              "tags": [
                "stories-mdx",
                "docs",
              ],
              "title": "nested/Page",
              "type": "docs",
            },
            "nested-page--story-one": {
              "id": "nested-page--story-one",
              "importPath": "./src/nested/Page.stories.mdx",
              "name": "StoryOne",
              "tags": [
                "stories-mdx",
                "story",
              ],
              "title": "nested/Page",
              "type": "story",
            },
            "second-nested-g--story-one": {
              "id": "second-nested-g--story-one",
              "importPath": "./src/second-nested/G.stories.ts",
              "name": "Story One",
              "tags": [
                "story",
              ],
              "title": "second-nested/G",
              "type": "story",
            },
          },
          "v": 4,
        }
      `);
    });

    it('scans and extracts stories v3', async () => {
      const mockServerChannel = { emit: vi.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
        workingDir,
        serverChannel: mockServerChannel,
        normalizedStories,
      });

      expect(use).toHaveBeenCalledTimes(2);
      const route = use.mock.calls[1][1];

      await route(request, response);

      expect(send).toHaveBeenCalledTimes(1);
      expect(JSON.parse(send.mock.calls[0][0])).toMatchInlineSnapshot(`
        {
          "stories": {
            "a--metaof": {
              "id": "a--metaof",
              "importPath": "./src/docs2/MetaOf.mdx",
              "kind": "A",
              "name": "MetaOf",
              "parameters": {
                "__id": "a--metaof",
                "docsOnly": true,
                "fileName": "./src/docs2/MetaOf.mdx",
              },
              "storiesImports": [
                "./src/A.stories.js",
              ],
              "story": "MetaOf",
              "tags": [
                "attached-mdx",
                "docs",
              ],
              "title": "A",
            },
            "a--second-docs": {
              "id": "a--second-docs",
              "importPath": "./src/docs2/SecondMetaOf.mdx",
              "kind": "A",
              "name": "Second Docs",
              "parameters": {
                "__id": "a--second-docs",
                "docsOnly": true,
                "fileName": "./src/docs2/SecondMetaOf.mdx",
              },
              "storiesImports": [
                "./src/A.stories.js",
              ],
              "story": "Second Docs",
              "tags": [
                "attached-mdx",
                "docs",
              ],
              "title": "A",
            },
            "a--story-one": {
              "id": "a--story-one",
              "importPath": "./src/A.stories.js",
              "kind": "A",
              "name": "Story One",
              "parameters": {
                "__id": "a--story-one",
                "docsOnly": false,
                "fileName": "./src/A.stories.js",
              },
              "story": "Story One",
              "tags": [
                "component-tag",
                "story-tag",
                "story",
              ],
              "title": "A",
            },
            "b--story-one": {
              "id": "b--story-one",
              "importPath": "./src/B.stories.ts",
              "kind": "B",
              "name": "Story One",
              "parameters": {
                "__id": "b--story-one",
                "docsOnly": false,
                "fileName": "./src/B.stories.ts",
              },
              "story": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "B",
            },
            "d--story-one": {
              "id": "d--story-one",
              "importPath": "./src/D.stories.jsx",
              "kind": "D",
              "name": "Story One",
              "parameters": {
                "__id": "d--story-one",
                "docsOnly": false,
                "fileName": "./src/D.stories.jsx",
              },
              "story": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "D",
            },
            "docs2-componentreference--docs": {
              "id": "docs2-componentreference--docs",
              "importPath": "./src/docs2/ComponentReference.mdx",
              "kind": "docs2/ComponentReference",
              "name": "docs",
              "parameters": {
                "__id": "docs2-componentreference--docs",
                "docsOnly": true,
                "fileName": "./src/docs2/ComponentReference.mdx",
              },
              "storiesImports": [],
              "story": "docs",
              "tags": [
                "unattached-mdx",
                "docs",
              ],
              "title": "docs2/ComponentReference",
            },
            "docs2-notitle--docs": {
              "id": "docs2-notitle--docs",
              "importPath": "./src/docs2/NoTitle.mdx",
              "kind": "docs2/NoTitle",
              "name": "docs",
              "parameters": {
                "__id": "docs2-notitle--docs",
                "docsOnly": true,
                "fileName": "./src/docs2/NoTitle.mdx",
              },
              "storiesImports": [],
              "story": "docs",
              "tags": [
                "unattached-mdx",
                "docs",
              ],
              "title": "docs2/NoTitle",
            },
            "docs2-yabbadabbadooo--docs": {
              "id": "docs2-yabbadabbadooo--docs",
              "importPath": "./src/docs2/Title.mdx",
              "kind": "docs2/Yabbadabbadooo",
              "name": "docs",
              "parameters": {
                "__id": "docs2-yabbadabbadooo--docs",
                "docsOnly": true,
                "fileName": "./src/docs2/Title.mdx",
              },
              "storiesImports": [],
              "story": "docs",
              "tags": [
                "unattached-mdx",
                "docs",
              ],
              "title": "docs2/Yabbadabbadooo",
            },
            "first-nested-deeply-f--story-one": {
              "id": "first-nested-deeply-f--story-one",
              "importPath": "./src/first-nested/deeply/F.stories.js",
              "kind": "first-nested/deeply/F",
              "name": "Story One",
              "parameters": {
                "__id": "first-nested-deeply-f--story-one",
                "docsOnly": false,
                "fileName": "./src/first-nested/deeply/F.stories.js",
              },
              "story": "Story One",
              "tags": [
                "story",
              ],
              "title": "first-nested/deeply/F",
            },
            "h--story-one": {
              "id": "h--story-one",
              "importPath": "./src/H.stories.mjs",
              "kind": "H",
              "name": "Story One",
              "parameters": {
                "__id": "h--story-one",
                "docsOnly": false,
                "fileName": "./src/H.stories.mjs",
              },
              "story": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "H",
            },
            "nested-button--story-one": {
              "id": "nested-button--story-one",
              "importPath": "./src/nested/Button.stories.ts",
              "kind": "nested/Button",
              "name": "Story One",
              "parameters": {
                "__id": "nested-button--story-one",
                "docsOnly": false,
                "fileName": "./src/nested/Button.stories.ts",
              },
              "story": "Story One",
              "tags": [
                "component-tag",
                "story",
              ],
              "title": "nested/Button",
            },
            "nested-page--docs": {
              "id": "nested-page--docs",
              "importPath": "./src/nested/Page.stories.mdx",
              "kind": "nested/Page",
              "name": "docs",
              "parameters": {
                "__id": "nested-page--docs",
                "docsOnly": true,
                "fileName": "./src/nested/Page.stories.mdx",
              },
              "storiesImports": [],
              "story": "docs",
              "tags": [
                "stories-mdx",
                "docs",
              ],
              "title": "nested/Page",
            },
            "nested-page--story-one": {
              "id": "nested-page--story-one",
              "importPath": "./src/nested/Page.stories.mdx",
              "kind": "nested/Page",
              "name": "StoryOne",
              "parameters": {
                "__id": "nested-page--story-one",
                "docsOnly": false,
                "fileName": "./src/nested/Page.stories.mdx",
              },
              "story": "StoryOne",
              "tags": [
                "stories-mdx",
                "story",
              ],
              "title": "nested/Page",
            },
            "second-nested-g--story-one": {
              "id": "second-nested-g--story-one",
              "importPath": "./src/second-nested/G.stories.ts",
              "kind": "second-nested/G",
              "name": "Story One",
              "parameters": {
                "__id": "second-nested-g--story-one",
                "docsOnly": false,
                "fileName": "./src/second-nested/G.stories.ts",
              },
              "story": "Story One",
              "tags": [
                "story",
              ],
              "title": "second-nested/G",
            },
          },
          "v": 3,
        }
      `);
    });

    it('scans and extracts stories v2', async () => {
      const mockServerChannel = { emit: vi.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator({
          storiesV2Compatibility: true,
        }),
        workingDir,
        serverChannel: mockServerChannel,
        normalizedStories,
      });

      expect(use).toHaveBeenCalledTimes(2);
      const route = use.mock.calls[1][1];

      await route(request, response);

      expect(send).toHaveBeenCalledTimes(1);
      expect(JSON.parse(send.mock.calls[0][0])).toMatchInlineSnapshot(`
        {
          "stories": {
            "a--story-one": {
              "id": "a--story-one",
              "importPath": "./src/A.stories.js",
              "kind": "A",
              "name": "Story One",
              "parameters": {
                "__id": "a--story-one",
                "docsOnly": false,
                "fileName": "./src/A.stories.js",
              },
              "story": "Story One",
              "tags": [
                "component-tag",
                "story-tag",
                "story",
              ],
              "title": "A",
            },
            "b--story-one": {
              "id": "b--story-one",
              "importPath": "./src/B.stories.ts",
              "kind": "B",
              "name": "Story One",
              "parameters": {
                "__id": "b--story-one",
                "docsOnly": false,
                "fileName": "./src/B.stories.ts",
              },
              "story": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "B",
            },
            "d--story-one": {
              "id": "d--story-one",
              "importPath": "./src/D.stories.jsx",
              "kind": "D",
              "name": "Story One",
              "parameters": {
                "__id": "d--story-one",
                "docsOnly": false,
                "fileName": "./src/D.stories.jsx",
              },
              "story": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "D",
            },
            "first-nested-deeply-f--story-one": {
              "id": "first-nested-deeply-f--story-one",
              "importPath": "./src/first-nested/deeply/F.stories.js",
              "kind": "first-nested/deeply/F",
              "name": "Story One",
              "parameters": {
                "__id": "first-nested-deeply-f--story-one",
                "docsOnly": false,
                "fileName": "./src/first-nested/deeply/F.stories.js",
              },
              "story": "Story One",
              "tags": [
                "story",
              ],
              "title": "first-nested/deeply/F",
            },
            "h--story-one": {
              "id": "h--story-one",
              "importPath": "./src/H.stories.mjs",
              "kind": "H",
              "name": "Story One",
              "parameters": {
                "__id": "h--story-one",
                "docsOnly": false,
                "fileName": "./src/H.stories.mjs",
              },
              "story": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "H",
            },
            "nested-button--story-one": {
              "id": "nested-button--story-one",
              "importPath": "./src/nested/Button.stories.ts",
              "kind": "nested/Button",
              "name": "Story One",
              "parameters": {
                "__id": "nested-button--story-one",
                "docsOnly": false,
                "fileName": "./src/nested/Button.stories.ts",
              },
              "story": "Story One",
              "tags": [
                "component-tag",
                "story",
              ],
              "title": "nested/Button",
            },
            "nested-page--story-one": {
              "id": "nested-page--story-one",
              "importPath": "./src/nested/Page.stories.mdx",
              "kind": "nested/Page",
              "name": "StoryOne",
              "parameters": {
                "__id": "nested-page--story-one",
                "docsOnly": false,
                "fileName": "./src/nested/Page.stories.mdx",
              },
              "story": "StoryOne",
              "tags": [
                "stories-mdx",
                "story",
              ],
              "title": "nested/Page",
            },
            "second-nested-g--story-one": {
              "id": "second-nested-g--story-one",
              "importPath": "./src/second-nested/G.stories.ts",
              "kind": "second-nested/G",
              "name": "Story One",
              "parameters": {
                "__id": "second-nested-g--story-one",
                "docsOnly": false,
                "fileName": "./src/second-nested/G.stories.ts",
              },
              "story": "Story One",
              "tags": [
                "story",
              ],
              "title": "second-nested/G",
            },
          },
          "v": 3,
        }
      `);
    });

    it('disallows .mdx files without storyStoreV7', async () => {
      const mockServerChannel = { emit: vi.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator({
          storyStoreV7: false,
        }),
        workingDir,
        serverChannel: mockServerChannel,
        normalizedStories,
      });

      expect(use).toHaveBeenCalledTimes(2);
      const route = use.mock.calls[1][1];

      await route(request, response);

      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0]).toMatchInlineSnapshot(`
        "Unable to index files:
        - ./src/docs2/ComponentReference.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`.
        - ./src/docs2/MetaOf.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`.
        - ./src/docs2/NoTitle.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`.
        - ./src/docs2/SecondMetaOf.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`.
        - ./src/docs2/Template.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`.
        - ./src/docs2/Title.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`."
      `);
    });

    it('allows disabling storyStoreV7 if no .mdx files are used', async () => {
      const mockServerChannel = { emit: vi.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(
          { storyStoreV7: false },
          normalizedStories.slice(0, 1)
        ),
        workingDir,
        serverChannel: mockServerChannel,
        normalizedStories,
      });

      expect(use).toHaveBeenCalledTimes(2);
      const route = use.mock.calls[1][1];

      await route(request, response);

      expect(send).toHaveBeenCalledTimes(1);
      expect(JSON.parse(send.mock.calls[0][0])).toMatchInlineSnapshot(`
        {
          "stories": {
            "a--story-one": {
              "id": "a--story-one",
              "importPath": "./src/A.stories.js",
              "kind": "A",
              "name": "Story One",
              "parameters": {
                "__id": "a--story-one",
                "docsOnly": false,
                "fileName": "./src/A.stories.js",
              },
              "story": "Story One",
              "tags": [
                "component-tag",
                "story-tag",
                "story",
              ],
              "title": "A",
            },
            "b--story-one": {
              "id": "b--story-one",
              "importPath": "./src/B.stories.ts",
              "kind": "B",
              "name": "Story One",
              "parameters": {
                "__id": "b--story-one",
                "docsOnly": false,
                "fileName": "./src/B.stories.ts",
              },
              "story": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "B",
            },
            "d--story-one": {
              "id": "d--story-one",
              "importPath": "./src/D.stories.jsx",
              "kind": "D",
              "name": "Story One",
              "parameters": {
                "__id": "d--story-one",
                "docsOnly": false,
                "fileName": "./src/D.stories.jsx",
              },
              "story": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "D",
            },
            "first-nested-deeply-f--story-one": {
              "id": "first-nested-deeply-f--story-one",
              "importPath": "./src/first-nested/deeply/F.stories.js",
              "kind": "first-nested/deeply/F",
              "name": "Story One",
              "parameters": {
                "__id": "first-nested-deeply-f--story-one",
                "docsOnly": false,
                "fileName": "./src/first-nested/deeply/F.stories.js",
              },
              "story": "Story One",
              "tags": [
                "story",
              ],
              "title": "first-nested/deeply/F",
            },
            "h--story-one": {
              "id": "h--story-one",
              "importPath": "./src/H.stories.mjs",
              "kind": "H",
              "name": "Story One",
              "parameters": {
                "__id": "h--story-one",
                "docsOnly": false,
                "fileName": "./src/H.stories.mjs",
              },
              "story": "Story One",
              "tags": [
                "autodocs",
                "story",
              ],
              "title": "H",
            },
            "nested-button--story-one": {
              "id": "nested-button--story-one",
              "importPath": "./src/nested/Button.stories.ts",
              "kind": "nested/Button",
              "name": "Story One",
              "parameters": {
                "__id": "nested-button--story-one",
                "docsOnly": false,
                "fileName": "./src/nested/Button.stories.ts",
              },
              "story": "Story One",
              "tags": [
                "component-tag",
                "story",
              ],
              "title": "nested/Button",
            },
            "second-nested-g--story-one": {
              "id": "second-nested-g--story-one",
              "importPath": "./src/second-nested/G.stories.ts",
              "kind": "second-nested/G",
              "name": "Story One",
              "parameters": {
                "__id": "second-nested-g--story-one",
                "docsOnly": false,
                "fileName": "./src/second-nested/G.stories.ts",
              },
              "story": "Story One",
              "tags": [
                "story",
              ],
              "title": "second-nested/G",
            },
          },
          "v": 3,
        }
      `);
    });

    it('can handle simultaneous access', async () => {
      const mockServerChannel = { emit: vi.fn() } as any as ServerChannel;

      useStoriesJson({
        router,
        serverChannel: mockServerChannel,
        workingDir,
        normalizedStories,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
      });

      expect(use).toHaveBeenCalledTimes(2);
      const route = use.mock.calls[0][1];

      const firstPromise = route(request, response);
      const secondResponse = { ...response, send: vi.fn(), status: vi.fn() };
      const secondPromise = route(request, secondResponse);

      await Promise.all([firstPromise, secondPromise]);

      expect(send).toHaveBeenCalledTimes(1);
      expect(response.status).not.toEqual(500);
      expect(secondResponse.send).toHaveBeenCalledTimes(1);
      expect(secondResponse.status).not.toEqual(500);
    });
  });

  describe('SSE endpoint', () => {
    beforeEach(() => {
      use.mockClear();
      send.mockClear();
    });

    it('sends invalidate events', async () => {
      const mockServerChannel = { emit: vi.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        serverChannel: mockServerChannel,
        workingDir,
        normalizedStories,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
      });

      expect(use).toHaveBeenCalledTimes(2);
      const route = use.mock.calls[0][1];

      await route(request, response);

      expect(write).not.toHaveBeenCalled();

      expect(Watchpack).toHaveBeenCalledTimes(1);
      const watcher = Watchpack.mock.instances[0];
      expect(watcher.watch).toHaveBeenCalledWith({ directories: ['./src'] });

      expect(watcher.on).toHaveBeenCalledTimes(2);
      const onChange = watcher.on.mock.calls[0][1];

      await onChange('src/nested/Button.stories.ts');
      expect(mockServerChannel.emit).toHaveBeenCalledTimes(1);
      expect(mockServerChannel.emit).toHaveBeenCalledWith(STORY_INDEX_INVALIDATED);
    });

    it('only sends one invalidation when multiple event listeners are listening', async () => {
      const mockServerChannel = { emit: vi.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        serverChannel: mockServerChannel,
        workingDir,
        normalizedStories,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
      });

      expect(use).toHaveBeenCalledTimes(2);
      const route = use.mock.calls[0][1];

      // Don't wait for the first request here before starting the second
      await Promise.all([
        route(request, response),
        route(request, { ...response, write: vi.fn() }),
      ]);

      expect(write).not.toHaveBeenCalled();

      expect(Watchpack).toHaveBeenCalledTimes(1);
      const watcher = Watchpack.mock.instances[0];
      expect(watcher.watch).toHaveBeenCalledWith({ directories: ['./src'] });

      expect(watcher.on).toHaveBeenCalledTimes(2);
      const onChange = watcher.on.mock.calls[0][1];

      await onChange('src/nested/Button.stories.ts');
      expect(mockServerChannel.emit).toHaveBeenCalledTimes(1);
      expect(mockServerChannel.emit).toHaveBeenCalledWith(STORY_INDEX_INVALIDATED);
    });

    it('debounces invalidation events', async () => {
      vi.mocked(debounce).mockImplementation(
        // @ts-expect-error it doesn't think default exists
        (await vi.importActual<typeof import('lodash/debounce.js')>('lodash/debounce.js')).default
      );

      const mockServerChannel = { emit: vi.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        serverChannel: mockServerChannel,
        workingDir,
        normalizedStories,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
      });

      expect(use).toHaveBeenCalledTimes(2);
      const route = use.mock.calls[0][1];

      await route(request, response);

      expect(write).not.toHaveBeenCalled();

      expect(Watchpack).toHaveBeenCalledTimes(1);
      const watcher = Watchpack.mock.instances[0];
      expect(watcher.watch).toHaveBeenCalledWith({ directories: ['./src'] });

      expect(watcher.on).toHaveBeenCalledTimes(2);
      const onChange = watcher.on.mock.calls[0][1];

      await onChange('src/nested/Button.stories.ts');
      await onChange('src/nested/Button.stories.ts');
      await onChange('src/nested/Button.stories.ts');
      await onChange('src/nested/Button.stories.ts');
      await onChange('src/nested/Button.stories.ts');

      expect(mockServerChannel.emit).toHaveBeenCalledTimes(1);
      expect(mockServerChannel.emit).toHaveBeenCalledWith(STORY_INDEX_INVALIDATED);

      await new Promise((r) => setTimeout(r, 2 * DEBOUNCE));

      expect(mockServerChannel.emit).toHaveBeenCalledTimes(2);
    });
  });
});

describe('convertToIndexV3', () => {
  it('converts v7 index.json to v6 stories.json', () => {
    const indexJson: StoryIndex = {
      v: 4,
      entries: {
        'a--docs': {
          id: 'a--docs',
          importPath: './src/docs2/MetaOf.mdx',
          name: 'docs',
          storiesImports: ['./src/A.stories.js'],
          title: 'A',
          type: 'docs',
        },
        'a--story-one': {
          id: 'a--story-one',
          importPath: './src/A.stories.js',
          name: 'Story One',
          title: 'A',
          type: 'story',
        },
        'b--story-one': {
          id: 'b--story-one',
          importPath: './src/B.stories.ts',
          name: 'Story One',
          title: 'B',
          type: 'story',
        },
      },
    };

    expect(convertToIndexV3(indexJson)).toMatchInlineSnapshot(`
      {
        "stories": {
          "a--docs": {
            "id": "a--docs",
            "importPath": "./src/docs2/MetaOf.mdx",
            "kind": "A",
            "name": "docs",
            "parameters": {
              "__id": "a--docs",
              "docsOnly": true,
              "fileName": "./src/docs2/MetaOf.mdx",
            },
            "storiesImports": [
              "./src/A.stories.js",
            ],
            "story": "docs",
            "title": "A",
          },
          "a--story-one": {
            "id": "a--story-one",
            "importPath": "./src/A.stories.js",
            "kind": "A",
            "name": "Story One",
            "parameters": {
              "__id": "a--story-one",
              "docsOnly": false,
              "fileName": "./src/A.stories.js",
            },
            "story": "Story One",
            "title": "A",
          },
          "b--story-one": {
            "id": "b--story-one",
            "importPath": "./src/B.stories.ts",
            "kind": "B",
            "name": "Story One",
            "parameters": {
              "__id": "b--story-one",
              "docsOnly": false,
              "fileName": "./src/B.stories.ts",
            },
            "story": "Story One",
            "title": "B",
          },
        },
        "v": 3,
      }
    `);
  });
});
