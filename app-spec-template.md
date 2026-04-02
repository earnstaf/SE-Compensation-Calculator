# App Spec Sheet

## 1. Overview

**App Name:** SE Compensation Calculator
**One-Line Description:** App to calculate SE compensation
**Problem Statement:** Allows user to understand how much they will make on a single won deal.
**Target Users:**  Solution Engineers

## 2. Core Value Proposition

This is a small, lightweight, portable app that works on both windows and mac with no additional dependencies.  It has several options for things like compensation uplifts and configurable OTV and PCR numbers.
## 3. User Stories

Write 3-5 user stories that capture the core workflows.

- As a Solutions Engineer, I want to calculate my quota retirement and compensation on a sold opportunity so that I can better understand my pay.


## 4. Feature Set

### MVP (Must Have)

| Feature | Description | Priority |
|---------|-------------|----------|
| Calculator        | Small compensation calculator            | P0       |
| Example Scenarios        | Pre-fill certain calculator variables to give examples of certain situations   | P0       |
| A clean user, intuitive user interface        |  The calculator should be easy to understand and provide tooltips for anything abiguous           | P0       |

### Phase 2 (Should Have)

| Feature | Description | Priority |
|---------|-------------|----------|
| Ask AI feature        | A small chat window where the user can ask salary questions             | P1       |
|         |             | P1       |

### Future (Nice to Have)

| Feature | Description | Priority |
|---------|-------------|----------|
| Variant for mobile        | A port of the desktop app for Android/Iphone            | P2       |

## 5. Technical Requirements

**Platform:** Web or Desktop app.  I lean towards desktop app for portability and so I don't have to transfer an html file
**Frontend:** Unsure.  Needs to be portable across windows and mac
**Backend:** I don't anticipate needing a backend.  This will be a self-contained user app.
**Database:**  Not needed
**Auth:** N/A
**Hosting:** Local only
**External APIs/Services:** Not needed

## 6. Data Model

I will provide a spreadsheet whose functionality we need to capture in a desktop app

| Entity | Key Fields | Relationships |
|--------|------------|---------------|
|        |            |               |
|        |            |               |

## 7. UI/UX Notes

**Layout Style:** Desktop app with modern layout
**Design Direction:** Highly portable (windows/mac), self contained with no dependencies, intuitive UI that provides tooltips on fields.
**Key Screens/Views:** Primary view will look like a calculator but have "Sales" variables like OTV, NARR Quota, PCR, NARR Quota Credit, IARR, CARR, etc.

1.
2.
3.

**Responsive?** Yes 

## 8. Constraints and Boundaries

- What is explicitly out of scope for this version?: Nothing
- Any performance requirements (e.g., must handle X concurrent users)?: Should just be a single user desktop app
- Any compliance or security considerations? No
- Budget or timeline constraints? No

## 9. Success Criteria

How do you know this app is working as intended? Define 2-3 measurable outcomes.

1. Presents accurate compensation results
2. Users find it easy to use
3. Provides several example "compensation" scenarios

## 10. Open Questions

List anything unresolved that needs a decision before or during build.

1. Nothing
2.
