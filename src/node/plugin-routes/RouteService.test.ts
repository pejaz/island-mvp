import { RouteService } from './RouteService'
import { describe, expect, test } from 'vitest'
import path from 'path'

describe('RouteService', async () => {
  const testDir = path.join(__dirname, 'fixtures')
  const routeService = new RouteService(testDir)
  await routeService.init()

  test('conventional route by file structure', async () => {
    const routeMeta = routeService.getRouteMeta().map((item) => ({
      ...item,
      absolutePath: item.absolutePath.replace(testDir, 'TEST_DIR'),
    }))
    expect(routeMeta).toMatchInlineSnapshot(`
      [
        {
          "absolutePath": "TEST_DIR/a.mdx",
          "routePath": "/a",
        },
        {
          "absolutePath": "TEST_DIR/guide/b.mdx",
          "routePath": "/guide/b",
        },
        {
          "absolutePath": "TEST_DIR/guide/index.mdx",
          "routePath": "/guide/",
        },
      ]
    `)
  })
  test('generate routes code', async () => {
    expect(routeService.generateRoutesCode().replaceAll(testDir, 'TEST_DIR'))
      .toMatchInlineSnapshot(`
        "
          import React from 'react';
          import loadable from "@loadable/component";
          const Route0 = loadable(() => import('TEST_DIR/a.mdx'));
        const Route1 = loadable(() => import('TEST_DIR/guide/b.mdx'));
        const Route2 = loadable(() => import('TEST_DIR/guide/index.mdx'));
          export const routes = [
          { 
                path: '/a', 
                element: React.createElement(Route0), 
                preload: () => import('TEST_DIR/a.mdx') 
              },
        { 
                path: '/guide/b', 
                element: React.createElement(Route1), 
                preload: () => import('TEST_DIR/guide/b.mdx') 
              },
        { 
                path: '/guide/', 
                element: React.createElement(Route2), 
                preload: () => import('TEST_DIR/guide/index.mdx') 
              }
          ];
              "
      `)
  })
})
