

## Plan: Move Agent Task Cards Below the Flow-Step Card

**Current behavior**: `agent-cluster` messages are included in `FLOW_STEP_TYPES`, so they get absorbed into the flow-step group card as a simple one-line text item ("分配专家代理设计方案与执行方案").

**Desired behavior**: The detailed `AgentClusterCard` (with pixel avatars, progress bars, numbered badges) should render as a standalone card directly below the flow-step group card, not inside it.

### Changes

**File: `src/components/modules/skills/SkillsModule.tsx`**

1. Remove `'agent-cluster'` from the `FLOW_STEP_TYPES` set (line 150). This will cause `agent-cluster` messages to fall through to `renderMessage()` which already renders them as full `AgentClusterCard` components.

That's the only change needed — the existing `renderMessage` switch case at line 296 already handles `agent-cluster` with the full `AgentClusterCard` UI. Removing it from the grouping set naturally places it as a separate card below the flow group.

