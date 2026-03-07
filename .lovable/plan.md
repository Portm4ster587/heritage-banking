

## Plan: Account Numbers, ACFCU Logo, Bank Directory Expansion

### Issues Identified

1. **Account numbers contain letters** (e.g., `CHK1234...`, `SAV...`, `LOAN...`, `INV-...`, `BUS-...`). The ecosystem spec requires purely numeric 10-digit account numbers. The admin approval flow on line 781 of `FullAdminPanel.tsx` generates `PER1234567890` style numbers.

2. **ACFCU uses a generic Lucide icon** instead of the uploaded eagle logo. The user provided the real ACFCU logo to embed.

3. **Bank directory only has 11 banks**. Need to add more major US banks (e.g., Ally, Huntington, KeyBank, M&T Bank, Truist, USAA, Navy Federal, SunTrust, Comerica, Zions, First Citizens, etc.).

4. **No bank logos in external account UI** — just Lucide icons. The `BankIcon` component should be enhanced.

---

### Implementation Steps

#### 1. Copy ACFCU logo to assets
- Copy `user-uploads://IMG_5582-removebg-preview.png` to `src/assets/acfcu-logo.png`

#### 2. Update `ModernBankIcons.tsx`
- Import the ACFCU logo image and render it as an `<img>` tag instead of a Lucide icon for ACFCU
- Add 15+ more US banks to the `modernBanks` array: Ally Bank, Truist, Huntington, KeyBank, M&T Bank, USAA, Navy Federal Credit Union, Comerica, Zions Bancorp, First Citizens, SunTrust, Synchrony, Citizens Bank, BMO Harris, Woodforest National Bank
- Each gets a unique Lucide icon and color scheme

#### 3. Fix account number generation to be purely numeric (10 digits)
- In `FullAdminPanel.tsx` line 781, change:
  ```
  `${application.application_type.toUpperCase().slice(0, 3)}${Date.now()}`
  ```
  to a 10-digit random numeric string:
  ```
  `${Math.floor(1000000000 + Math.random() * 9000000000)}`
  ```
- Also update `setup_premium_user_accounts` and `setup_invest_group_overseas_account` DB functions via migration to use numeric-only account numbers (existing accounts with letters in the DB are already seeded and won't be retroactively changed without a migration, but new accounts will be correct)

#### 4. Create migration to normalize existing account numbers
- SQL migration to update any existing `accounts` rows where `account_number` contains non-numeric characters, replacing them with generated 10-digit numeric IDs
- Ensure uniqueness with a loop/sequence approach

#### 5. Update `BankIcon` component
- For ACFCU: render the imported logo image
- Keep Lucide icons for other banks (real bank logos would require licensing)

---

### Files to Create/Edit
- **Copy**: `user-uploads://IMG_5582-removebg-preview.png` → `src/assets/acfcu-logo.png`
- **Edit**: `src/components/ModernBankIcons.tsx` — ACFCU logo, add 15+ banks
- **Edit**: `src/components/admin/FullAdminPanel.tsx` — fix account number generation (line 781)
- **Create**: Supabase migration to normalize existing account numbers to 10-digit numeric

