'use strict';

const rehype = require('rehype');
const dedent = require('dedent');
const rehypePrism = require('./index');
const svelte = require('@snlab/refractor-svelte');

const processHtml = (html, options) => {
  return rehype()
    .data('settings', { fragment: true })
    .use(rehypePrism, options)
    .processSync(html)
    .toString();
};

test('copies the language- class to pre tag', () => {
  const result = processHtml(dedent`
    <pre><code class="language-css"></code></pre>
  `);
  expect(result).toMatchSnapshot();
});

test('finds code and highlights', () => {
  const result = processHtml(dedent`
    <div>
      <p>foo</p>
      <pre><code class="language-css">p { color: red }</code></pre>
    </div>
  `);
  expect(result).toMatchSnapshot();
});

test('handles uppercase languages correctly', () => {
  const result = processHtml(dedent`
    <div>
      <p>foo</p>
      <pre><code class="language-CSS">p { color: red }</code></pre>
    </div>
  `);
  expect(result).toMatchSnapshot();
});

test('does nothing to code block without language- class', () => {
  const result = processHtml(dedent`
    <pre><code>p { color: red }</code></pre>
  `);
  expect(result).toMatchSnapshot();
});

test('throw error with fake language- class', () => {
  expect(() => {
    processHtml(dedent`
      <pre><code class="language-thisisnotalanguage">p { color: red }</code></pre>
    `);
  }).toThrow(/Unknown language/);
});

test('with options.ignoreMissing, does nothing to code block with fake language- class', () => {
  const html = dedent`
    <pre><code class="language-thisisnotalanguage">p { color: red }</code></pre>
  `;
  const result = processHtml(html, { ignoreMissing: true });
  expect(result).toMatchSnapshot();
});

test('throw error with wrongly specified options.registerSyntax', () => {
  expect(() => {
    processHtml(
      dedent`
    <pre><code class="language-css"></code></pre>
    `,
      { registerSyntax: true }
    );
  }).toThrow(/should be an array/);
});

test('additional language syntax gets registered and applied correctly', () => {
  const html = dedent`
  <pre><code class="language-svelte">
    {#each items as item, i}
      {item.name}
    {/each}
  </code></pre>
  `;
  const result = processHtml(html, { registerSyntax: [svelte] });
  expect(result).toMatchSnapshot();
});
