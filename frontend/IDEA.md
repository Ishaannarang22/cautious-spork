## Agentic Legal Dispute Automation — Internal Build Brief

## Purpose

Build an **automated consumer rights enforcement system** that:

- Collects user-provided factual information
- Identifies **potential statutory or regulatory compensation eligibility**
- Generates compliant **pre-action and complaint documents**
- Routes those documents to the correct counterparty
- Operates strictly as **legal information + automation**, not legal advice

The system must be **auditable, jurisdiction-scoped, and legally conservative**.

## Quick summary: End-to-end automated rights-eligibility + claims generation + enforcement workflow.

## ****Aim: to sell this to law firms to automate disputes, where firms don’t have enough resources to tackle them. Consumer-facing but also translate this to business use cases too. Law firm take a cut of the earnings.****

### Other notes:

- California focus only
- Drafting documents

---

---

---

# Four parts:

# Part 1: Research the individual nyne/firecrawl frontend HET

- Email
- Address
- Water supply companies
- Electricity companies
- Phone numbers called (often illegal from spam calls)

Input: email, address and phone number

Output: list of all companies that they have worked with in the past, currently are with, any company that has their data available and any third parties

# Part 2: Researching user legal information card stack and infringement - using firecrawl x2 Benjamin

Input: All companies

Output: Research into all companies that have violated consumer right law, and outputting the documents

# Part 3: Draft legal documents with reducto (Ishaan)

Input: Documents (either find documents)

Output: edited documents that 

# Part 4: Resend to send (Ishaan)

# (Later Part 5): Business option

# (later part 6): Tell businesses which things they are voilating

---

---

---

# Design & general explanation

---

## Core Design Constraints (Non-Negotiable)

1. **No legal advice**
    - Use “may be eligible”, “commonly applies”, “based on provided information”
    - Never assert outcomes or recommend litigation strategy
2. **User-in-the-loop**
    - Explicit user confirmation before:
        - Final eligibility presentation (user just clicks send to the email; brief overview given. We explicitly target things where the user will not be liable for)
        - Document dispatch
        - Escalation to regulators or ombudsmen
3. **Deterministic before generative**
    - Rules and eligibility thresholds must be rule-based. Supporting agents to read through docs and make sure everything is above board - and give back a % accuracy; only >95% get through (we’ll do this part at the end)
    - LLMs used only for interpretation, explanation, and templated drafting

---

## System Architecture (Agent-Based)

### 1. Intake & Normalization Agent

**Function**

- Collect structured user data (identity, address, providers, dates, incidents)
- Validate inputs and flag missing or ambiguous facts
- Normalize data (e.g. postcode → provider → regulator)

**Output**

- Clean, structured fact object with confidence flags

---

### 2. Rights Mapping Agent (Rule Engine)

**Function**

- Map normalized facts to applicable statutory or regulatory frameworks
- Identify relevant schemes (e.g. automatic compensation, complaint standards)

**Characteristics**

- Jurisdiction-locked (California)
- Fully auditable rule paths
- No freeform reasoning

**Output**

- List of potentially applicable rights with citations

---

### 3. Eligibility Assessment Agent

**Function**

- Evaluate whether minimum factual thresholds appear met
- Classify compensation as:
    - Automatic
    - Discretionary
    - Notice-dependent

**Constraints**

- Never output a definitive entitlement
- Must expose uncertainty clearly

**Output (example)**

```json
{
"status":"potentially eligible",
"basis":"Guaranteed standards scheme",
"confidence":0.81,
"user_action_required":true
}

```

---

### 4. Document Generation Agent

**Function**

- Generate jurisdiction-specific legal correspondence:
    - Pre-action letters
    - Complaint escalation notices
    - Regulator submissions

**Constraints**

- Template-driven only
- Clause-level statutory references
- No open-ended drafting or legal strategy language

---

### 5. Counterparty Identification & Routing Agent

**Function**

- Identify correct recipient:
    - Provider complaints teams
    - Legal departments
    - Regulators / ombudsmen
- Dispatch documents via approved channels

**Requirements**

- Explicit user approval before sending
- Full audit trail (timestamp, recipient, content hash)

---

### 6. Evidence & Source Agents

**Function**

- Scrape and retrieve public regulatory information and provider policies
- Parse uploaded documents (contracts, bills, notices)
- Extract structured evidence for eligibility assessment

(Uses Firecrawl, Reducto, etc. — implementation details omitted)

---

## Agent Autonomy Boundaries

| Capability | Allowed |
| --- | --- |
| Data validation | Yes |
| Provider identification | Yes |
| Rule application | Yes (deterministic) |
| Legal interpretation | Limited |
| Outcome prediction | No |
| Strategic advice | No |
| Document sending | Only with user consent |

---

## Jurisdiction Strategy

- System is **single-jurisdiction per deployment**
- Each jurisdiction requires:
    - Separate rule engine
    - Separate document templates
    - Separate disclaimers

No cross-jurisdiction inference.

---

## Compliance & Risk Requirements

- Full decision traceability
- Clear user disclaimers at all decision points
- Ability for a human reviewer to override any step
- Logs suitable for regulator or legal audit

---

## Positioning (Internal)

This system is **not** a lawyer replacement.

It is:

> Automated infrastructure for enforcing existing consumer rights through compliant procedural workflows.
> 

https://www.calprivacy.com/copy-of-california-data-breach-laws

# Jonathan

Additional info:
Class-action settlements alone hit nearly $40 billion in 2024, marking the third consecutive, record-setting year in the category. Private [TCPA](https://www.fcc.gov/general/telemarketing-and-robocalls) (Telephone Consumer Protection Act) claims have also exploded: Filings in January 2025 soared 268% year over year, with first-half TCPA class actions rising 44% from 2024. Meanwhile, the Consumer Financial Protection Bureau (CFPB) complaint database – a proxy for consumer dissatisfaction – registered over 1.29 million complaints in Q1 2025, a 169% increase from Q1 2024.