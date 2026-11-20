# Team Verification Checklist

Git history cannot establish the items below. Please answer them and then update the documents listed in the right-hand column. Until then, the corresponding statements stay labelled **[TEAM CONFIRMATION REQUIRED]** or **[UNKNOWN]**. Answer only from what actually happened; do not reconstruct to fit the template.

## A. People and roles
| # | Question | Answer | Update |
|---|---|---|---|
| A1 | Who is on the team (names, student IDs if required, roles)? Are there members with no Git identity? | Team lead states three members: M1 Vishakha Sharma, M2 Prajinraj Ranawat, M3 Fatema Shakir (M3 has no Git identity). **Still needed:** each member's role, and M3's contributions to date with evidence. | [team-contributions](team-contributions.md), [project-overview](project-overview.md) |
| A2 | Confirm identity mapping: are "Vishakha" and "Vishakha Sharma" the same person? "Prajinraj" and "Prajinraj Ranawat"? | | team-contributions §1 |
| A3 | Who acted as Product Owner / coordinator, if anyone? | | agile-methodology |
| A4 | Who wrote `discord_mcp`, `twilio_mcp`, `multiplication_mcp`, the Chat/Session models, and the sharing feature? | | team-contributions §3 |
| A5 | Who designed the UI (landing page, dashboard)? Any design tools or mock-ups to cite? | | feature-development-history F-01, F-03 |
| A6 | Who wrote the content of `ARCHITECTURE_DOCUMENTATION.md`? | | F-14 |
| A7 | What has M3 (Fatema Shakir) contributed so far — design, research, testing, documentation, meetings, code on another machine? For each: date, artefact/link, who can confirm. Does M3 now have repository access and a Git identity? | | team-contributions §3, [work-allocation](work-allocation.md) §6 |

## B. AI assistance and attribution
| # | Question | Answer | Update |
|---|---|---|---|
| B1 | Who directed the AI-assisted session of 2026-10-28, and on which machine/account? | | team-contributions §4 |
| B2 | Was AI used for any earlier commits (April–August)? | | team-contributions |
| B3 | What does the course policy require for disclosing AI assistance? Has it been followed? | | README, team-contributions |
| B4 | Does each member understand and approve the working-tree changes (T-011…T-019)? | | kanban-board §2.2 |

## C. Process and meetings
| # | Question | Answer | Update |
|---|---|---|---|
| C1 | Were there regular meetings or stand-ups? Dates, attendees, decisions, notes? | | sprint-plan Part A |
| C2 | Was any board, spreadsheet, chat channel or issue tracker used for tasks? Please export it. | | kanban-board, agile-metrics |
| C3 | Were sprints, deadlines or milestones set by the course? Dates and deliverables? | | sprint-plan, project-timeline |
| C4 | Were GitHub Issues, pull requests or reviews used on the remote? (The remote was not queried.) | | team-contributions, metrics |
| C5 | Did anyone review another member's code, and how? | | retrospective, challenges H2 |
| C6 | Was there a retrospective or lessons-learned discussion? Outcomes? | | retrospective §5 |
| C7 | Which methodology, if any, did the team believe it was following? | | agile-methodology §1 |

## D. History and decisions
| # | Question | Answer | Update |
|---|---|---|---|
| D1 | Why do `production` and `main`/`prajinraj` contain parallel copies of the same commits? Which is authoritative? | | ISS-004 |
| D2 | Why were four edits made to `src/app/api/integrations/route.ts` within 21 minutes, including a 61-line removal and re-addition? | | ISS-005 |
| D3 | Why did commit `e680aca` ("restore all source files") restore only `.gitignore` and `railway.toml`? Why was `DEPLOYMENT_GUIDE.md` untracked? | | ISS-002 |
| D4 | Why is there a gap from 2026-04-12 to 2026-08-06? | | agile-metrics |
| D5 | Why was `.next` committed initially? | | ISS-001 |
| D6 | Original requirements: who set them, in what document, with what changes over time? | | product-backlog |
| D7 | Key technical decisions (Next.js, MongoDB, separate tool servers, GPT-4o first): who decided and why? | | feature-development-history |

## E. Testing and deployment
| # | Question | Answer | Update |
|---|---|---|---|
| E1 | What manual testing was performed, when, by whom? Any screenshots, videos, test sheets? | | testing-and-quality-assurance |
| E2 | Was the application ever deployed (Railway or elsewhere)? URL, date, issues? | | F-13, metrics |
| E3 | Demo or user-feedback sessions held? Feedback received? | | agile-methodology, retrospective |
| E4 | Which of the 56 tools were exercised against real accounts? | | TC-T03 |

## F. Security and operations
| # | Question | Answer | Update |
|---|---|---|---|
| F1 | Have credentials that were shared in chats/logs during development been rotated? | | R-006, T-031 |
| F2 | Are `.env` and `.env.local` kept out of version control on every machine and branch? | | challenges |
| F3 | Is the remote repository public, and did it ever contain secrets in earlier history? | | challenges |

## G. Items to do once answered
- [ ] Replace each remaining `TBC` owner in the action register ([retrospective](retrospective.md) §3) and agree the allocation in [work-allocation](work-allocation.md).
- [ ] Add real meeting records, if any, to `sprint-plan.md` Part A as **[VERIFIED]**.
- [ ] Update `team-contributions.md` with confirmed ownership and remove the corresponding warnings.
- [ ] Re-run the final audit in [README](README.md).
