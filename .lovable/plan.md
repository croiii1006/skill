

## Problem

There are duplicate "创建助手" rows in the flow steps. The `create-agent` message already shows inline agent rows (e.g., "创建助手 | 爆款专家"), but the subsequent `agent-cluster` message also renders in the same flow card with "创建助手 | TK爆款视频匹配" (and similarly for Phase 2 agents).

## Fix

Remove `agent-cluster` from `FLOW_STEP_TYPES` in `SkillsModule.tsx` (line 223) so it no longer appears as a flow step card. The `agent-cluster` messages will instead render as standalone cards (via `AgentClusterCard`) outside the flow, which is their intended purpose — showing live agent status, not duplicating the "创建助手" label.

**File:** `src/components/modules/skills/SkillsModule.tsx`  
**Change:** Line 223 — remove `'agent-cluster'` from the `FLOW_STEP_TYPES` Set.

