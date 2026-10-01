// Progress markers that let getServerSideProps keep judges on the right step of the assessment.
type FlowCookie = 'hasStartedAssessment' | 'hasCompletedAssessment' | 'hasCompletedRanking';

const FLOW_COOKIES: FlowCookie[] = ['hasStartedAssessment', 'hasCompletedAssessment', 'hasCompletedRanking'];

export function setFlowCookie(name: FlowCookie) {
  document.cookie = `${name}=true; path=/; SameSite=Lax`;
}

export function clearFlowCookies() {
  for (const name of FLOW_COOKIES) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  }
}
