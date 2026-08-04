// Modular, DOM-free collation (diffing) engine.
//
// This module aligns two or more witness strings word-by-word (allowing
// insertions/deletions). It returns ready-to-use HTML strings (one per
// input witness, in the same order) with a single semantic <span> class
// wrapping every word that differs between witnesses - simple and
// consistent, no character-level highlighting or per-op-type styling.
//
// The first witness in the input list is treated as the "base" for the
// alignment (per-issue: "leftmost witness is base" / "base is the witness
// that triggered the comparison"). It is up to the caller to decide which
// text is passed first.
//
// No DOM APIs are used here so this module can be unit tested (e.g. under
// Node.js) independently of a browser.

// Word tokens are runs of letters, combining marks (diacritics) and digits.
// Punctuation/symbol characters (e.g. "·", ":", "›") are tokenized
// separately from adjacent words, even when there is no whitespace between
// them (e.g. "ſchowe·"). Without this split, a witness that omits a trailing
// punctuation mark would cause the *whole* word to be flagged as different,
// even though every visible letter is identical (see issue: identical words
// marked as changed).
const WORD_TOKEN_REGEX = /[\p{L}\p{M}\p{N}]+|\s+|[^\s\p{L}\p{M}\p{N}]+/gu;

/** Splits text into "word", "whitespace" and "punctuation/symbol" tokens. */
function tokenize(text) {
  if (!text) return [];
  return text.match(WORD_TOKEN_REGEX) || [];
}

function isWhitespaceToken(token) {
  return /^\s+$/.test(token);
}

/**
 * Classifies a token as "whitespace", "word" (letters/marks/digits) or
 * "punct" (everything else, e.g. punctuation/symbols). Used to avoid
 * pairing unrelated token kinds (e.g. a word delete with a punctuation
 * insert) into a misleading "replace" op.
 */
function tokenKind(token) {
  if (isWhitespaceToken(token)) return "whitespace";
  if (/^[\p{L}\p{M}\p{N}]+$/u.test(token)) return "word";
  return "punct";
}

function escapeHtml(value) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(value).replace(/[&<>"']/g, (ch) => map[ch]);
}

/**
 * Generic longest-common-subsequence based diff (Myers-style result), works
 * on arrays of strings (words or single characters).
 * Returns a flat list of ops: {type: 'equal'|'delete'|'insert', value, aIndex?, bIndex?}
 * - aIndex is the index of `value` in `a` (set for 'equal' and 'delete')
 * - bIndex is the index of `value` in `b` (set for 'equal' and 'insert')
 */
function diffSequences(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", value: a[i], aIndex: i, bIndex: j });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "delete", value: a[i], aIndex: i });
      i++;
    } else {
      ops.push({ type: "insert", value: b[j], bIndex: j });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: "delete", value: a[i], aIndex: i });
    i++;
  }
  while (j < m) {
    ops.push({ type: "insert", value: b[j], bIndex: j });
    j++;
  }
  return ops;
}

/**
 * Groups adjacent delete/insert runs produced by diffSequences into
 * 'replace' pairs (a base token that was substituted by a witness token),
 * pairing tokens of the same "kind" (word vs. whitespace) in order.
 * Leftover, unpaired deletes/inserts stay as pure delete/insert ops.
 */
function buildReplacePairs(ops) {
  const result = [];
  let i = 0;
  while (i < ops.length) {
    const op = ops[i];
    if (op.type === "equal") {
      result.push(op);
      i++;
      continue;
    }
    let j = i;
    const deletes = [];
    const inserts = [];
    while (j < ops.length && (ops[j].type === "delete" || ops[j].type === "insert")) {
      if (ops[j].type === "delete") {
        deletes.push(ops[j]);
      } else {
        inserts.push(ops[j]);
      }
      j++;
    }
    let di = 0;
    let ii = 0;
    while (di < deletes.length && ii < inserts.length) {
      const del = deletes[di];
      const ins = inserts[ii];
      if (tokenKind(del.value) === tokenKind(ins.value)) {
        result.push({
          type: "replace",
          oldValue: del.value,
          newValue: ins.value,
          oldIndex: del.aIndex,
          newIndex: ins.bIndex,
        });
        di++;
        ii++;
      } else {
        // Different kinds (word vs. whitespace vs. punctuation) can't be
        // sensibly paired.
        result.push(del);
        di++;
      }
    }
    while (di < deletes.length) {
      result.push(deletes[di]);
      di++;
    }
    while (ii < inserts.length) {
      result.push(inserts[ii]);
      ii++;
    }
    i = j;
  }
  return result;
}

/**
 * Renders the HTML for a single non-base witness from its word-level ops.
 * Every word that differs from the base (inserted or replacing a base
 * word) is wrapped in a single "diff" class - no character-level
 * highlighting, no distinction between insert/replace.
 */
function renderWitnessHtml(ops, classes) {
  let html = "";
  for (const op of ops) {
    if (op.type === "equal") {
      html += escapeHtml(op.value);
    } else if (op.type === "delete") {
      // Word exists in the base but not in this witness: nothing to render
      // here, the base row will flag it as a difference.
      continue;
    } else if (op.type === "insert") {
      if (isWhitespaceToken(op.value)) {
        html += escapeHtml(op.value);
      } else {
        html += `<span class="${classes.diffClass}">${escapeHtml(op.value)}</span>`;
      }
    } else if (op.type === "replace") {
      if (isWhitespaceToken(op.oldValue) || isWhitespaceToken(op.newValue)) {
        // Pure whitespace differences aren't semantically interesting.
        html += escapeHtml(op.newValue);
        continue;
      }
      html += `<span class="${classes.diffClass}">${escapeHtml(op.newValue)}</span>`;
    }
  }
  return html;
}

/** Renders the HTML for the base witness, flagging words that differ. */
function renderBaseHtml(baseTokens, variantContributors, classes) {
  let html = "";
  baseTokens.forEach((token, index) => {
    const contributors = variantContributors[index];
    if (contributors && contributors.length > 0 && !isWhitespaceToken(token)) {
      const attr = classes.differsInAttr
        ? ` ${classes.differsInAttr}="${escapeHtml(contributors.join(","))}"`
        : "";
      html += `<span class="${classes.diffClass}"${attr}>${escapeHtml(token)}</span>`;
    } else {
      html += escapeHtml(token);
    }
  });
  return html;
}

/**
 * Aligns `texts[0]` (the base) against every other entry in `texts` and
 * returns an array of HTML strings of the same length, ready to be written
 * into the DOM (one per witness, same order as the input).
 *
 * options:
 *  - ids: optional array (parallel to texts) of witness identifiers used to
 *    populate the `data-collation-differs-in` attribute on the base row.
 *  - diffClass: single CSS class applied to every word that differs
 *    between witnesses (base or non-base).
 *  - differsInAttr: attribute name used on the base row (default
 *    "data-collation-differs-in"). Pass `null`/`false` to omit it.
 */
function collateWitnesses(texts, options = {}) {
  const classes = {
    diffClass: options.diffClass || "synTexView-collation-diff",
    differsInAttr:
      options.differsInAttr === undefined
        ? "data-collation-differs-in"
        : options.differsInAttr,
  };

  if (!Array.isArray(texts) || texts.length < 2) {
    return (texts || []).map((text) => escapeHtml(text || ""));
  }

  const baseTokens = tokenize(texts[0]);
  const variantContributors = baseTokens.map(() => []);
  const results = new Array(texts.length);
  const ids = options.ids;

  for (let w = 1; w < texts.length; w++) {
    const witnessTokens = tokenize(texts[w]);
    const ops = buildReplacePairs(diffSequences(baseTokens, witnessTokens));
    ops.forEach((op) => {
      if (op.type === "delete" && !isWhitespaceToken(op.value)) {
        variantContributors[op.aIndex].push(ids ? ids[w] : w);
      } else if (op.type === "replace" && !isWhitespaceToken(op.oldValue)) {
        variantContributors[op.oldIndex].push(ids ? ids[w] : w);
      }
    });
    results[w] = renderWitnessHtml(ops, classes);
  }
  results[0] = renderBaseHtml(baseTokens, variantContributors, classes);
  return results;
}

export {
  tokenize,
  isWhitespaceToken,
  tokenKind,
  escapeHtml,
  diffSequences,
  buildReplacePairs,
  collateWitnesses,
};
