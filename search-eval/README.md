# Search benchmark

Compares the home page's instant search, the current AI search, and embedding-based search on a
golden set of 231 real-world ED queries reviewed by an ED physician.

## Setup

Put the OpenAI key in `.env` in the project root (it is git-ignored; never commit it, since the repo
root is published as the site):

    OPENAI_API_KEY=sk-...

## Run

    node search-eval/check-golden.js                          # validate golden.json, rebuild golden-review.md
    node search-eval/build-index.js                           # plain embeddings  -> index/te3-small-512.json
    node search-eval/gen-synonyms.js                          # LLM search terms per code -> synonyms.json (review it)
    node search-eval/build-index.js --synonyms                # embeddings + synonyms -> index/te3-small-512-syn.json
    node search-eval/gen-synonyms.js --ed                     # ED short-list terms (catch-alls like 829 get site terms)
    node search-eval/build-index.js --synonyms --ed           # + ED short list, favoured by hybrid -> ...-syn-ed.json
    node search-eval/bench.js                                 # all backends -> report.md
    node search-eval/bench.js --backends home --limit 20      # quick partial run

`build-index.js` also takes `--model text-embedding-3-large` and `--dims 256|512|1024|1536`.
`bench.js` takes `--index <name>` to run one index only.

## Metrics

Each side (billing, diagnostic) returns its top 5 codes. **hit@1**: the first result is one of the
golden "best" codes. **hit@5**: a best code is in the top 5. **MRR**: 1 / rank of the first best code.
Latency is measured from this machine; cost uses the list prices in `lib.js`.
