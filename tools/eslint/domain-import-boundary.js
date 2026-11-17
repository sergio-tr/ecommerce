'use strict';

const path = require('node:path');

const DOMAIN_MARKER = `${path.sep}libs${path.sep}commercecore${path.sep}catalog${path.sep}domain${path.sep}`;

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Reject framework, provider, and cross-context imports from the pedagogical catalog domain.',
    },
    schema: [],
    messages: {
      forbidden: 'Pure catalog domain cannot import "{{source}}". {{detail}}',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (!filename.includes(DOMAIN_MARKER) || filename.endsWith('.spec.ts')) {
      return {};
    }
    const domainRoot = filename.slice(
      0,
      filename.indexOf(DOMAIN_MARKER) + DOMAIN_MARKER.length - 1,
    );

    return {
      ImportDeclaration(node) {
        check(context, filename, domainRoot, node.source.value, node.source);
      },
      ExportAllDeclaration(node) {
        check(context, filename, domainRoot, node.source.value, node.source);
      },
      ExportNamedDeclaration(node) {
        if (node.source) {
          check(context, filename, domainRoot, node.source.value, node.source);
        }
      },
      ImportExpression(node) {
        if (node.source.type === 'Literal' && typeof node.source.value === 'string') {
          check(context, filename, domainRoot, node.source.value, node.source);
        }
      },
    };
  },
};

function check(context, filename, domainRoot, source, node) {
  if (typeof source !== 'string') {
    return;
  }
  if (source.startsWith('@nestjs') || source === 'nestjs') {
    context.report({
      node,
      messageId: 'forbidden',
      data: { source, detail: 'NestJS is a composition concern.' },
    });
    return;
  }
  if (
    source === 'stripe' ||
    source.startsWith('@stripe/') ||
    source === 'mongodb' ||
    source === 'mongoose' ||
    source.includes('commercecloud')
  ) {
    context.report({
      node,
      messageId: 'forbidden',
      data: { source, detail: 'Other contexts and providers stay outside this domain example.' },
    });
    return;
  }
  if (source.startsWith('.')) {
    const resolved = path.resolve(path.dirname(filename), source);
    const prefix = domainRoot.endsWith(path.sep) ? domainRoot : `${domainRoot}${path.sep}`;
    if (resolved !== domainRoot && !resolved.startsWith(prefix)) {
      context.report({
        node,
        messageId: 'forbidden',
        data: { source, detail: 'Imports must stay inside the catalog domain root.' },
      });
    }
    return;
  }
  if (!source.startsWith('node:')) {
    context.report({
      node,
      messageId: 'forbidden',
      data: { source, detail: 'Package imports are outside this pedagogical domain.' },
    });
  }
}
