# AI Marketing Team (Claude Code)

A team of six specialist Claude Code subagents run by one `/market` command, built for Nature's Way Soil.

## How to use
Open Claude Code in this repo and type:

```
/market audit https://www.natureswaysoil.com/dog-urine-lawn-repair
/market copy /compacted-clay-soil
/market ads liquid biochar
/market emails abandoned-cart
/market social dog urine neutralizer
/market calendar 30
/market seo /
/market competitors dog urine lawn repair
/market funnel NWS_014
/market launch "Enhanced Living Compost"
/market report
```

The director (the skill) reads the brand context, sends the work to the right specialists in parallel,
merges what they return into one ranked action plan, and saves it to `marketing/reports/`.

## Files
| File | Role |
|---|---|
| `.claude/skills/market/SKILL.md` | `/market` command: the director that runs the team |
| `.claude/agents/market-conversion-auditor.md` | CRO / landing page audits |
| `.claude/agents/market-seo-specialist.md` | Technical + on-page SEO, schema |
| `.claude/agents/market-competitor-analyst.md` | Competitor research |
| `.claude/agents/market-content-strategist.md` | Calendars, video scripts, blog briefs |
| `.claude/agents/market-copywriter.md` | Ads, emails, product copy |
| `.claude/agents/market-analyst.md` | Performance data, tracking gaps |
| `marketing/brand-context.md` | Voice, audiences, offers, **claim rules**; every agent reads this file first |

## Customizing
- Change voice, offers, or claim rules in `marketing/brand-context.md` and every agent picks the change up.
- Add a specialist by adding a new `.claude/agents/market-*.md` and listing it in the skill's team table.
- The team writes reports only. It changes site code, posts content, or launches ads only when you ask it to.
