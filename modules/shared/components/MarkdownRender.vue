<template>
  <div
    class="markdown-body"
    :class="{
      'user-message': isUserMessage,
      'bot-message': isBotMessage,
    }"
    v-html="renderedContent"
  ></div>
</template>

<script setup lang="ts">
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import vue from "highlight.js/lib/languages/xml";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import { useDifyChatStore } from "@/stores/dify-chat";

// Register commonly used languages
hljs.registerLanguage("vue", vue);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);

const props = defineProps<{
  content: string;
  isUserMessage?: boolean;
  isBotMessage?: boolean;
}>();

const difyChatStore = useDifyChatStore();

const md = new MarkdownIt({
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }

    // Try auto-detection if no language is specified
    try {
      const result = hljs.highlightAuto(str);
      return result.value;
    } catch (__) {}

    // Use plain text if everything fails
    return str;
  },
  html: true,
  linkify: true,
  breaks: true,
});

const renderedContent = computed(() => {
  let tempContent = props.content?.trim() || "";
  const codeBlocks: string[] = [];

  tempContent = tempContent.replace(/```[\s\S]*?```|`[\s\S]*?`/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  const pattern = /\[(.*?)\]\(((?!http).*?)\)/g;
  tempContent = tempContent.replace(pattern, (match, filename, url) => {
    return `[${filename}](${difyChatStore.appInfo?.url}${url})`;
  });

  tempContent = tempContent.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
    return codeBlocks[parseInt(index)];
  });

  return md.render(tempContent);
});
</script>

<style lang="less">
.markdown-body {
  line-height: 1.6rem;
  h1 {
    font-size: 1.5em;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  h2 {
    font-size: 1.25em;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  h3 {
    font-size: 1em;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  h4 {
    font-size: 0.875em;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  h5 {
    font-size: 0.8em;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  ol {
    list-style-type: decimal;
    padding-left: 1.5em;
  }

  ul {
    list-style-type: disc;
    padding-left: 1.5em;
  }

  ol ol {
    list-style-type: lower-alpha;
  }

  ul ul {
    list-style-type: circle;
  }

  pre {
    margin: 0.5em 0;
    padding: 1em;
    border-radius: 0.375rem;
    background: #1e1e1e;
    overflow-x: auto;
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      monospace;
    font-size: 0.9em;
  }

  :not(pre) > code {
    background: rgba(127, 127, 127, 0.15);
    padding: 0.2em 0.4em;
    border-radius: 0.25em;
  }

  pre code {
    display: block;
    width: 100%;
    max-width: 100%;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: rgb(209 213 219);
  }
  table {
    width: 100%;
    max-width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    margin-bottom: 1rem;
    white-space: wrap;
  }
  th,
  td {
    border: 1px solid rgba(127, 127, 127, 0.2);
    padding: 0.5rem;
    word-break: break-word;
  }

  hr {
    margin: 1.5rem 0;
  }

  &.user-message {
    th,
    td {
      border-color: #aaa;
    }
    a {
      color: #fff;
      text-decoration: underline;
    }
  }
  &.bot-message {
    a {
      color: #007bff;
      text-decoration: underline;
    }
  }
}
</style>
