import { gql } from "./client";

export type WomenAccess = { allowed: boolean; consentGiven: boolean };

export async function fetchWomenAccess(userId: string): Promise<WomenAccess> {
  const data = await gql<{ womenAccess: WomenAccess }>(
    `query($userId: ID!) { womenAccess(userId: $userId) { allowed consentGiven } }`,
    { userId }
  );
  return data.womenAccess;
}

export async function sendWomenConsent(userId: string): Promise<void> {
  await gql(
    `mutation($userId: ID!) { giveWomenConsent(userId: $userId) { success message } }`,
    { userId }
  );
}

// ---------- PERIOD TRACKER ----------

export type PeriodAnalysis = {
  avgCycle: number;
  avgPeriodDays: number | null;
  lengths: number[];
  pattern: "regular" | "short" | "prolonged" | "unknown";
  estimated: boolean;
  nextPeriod: string;
  ovulation: string | null;
  fertileStart: string | null;
  fertileEnd: string | null;
  note: string | null;
};

export type PeriodEntry = {
  startDate: string;
  endDate: string | null;
  flow: "light" | "medium" | "heavy" | null;
  days: number | null;
  pain: "painful" | "painless" | null;
  spotting: boolean | null;
};

export type MissedPeriod = {
  date: string;
  test: "negative" | "positive" | "not_done";
};

export type PeriodData = {
  dates: string[];
  periods: PeriodEntry[];
  analysis: PeriodAnalysis | null;
  missed: MissedPeriod[];
};

export async function fetchPeriodData(userId: string): Promise<PeriodData> {
  const data = await gql<{ periodData: PeriodData }>(
    `query($userId: ID!) {
      periodData(userId: $userId) {
        dates
        periods { startDate endDate flow days pain spotting }
        analysis {
          avgCycle avgPeriodDays lengths pattern estimated
          nextPeriod ovulation fertileStart fertileEnd note
        }
        missed { date test }
      }
    }`,
    { userId }
  );
  return data.periodData;
}

export async function savePeriodDate(
  userId: string,
  date: string,
  endDate: string | null,
  flow: string | null,
  pain: string | null,
  spotting: boolean | null
): Promise<void> {
  await gql(
    `mutation($userId: ID!, $date: String!, $endDate: String, $flow: String, $pain: String, $spotting: Boolean) {
      addPeriodDate(userId: $userId, date: $date, endDate: $endDate, flow: $flow, pain: $pain, spotting: $spotting) {
        success message
      }
    }`,
    { userId, date, endDate, flow, pain, spotting }
  );
}

export async function saveMissedPeriod(userId: string, date: string, test: string): Promise<void> {
  await gql(
    `mutation($userId: ID!, $date: String!, $test: String!) {
      saveMissedPeriod(userId: $userId, date: $date, test: $test) { success message }
    }`,
    { userId, date, test }
  );
}

export async function deleteMissedPeriod(userId: string, date: string): Promise<void> {
  await gql(
    `mutation($userId: ID!, $date: String!) {
      deleteMissedPeriod(userId: $userId, date: $date) { success message }
    }`,
    { userId, date }
  );
}

// ---------- PREGNANCY ----------

export type PregnancyData = {
  lmp: string;
  dueDate: string;
  week: number;
  day: number;
  trimester: 1 | 2 | 3;
  daysLeft: number;
  progress: number;
  babySize: string;
  tip: string;
};

export async function fetchPregnancyData(userId: string): Promise<PregnancyData | null> {
  const data = await gql<{ pregnancyData: PregnancyData | null }>(
    `query($userId: ID!) {
      pregnancyData(userId: $userId) {
        lmp dueDate week day trimester daysLeft progress babySize tip
      }
    }`,
    { userId }
  );
  return data.pregnancyData;
}

export async function startPregnancy(userId: string, lmp: string): Promise<void> {
  await gql(
    `mutation($userId: ID!, $lmp: String!) {
      startPregnancy(userId: $userId, lmp: $lmp) { success message }
    }`,
    { userId, lmp }
  );
}

export async function endPregnancy(userId: string): Promise<void> {
  await gql(
    `mutation($userId: ID!) { endPregnancy(userId: $userId) { success message } }`,
    { userId }
  );
}

// ---------- PREGNANCY: WAZAN, BP, VISIT ----------

export type PregnancyLog = {
  date: string;
  weight: number | null;
  systolic: number | null;
  diastolic: number | null;
  highBp: boolean;
};

export async function fetchPregnancyLogs(userId: string): Promise<PregnancyLog[]> {
  const data = await gql<{ pregnancyLogs: PregnancyLog[] }>(
    `query($userId: ID!) {
      pregnancyLogs(userId: $userId) { date weight systolic diastolic highBp }
    }`,
    { userId }
  );
  return data.pregnancyLogs || [];
}

export async function savePregnancyLog(
  userId: string,
  date: string,
  weight: number | null,
  systolic: number | null,
  diastolic: number | null
): Promise<void> {
  await gql(
    `mutation($userId: ID!, $date: String!, $weight: Float, $systolic: Int, $diastolic: Int) {
      savePregnancyLog(userId: $userId, date: $date, weight: $weight, systolic: $systolic, diastolic: $diastolic) {
        success message
      }
    }`,
    { userId, date, weight, systolic, diastolic }
  );
}

export async function deletePregnancyLog(userId: string, date: string): Promise<void> {
  await gql(
    `mutation($userId: ID!, $date: String!) {
      deletePregnancyLog(userId: $userId, date: $date) { success message }
    }`,
    { userId, date }
  );
}

export type PregnancyNotes = {
  nextVisitDate: string | null;
  nextVisitNote: string | null;
  questions: string[];
};

export async function fetchPregnancyNotes(userId: string): Promise<PregnancyNotes> {
  const data = await gql<{ pregnancyNotes: PregnancyNotes }>(
    `query($userId: ID!) {
      pregnancyNotes(userId: $userId) { nextVisitDate nextVisitNote questions }
    }`,
    { userId }
  );
  return data.pregnancyNotes;
}

export async function savePregnancyNotes(
  userId: string,
  nextVisitDate: string | null,
  nextVisitNote: string | null,
  questions: string[]
): Promise<void> {
  await gql(
    `mutation($userId: ID!, $nextVisitDate: String, $nextVisitNote: String, $questions: [String]) {
      savePregnancyNotes(userId: $userId, nextVisitDate: $nextVisitDate, nextVisitNote: $nextVisitNote, questions: $questions) {
        success message
      }
    }`,
    { userId, nextVisitDate, nextVisitNote, questions }
  );
}

// ---------- PREGNANCY: COMPLAINTS AUR JAANCHEIN ----------

export type PregnancyComplaintDay = {
  date: string;
  complaints: string[]; // nausea, vomiting, ...
  others: string[];
  note: string | null;
};

export async function fetchPregnancyComplaints(userId: string): Promise<PregnancyComplaintDay[]> {
  const data = await gql<{ pregnancyComplaints: PregnancyComplaintDay[] }>(
    `query($userId: ID!) {
      pregnancyComplaints(userId: $userId) { date complaints others note }
    }`,
    { userId }
  );
  return data.pregnancyComplaints || [];
}

export async function savePregnancyComplaints(
  userId: string,
  date: string,
  complaints: string[],
  others: string[],
  note: string | null
): Promise<void> {
  await gql(
    `mutation($userId: ID!, $date: String!, $complaints: [String], $others: [String], $note: String) {
      savePregnancyComplaints(userId: $userId, date: $date, complaints: $complaints, others: $others, note: $note) {
        success message
      }
    }`,
    { userId, date, complaints, others, note }
  );
}

export type PregnancyInvestigation = {
  key: string;
  done: boolean;
  date: string | null;
  note: string | null;
};

export async function fetchPregnancyInvestigations(userId: string): Promise<PregnancyInvestigation[]> {
  const data = await gql<{ pregnancyInvestigations: PregnancyInvestigation[] }>(
    `query($userId: ID!) {
      pregnancyInvestigations(userId: $userId) { key done date note }
    }`,
    { userId }
  );
  return data.pregnancyInvestigations || [];
}

export async function savePregnancyInvestigation(
  userId: string,
  key: string,
  done: boolean,
  date: string | null,
  note: string | null
): Promise<void> {
  await gql(
    `mutation($userId: ID!, $key: String!, $done: Boolean!, $date: String, $note: String) {
      savePregnancyInvestigation(userId: $userId, key: $key, done: $done, date: $date, note: $note) {
        success message
      }
    }`,
    { userId, key, done, date, note }
  );
}