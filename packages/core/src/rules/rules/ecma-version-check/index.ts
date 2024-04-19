import { parser, ECMAVersion } from '@rsdoctor/utils/ruleUtils';
import path from 'path';
import { defineRule } from '../../rule';
import { Config } from './types';
import { getVersionNumber } from './utils';
import { Linter } from '@rsdoctor/types';

export type { Config } from './types';

const title = 'ecma-version-check';

export const rule = defineRule<typeof title, Config>(() => {
  return {
    meta: {
      code: 'E1004' as const,
      title,
      category: 'bundle',
      severity: Linter.Severity.Warn,
      defaultConfig: {
        highestVersion: ECMAVersion.ES5,
        ignore: [],
      },
    },
    check({ chunkGraph, report, ruleConfig }) {
      for (const asset of chunkGraph.getAssets()) {
        if (path.extname(asset.path) !== '.js') {
          continue;
        }

        if (ruleConfig.ignore.includes(asset.path)) {
          continue;
        }

        const currentVersion = parser.utils.detectECMAVersion(asset.content);
        const currentVersionNumber = getVersionNumber(currentVersion);
        const configVersionNumber = getVersionNumber(ruleConfig.highestVersion);

        if (!configVersionNumber || !currentVersionNumber) {
          return;
        }

        if (currentVersionNumber > configVersionNumber) {
          const assetsName = path.basename(asset.path);

          report({
            message: `The ECMA version used in "${assetsName}" is ${currentVersion}, which exceeds the ${ruleConfig.highestVersion} standard.`,
            detail: {
              type: 'link',
            },
          });
        }
      }
    },
  };
});
