'use strict';

const visit = require('unist-util-visit');
const nodeToString = require('hast-util-to-string');
const refractor = require('refractor');

module.exports = options => {
  options = options || {};

  if ('registerSyntax' in options) {
    if (Array.isArray(options.registerSyntax)) {
      for (const syntax of options.registerSyntax) {
        refractor.register(syntax);
      }
    } else {
      throw 'options.registerSyntax should be an array of additional syntaxes';
    }
  }

  return tree => {
    visit(tree, 'element', visitor);
  };

  function visitor(node, index, parent) {
    if (!parent || parent.tagName !== 'pre' || node.tagName !== 'code') {
      return;
    }

    const lang = getLanguage(node);

    if (lang === null) {
      return;
    }

    let result;
    try {
      parent.properties.className = (parent.properties.className || []).concat(
        'language-' + lang
      );
      result = refractor.highlight(nodeToString(node), lang);
    } catch (err) {
      if (options.ignoreMissing && /Unknown language/.test(err.message)) {
        return;
      }
      throw err;
    }

    node.children = result;
  }
};

function getLanguage(node) {
  const className = node.properties.className || [];

  for (const classListItem of className) {
    if (classListItem.slice(0, 9) === 'language-') {
      return classListItem.slice(9).toLowerCase();
    }
  }

  return null;
}
