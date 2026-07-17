# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a personal learning knowledge base with two learning tracks:
- **Track 1 (active — project-driven)**: Cocos Creator / WeChat mini-game development (learning by building)
- **Track 2 (pending)**: Python → AI/LLM application development

The repo contains Markdown notes and practice code — no executable projects, build systems, or tests.

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `cocos/` | Cocos Creator + TypeScript learning materials (track 1) |
| `python/` | Python → AI/LLM application development materials (track 2) |
| `wechat/` | WeChat mini-game / mini-program reference |

## Key Files

### Track 1 — Cocos Creator (active — project-driven learning)

| File | Purpose |
|------|---------|
| `cocos/learnCoCOs.md` | Engine capability reference map — stages 2~6 are no longer a sequential curriculum; consult when encountering project needs |
| `cocos/cocos学习进度.md` | Learning progress tracker + teaching rules + methodology decision record (section 三) |
| `cocos/cocos学习疑问解答.md` | Q&A archive organized by knowledge section |
| `cocos/cocos标准模式库.md` | Standard pattern templates for common TypeScript/Cocos scenarios |
| `cocos/cocos项目管理.md` | Git management guide for Cocos Creator 3.x projects |
| `cocos/test.ts` / `cocos/ignore.ts` | TypeScript practice files |
| `cocos/project/` | Cocos Creator project workspace |

### Track 2 — Python → AI/LLM (active)

| File | Purpose |
|------|---------|
| `python/python学习路线.md` | Full learning roadmap (9 stages: Python → ML → DL → LLM) + 16 teaching rules |
| `python/python学习进度.md` | Learning progress tracker with checklist for all 9 stages |
| `python/python学习疑问解答.md` | Q&A archive (to be created) |
| `python/python标准模式库.md` | Standard pattern templates (to be created) |

### Reference

| File | Purpose |
|------|---------|
| `wechat/wxGame.md` | WeChat mini-game primer: engines, assets, publishing, monetization |
| `wechat/wxprograme.md` | WeChat mini-program tech stack survey |

## Learning Context

- **Learner background**: Programmer with Java experience
- **Completed**: TypeScript basics (8 sections) + Cocos Creator editor basics (Node core properties)
- **Current**: Cocos Creator engine learning — **project-driven mode** (not linear stage-by-stage)
- **Learning mode**: Build a project → encounter a need → deep-dive into the relevant Cocos system → apply immediately. See `cocos/cocos学习进度.md` section 三 for the methodology decision record.
- **Next**: Choose a game project to build (recommended: dodge/collect mini-game)
- **Goal**: Python proficiency → AI/LLM application development

## When Editing Notes

- Follow the existing table-heavy, checklist-driven format
- Update `python/python学习进度.md` when Python learning progress is made
- Update `cocos/cocos学习进度.md` when Cocos learning progress is made
- Python teaching follows the 16 rules documented in `python/python学习路线.md` Chapter 2
- Cocos teaching is now **project-driven**: teach systems only when the learner encounters a need in their project. Teaching depth remains the same as the TypeScript stage (rules 1~8 in `cocos学习进度.md`). Use `cocos/learnCoCOs.md` as a reference map to tell the learner which Cocos system addresses their current need.
