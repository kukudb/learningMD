# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a personal learning knowledge base documenting the journey to become a
Cocos Creator / WeChat mini-game developer. The repo contains only Markdown
notes — no executable code, build system, or tests.

## Key Files

| File | Purpose |
|------|---------|
| `learnCoCOs.md` | Full learning roadmap: 6-stage beginner plan (TS → Cocos → UI → Animation → Physics → WeChat), advanced topics (performance, Shader, Spine, 3D), expert topics (WebGL, Wasm), and resource recommendations |
| `cocos学习进度.md` | Current learning progress tracker with 6 teaching rules for the Claude-as-tutor interaction style, completed sections checklist, and next steps |
| `cocos项目管理.md` | Git management guide for Cocos Creator 3.x projects — which files to track (`.scene`, `.prefab`, `.ts`, `.anim`, `.meta`, etc.), which to ignore (large binaries, `library/`, `build/`, `temp/`), `.gitignore` template, and project migration workflow |
| `wxGame.md` | WeChat mini-game primer: engine comparison, art asset sources (Kenney.nl, Mixamo, AI tools), publishing pipeline, 4MB package limit, and monetization options |
| `wxprograme.md` | WeChat mini-program tech stack survey: native vs cross-platform (Taro/uni-app), backend options (WeChat Cloud, traditional), UI libraries, and decision guide |

## Learning Context

- **Learner background**: Programmer with Java experience
- **Current position**: Finished TypeScript basics sections 1-2 (variables/types, functions/classes). Next: Interface (section 3)
- **Teaching style**: Detailed content first with Java comparisons, then exercises that differ from examples, code-diagnosis exercises, interactive confirmation before proceeding
- **Goal**: Cocos Creator + WeChat mini-game development proficiency

## When Editing Notes

- Follow the existing table-heavy, checklist-driven format
- Update `cocos学习进度.md` when learning progress is made
- Teaching interactions should follow the 6 rules documented in that file
