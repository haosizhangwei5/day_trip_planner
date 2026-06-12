# Day Trip Planner — Claude Instructions

## GitHub Push Policy

コードを変更したら、**必ずその都度 GitHub にプッシュすること。**

```bash
git add <変更ファイル>
git commit -m "変更内容を簡潔に説明するメッセージ"
git push
```

- `git add .` や `git add -A` は使わず、変更したファイルを明示的に指定する
- コミットメッセージは日本語でも英語でも可
- リモートは `origin main`（https://github.com/haosizhangwei5/day_trip_planner）

## Project Overview

- **Tech stack**: React + Vite + TypeScript + Tailwind CSS v4
- **AI**: Anthropic API (`claude-sonnet-4-6`) + `web_search_20250305` tool
- **Hosting**: GitHub Pages (`/day_trip_planner/` base path)

## Environment Variables

`.env` ファイルは `.gitignore` 対象。`VITE_ANTHROPIC_API_KEY` は GitHub Secrets に登録済み。
