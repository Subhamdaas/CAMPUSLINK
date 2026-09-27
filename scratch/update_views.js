const fs = require('fs');

let code = fs.readFileSync('FRONTEND/app.js', 'utf8');

function replaceExact(source, target, replacement) {
  if (!source.includes(target)) {
    console.error('Target not found:', target.slice(0, 50));
    return source;
  }
  return source.replace(target, replacement);
}

// 1. studentDashboard buttons
code = code.replace('<span>ATS Resume (94%)</span>', '<span>ATS Resume</span>');
code = code.replace('<span>Explore 6 Drives</span>', '<span>Explore ${jobs.length} Drives</span>');

// 2. studentDashboard readiness hero
const targetReadinessHero = [
  '        <!-- AI READINESS HERO BANNER -->',
  '        <div class="ai-readiness-banner">',
  '          <div class="readiness-score-dial">',
  '            <div class="score-circle-outer">',
  '              <span class="score-number">${data.readinessData.overallScore}</span>',
  '            </div>',
  '            <div>',
  '              <div class="readiness-meta-title">CAMPUS READINESS INDEX</div>',
  '              <div class="readiness-status-tag">${data.readinessData.status}</div>',
  '              <p style="font-size:13px; color:#cbd5e1; max-width:480px;">',
  '                Your multi-vector score places you in the <strong>Top 3% of the 2026 Batch</strong>. You are pre-cleared for Tier-1 Super Dream drives.',
  '              </p>',
  '            </div>',
  '          </div>'
].join('\n');

const replacementReadinessHero = [
  '        <!-- AI READINESS HERO BANNER -->',
  '        <div class="ai-readiness-banner">',
  '          <div class="readiness-score-dial">',
  '            <div class="score-circle-outer">',
  '              <span class="score-number">${data.readinessData && data.readinessData.overallScore ? data.readinessData.overallScore : \'--\'}</span>',
  '            </div>',
  '            <div>',
  '              <div class="readiness-meta-title">CAMPUS READINESS INDEX</div>',
  '              <div class="readiness-status-tag">${data.readinessData && data.readinessData.status ? data.readinessData.status : \'Pending Assessment\'}</div>',
  '              <p style="font-size:13px; color:#cbd5e1; max-width:480px;">',
  '                ${data.readinessData && data.readinessData.overallScore ? \'Readiness score synthesized across academic record, coding accuracy, and interview evaluations.\' : \'Complete your profile and assessments to calculate your readiness score.\'}',
  '              </p>',
  '            </div>',
  '          </div>'
].join('\n');

code = replaceExact(code, targetReadinessHero, replacementReadinessHero);

// 3. studentDashboard KPIs
const targetOffersKpi = [
  '              <div class="kpi-label">Offers Received</div>',
  '              <div class="kpi-value">1</div>',
  '              <div class="kpi-trend trend-up"><i data-lucide="award" style="width:14px; height:14px;"></i> ₹9.0 LPA Base</div>'
].join('\n');

const replacementOffersKpi = [
  '              <div class="kpi-label">Offers Received</div>',
  '              <div class="kpi-value">${data.offers.length}</div>',
  '              <div class="kpi-trend trend-up"><i data-lucide="award" style="width:14px; height:14px;"></i> ${data.offers.length > 0 ? data.offers[0].ctc : \'0 Active Offers\'}</div>'
].join('\n');

code = replaceExact(code, targetOffersKpi, replacementOffersKpi);

const targetNextInterview = '              <div class="kpi-trend" style="color:#ef4444;"><i data-lucide="clock" style="width:14px; height:14px;"></i> Next: Tomorrow</div>';
const replacementNextInterview = '              <div class="kpi-trend" style="color:${ints.length > 0 ? \'#ef4444\' : \'var(--text-muted)\'};"><i data-lucide="clock" style="width:14px; height:14px;"></i> ${ints.length > 0 ? ints[0].date : \'No Upcoming\'}</div>';
code = replaceExact(code, targetNextInterview, replacementNextInterview);

const targetShortlisted = '              <div class="kpi-trend trend-up"><i data-lucide="trending-up" style="width:14px; height:14px;"></i> 1 Shortlisted</div>';
const replacementShortlisted = '              <div class="kpi-trend trend-up"><i data-lucide="trending-up" style="width:14px; height:14px;"></i> ${apps.filter(a => a.status === \'Shortlisted\').length} Shortlisted</div>';
code = replaceExact(code, targetShortlisted, replacementShortlisted);

// 4. studentDashboard Top Recommended Jobs
const targetJobsCard = [
  '            <!-- Top Recommended Jobs -->',
  '            <div class="card" style="margin-bottom:24px;">',
  '              <div class="card-header">',
  '                <div class="card-title">Top AI Recommended Jobs</div>',
  '                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo(\'#student/jobs\')">View All (6)</button>',
  '              </div>',
  '',
  '              <div style="display:flex; flex-direction:column; gap:14px;">',
  '                ${jobs.slice(0, 3).map(j => `',
  '                  <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; display:flex; align-items:center; justify-content:space-between; gap:14px;">',
  '                    <div style="display:flex; align-items:center; gap:12px;">',
  '                      <img src="${j.companyLogo}" style="width:36px; height:36px; border-radius:8px; object-fit:contain; border:1px solid var(--border-subtle);" onerror="this.src=\'https://cdn-icons-png.flaticon.com/512/2991/2991148.png\'">',
  '                      <div>',
  '                        <div style="font-weight:700; font-size:14.5px; color:var(--navy-900);">${j.title}</div>',
  '                        <div style="font-size:12.5px; color:var(--text-muted);">${j.company} • ${j.location} • <strong style="color:var(--brand-blue);">${j.ctc}</strong></div>',
  '                      </div>',
  '                    </div>',
  '                    <div style="display:flex; align-items:center; gap:12px;">',
  '                      <span class="badge badge-cyan" style="font-size:13px; font-weight:800;">${j.aiMatchScore}% Match</span>',
  '                      <button class="btn ${j.applied ? \'btn-secondary\' : \'btn-primary\'} btn-sm" onclick="${j.applied ? "CampusLinkApp.navigateTo(\'#student/applications\')" : `CampusLinkStore.applyForJob(\'${j.id}\'); CampusLinkApp.handleRouteChange();`}">',
  '                        ${j.applied ? \'Track Application\' : \'Apply Now\'}',
  '                      </button>',
  '                    </div>',
  '                  </div>',
  '                `).join(\'\')}',
  '              </div>',
  '            </div>'
].join('\n');

const replacementJobsCard = [
  '            <!-- Top Recommended Jobs -->',
  '            <div class="card" style="margin-bottom:24px;">',
  '              <div class="card-header">',
  '                <div class="card-title">Active Campus Opportunities</div>',
  '                <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo(\'#student/jobs\')">View All (${jobs.length})</button>',
  '              </div>',
  '',
  '              ${jobs.length === 0 ? `',
  '                <div style="padding:24px; text-align:center; color:var(--text-muted);">',
  '                  <i data-lucide="briefcase" style="width:36px; height:36px; margin-bottom:8px; color:var(--text-subtle);"></i>',
  '                  <div style="font-weight:700; color:var(--navy-900);">No active job openings.</div>',
  '                  <div style="font-size:12.5px; margin-top:4px;">Campus placement drives will appear here as soon as they are announced.</div>',
  '                </div>',
  '              ` : `',
  '                <div style="display:flex; flex-direction:column; gap:14px;">',
  '                  ${jobs.slice(0, 3).map(j => `',
  '                    <div style="border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; display:flex; align-items:center; justify-content:space-between; gap:14px;">',
  '                      <div style="display:flex; align-items:center; gap:12px;">',
  '                        <img src="${j.companyLogo}" style="width:36px; height:36px; border-radius:8px; object-fit:contain; border:1px solid var(--border-subtle);" onerror="this.src=\'https://cdn-icons-png.flaticon.com/512/2991/2991148.png\'">',
  '                        <div>',
  '                          <div style="font-weight:700; font-size:14.5px; color:var(--navy-900);">${j.title}</div>',
  '                          <div style="font-size:12.5px; color:var(--text-muted);">${j.company} • ${j.location} • <strong style="color:var(--brand-blue);">${j.ctc}</strong></div>',
  '                        </div>',
  '                      </div>',
  '                      <div style="display:flex; align-items:center; gap:12px;">',
  '                        ${j.aiMatchScore ? `<span class="badge badge-cyan" style="font-size:13px; font-weight:800;">${j.aiMatchScore}% Match</span>` : \'\'}',
  '                        <button class="btn ${j.applied ? \'btn-secondary\' : \'btn-primary\'} btn-sm" onclick="${j.applied ? "CampusLinkApp.navigateTo(\'#student/applications\')" : `CampusLinkStore.applyForJob(\'${j.id}\'); CampusLinkApp.handleRouteChange();`}">',
  '                          ${j.applied ? \'Track Application\' : \'Apply Now\'}',
  '                        </button>',
  '                      </div>',
  '                    </div>',
  '                  `).join(\'\')}',
  '                </div>',
  '              `}',
  '            </div>'
].join('\n');

code = replaceExact(code, targetJobsCard, replacementJobsCard);

// 5. studentDashboard Active Applications Tracker
const targetAppsTable = [
  '              <div class="table-container">',
  '                <table class="data-table">',
  '                  <thead>',
  '                    <tr>',
  '                      <th>Company</th>',
  '                      <th>Role</th>',
  '                      <th>Match Score</th>',
  '                      <th>Status</th>',
  '                    </tr>',
  '                  </thead>',
  '                  <tbody>',
  '                    ${apps.map(a => `',
  '                      <tr>',
  '                        <td style="font-weight:700; color:var(--navy-900);">${a.company}</td>',
  '                        <td>${a.role}</td>',
  '                        <td><span class="badge badge-info">${a.aiMatchScore}%</span></td>',
  '                        <td><span class="badge badge-${a.statusType}">${a.status}</span></td>',
  '                      </tr>',
  '                    `).join(\'\')}',
  '                  </tbody>',
  '                </table>',
  '              </div>'
].join('\n');

const replacementAppsTable = [
  '              ${apps.length === 0 ? `',
  '                <div style="padding:24px; text-align:center; color:var(--text-muted);">',
  '                  <i data-lucide="file-text" style="width:36px; height:36px; margin-bottom:8px; color:var(--text-subtle);"></i>',
  '                  <div style="font-weight:700; color:var(--navy-900);">No applications yet.</div>',
  '                  <div style="font-size:12.5px; margin-top:4px;">You have not submitted applications to any campus placement drives yet.</div>',
  '                </div>',
  '              ` : `',
  '                <div class="table-container">',
  '                  <table class="data-table">',
  '                    <thead>',
  '                      <tr>',
  '                        <th>Company</th>',
  '                        <th>Role</th>',
  '                        <th>Status</th>',
  '                      </tr>',
  '                    </thead>',
  '                    <tbody>',
  '                      ${apps.map(a => `',
  '                        <tr>',
  '                          <td style="font-weight:700; color:var(--navy-900);">${a.company}</td>',
  '                          <td>${a.role}</td>',
  '                          <td><span class="badge badge-${a.statusType}">${a.status}</span></td>',
  '                        </tr>',
  '                      `).join(\'\')}',
  '                    </tbody>',
  '                  </table>',
  '                </div>',
  '              `}'
].join('\n');

code = replaceExact(code, targetAppsTable, replacementAppsTable);

// 6. studentDashboard Next Interview Card
const targetIntCard = [
  '            <!-- Next Interview Card -->',
  '            <div class="card" style="margin-bottom:24px; border-left:4px solid var(--brand-blue);">',
  '              <div class="card-header">',
  '                <div class="card-title" style="display:flex; align-items:center; gap:6px;">',
  '                  <i data-lucide="video" style="width:18px; height:18px; color:var(--brand-blue);"></i>',
  '                  <span>Upcoming Interview</span>',
  '                </div>',
  '                <span class="badge badge-danger">Tomorrow</span>',
  '              </div>',
  '',
  '              <div>',
  '                <div style="font-weight:800; font-size:16px; color:var(--navy-950); margin-bottom:4px;">Google India - SDE 1</div>',
  '                <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">Round 1: Advanced DSA & Problem Solving</div>',
  '                ',
  '                <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; font-size:12.5px; margin-bottom:16px;">',
  '                  <div><strong>Time:</strong> 24 Sep 2026, 10:30 AM IST</div>',
  '                  <div><strong>Panel:</strong> Siddharth Verma (Staff Engineer)</div>',
  '                </div>',
  '',
  '                <div style="display:flex; gap:10px;">',
  '                  <a href="${ints[0].meetUrl}" target="_blank" class="btn btn-primary btn-sm" style="flex:1;">',
  '                    <i data-lucide="video" style="width:14px; height:14px;"></i>',
  '                    <span>Join Meet</span>',
  '                  </a>',
  '                  <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo(\'#student/interviews\')">Prep Notes</button>',
  '                </div>',
  '              </div>',
  '            </div>'
].join('\n');

const replacementIntCard = [
  '            <!-- Next Interview Card -->',
  '            <div class="card" style="margin-bottom:24px; border-left:4px solid var(--brand-blue);">',
  '              <div class="card-header">',
  '                <div class="card-title" style="display:flex; align-items:center; gap:6px;">',
  '                  <i data-lucide="video" style="width:18px; height:18px; color:var(--brand-blue);"></i>',
  '                  <span>Upcoming Interview</span>',
  '                </div>',
  '                ${ints.length > 0 ? `<span class="badge badge-danger">${ints[0].date}</span>` : \'<span class="badge badge-neutral">No Rounds</span>\'}',
  '              </div>',
  '',
  '              ${ints.length === 0 ? `',
  '                <div style="padding:16px 0; text-align:center; color:var(--text-muted);">',
  '                  <i data-lucide="calendar" style="width:32px; height:32px; margin-bottom:6px; color:var(--text-subtle);"></i>',
  '                  <div style="font-weight:700; color:var(--navy-900); font-size:13.5px;">No interviews scheduled.</div>',
  '                  <div style="font-size:12px; margin-top:2px;">Confirmed interview loops and links will appear here.</div>',
  '                </div>',
  '              ` : `',
  '                <div>',
  '                  <div style="font-weight:800; font-size:16px; color:var(--navy-950); margin-bottom:4px;">${ints[0].company} - ${ints[0].role}</div>',
  '                  <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">${ints[0].round}</div>',
  '                  ',
  '                  <div style="background:#f8fafc; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; font-size:12.5px; margin-bottom:16px;">',
  '                    <div><strong>Time:</strong> ${ints[0].date}, ${ints[0].time}</div>',
  '                    <div><strong>Panel:</strong> ${ints[0].panel}</div>',
  '                  </div>',
  '',
  '                  <div style="display:flex; gap:10px;">',
  '                    <a href="${ints[0].meetUrl}" target="_blank" class="btn btn-primary btn-sm" style="flex:1;">',
  '                      <i data-lucide="video" style="width:14px; height:14px;"></i>',
  '                      <span>Join Meet</span>',
  '                    </a>',
  '                    <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo(\'#student/interviews\')">Prep Notes</button>',
  '                  </div>',
  '                </div>',
  '              `}',
  '            </div>'
].join('\n');

code = replaceExact(code, targetIntCard, replacementIntCard);

// 7. studentDashboard notifications
const targetNotifs = [
  '              <div style="display:flex; flex-direction:column; gap:12px;">',
  '                ${data.notifications.slice(0, 3).map(n => `',
  '                  <div style="padding:10px 12px; background:#f8fafc; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">',
  '                    <div style="font-weight:700; font-size:13px; color:var(--navy-900); margin-bottom:2px;">${n.title}</div>',
  '                    <div style="font-size:12px; color:var(--text-muted); line-height:1.4;">${n.message}</div>',
  '                    <div style="font-size:10.5px; color:var(--text-subtle); margin-top:4px;">${n.time}</div>',
  '                  </div>',
  '                `).join(\'\')}',
  '              </div>'
].join('\n');

const replacementNotifs = [
  '              ${data.notifications.length === 0 ? `',
  '                <div style="padding:16px 0; text-align:center; color:var(--text-muted); font-size:13px;">',
  '                  <i data-lucide="bell-off" style="width:24px; height:24px; margin-bottom:6px; color:var(--text-subtle);"></i>',
  '                  <div style="font-weight:700; color:var(--navy-900);">You\'re all caught up.</div>',
  '                  <div style="font-size:12px; margin-top:2px;">No unread placement notices.</div>',
  '                </div>',
  '              ` : `',
  '                <div style="display:flex; flex-direction:column; gap:12px;">',
  '                  ${data.notifications.slice(0, 3).map(n => `',
  '                    <div style="padding:10px 12px; background:#f8fafc; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">',
  '                      <div style="font-weight:700; font-size:13px; color:var(--navy-900); margin-bottom:2px;">${n.title}</div>',
  '                      <div style="font-size:12px; color:var(--text-muted); line-height:1.4;">${n.message}</div>',
  '                      <div style="font-size:10.5px; color:var(--text-subtle); margin-top:4px;">${n.time}</div>',
  '                    </div>',
  '                  `).join(\'\')}',
  '                </div>',
  '              `}'
].join('\n');

code = replaceExact(code, targetNotifs, replacementNotifs);

// 8. studentResume guard
const targetResume = '    studentResume: () => {\n      const data = CampusLinkStore.get();\n      const r = data.studentProfile.resumeDetails;';
const replacementResume = [
  '    studentResume: () => {',
  '      const data = CampusLinkStore.get();',
  '      const r = data.studentProfile && data.studentProfile.resumeDetails ? data.studentProfile.resumeDetails : {',
  '        fileName: \'Resume_Pending_Upload.pdf\',',
  '        fileSize: \'0 KB\',',
  '        lastUpdated: \'Not yet parsed\',',
  '        atsScore: 0,',
  '        aiAnalysis: {',
  '          summary: \'Upload your verified resume to run the AI ATS compatibility analysis.\',',
  '          strengths: [\'Resume document pending upload\'],',
  '          improvements: [\'Upload standard PDF format containing academic and project history\']',
  '        }',
  '      };'
].join('\n');
code = replaceExact(code, targetResume, replacementResume);

// 9. studentReadiness
const targetReadiness = [
  '    studentReadiness: () => {',
  '      const data = CampusLinkStore.get();',
  '      const r = data.readinessData;',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Campus Readiness Score & Matrix</h1>',
  '            <p class="page-subtitle">Holistic 5-pillar employability benchmark derived from code accuracy, CGPA, and live interviews</p>',
  '          </div>',
  '        </div>',
  '',
  '        <div class="ai-readiness-banner">',
  '          <div class="readiness-score-dial">',
  '            <div class="score-circle-outer">',
  '              <span class="score-number">${r.overallScore}</span>',
  '            </div>',
  '            <div>',
  '              <div class="readiness-meta-title">OVERALL READINESS STATUS</div>',
  '              <div class="readiness-status-tag">${r.status}</div>',
  '              <p style="font-size:13px; color:#cbd5e1;">Meets or exceeds 100% of corporate cutoffs for Google, Microsoft, and Amazon.</p>',
  '            </div>',
  '          </div>',
  '        </div>'
].join('\n');

const replacementReadiness = [
  '    studentReadiness: () => {',
  '      const data = CampusLinkStore.get();',
  '      const r = data.readinessData;',
  '',
  '      if (!r || !r.overallScore || r.overallScore === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Campus Readiness Score & Matrix</h1>',
  '              <p class="page-subtitle">Employability benchmark derived from code accuracy, CGPA, and live interviews</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'sparkles\', \'Readiness Score Pending\', \'Complete your profile and assessments to calculate your readiness score. Readiness analysis will appear once sufficient student data is available.\', \'Complete Profile\', () => CampusLinkApp.navigateTo(\'#student/profile\'))}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Campus Readiness Score & Matrix</h1>',
  '            <p class="page-subtitle">Employability benchmark derived from code accuracy, CGPA, and live interviews</p>',
  '          </div>',
  '        </div>',
  '',
  '        <div class="ai-readiness-banner">',
  '          <div class="readiness-score-dial">',
  '            <div class="score-circle-outer">',
  '              <span class="score-number">${r.overallScore}</span>',
  '            </div>',
  '            <div>',
  '              <div class="readiness-meta-title">OVERALL READINESS STATUS</div>',
  '              <div class="readiness-status-tag">${r.status}</div>',
  '              <p style="font-size:13px; color:#cbd5e1;">Readiness analysis synthesized across academic record, coding accuracy, and interview evaluations.</p>',
  '            </div>',
  '          </div>',
  '        </div>'
].join('\n');

code = replaceExact(code, targetReadiness, replacementReadiness);

// 10. studentSkillGap
const targetSkillGap = [
  '    studentSkillGap: () => {',
  '      const data = CampusLinkStore.get();',
  '      const profile = data.skillGapProfiles[CampusLinkApp.selectedTargetRole] || data.skillGapProfiles["Full Stack Engineer"];',
  '',
  '      return `'
].join('\n');

const replacementSkillGap = [
  '    studentSkillGap: () => {',
  '      const data = CampusLinkStore.get();',
  '      const profile = (data.skillGapProfiles && (data.skillGapProfiles[CampusLinkApp.selectedTargetRole] || data.skillGapProfiles["Full Stack Engineer"])) || null;',
  '',
  '      if (!profile || !profile.skills || profile.skills.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Target Role Skill Gap Visualizer</h1>',
  '              <p class="page-subtitle">Real-time delta analysis against corporate hiring requirements</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'compass\', \'Select Target Role\', \'Select a target role to analyse your current skill profile against placement criteria.\', null, null)}',
  '        `;',
  '      }',
  '',
  '      return `'
].join('\n');

code = replaceExact(code, targetSkillGap, replacementSkillGap);

// 11. studentJobs
const targetStudentJobs = [
  '    studentJobs: () => {',
  '      const data = CampusLinkStore.get();',
  '      const jobs = data.jobs;',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Campus Placement Opportunities</h1>',
  '            <p class="page-subtitle">AI-matched job openings with live eligibility screening</p>',
  '          </div>',
  '        </div>'
].join('\n');

const replacementStudentJobs = [
  '    studentJobs: () => {',
  '      const data = CampusLinkStore.get();',
  '      const jobs = data.jobs;',
  '',
  '      if (!jobs || jobs.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Campus Placement Opportunities</h1>',
  '              <p class="page-subtitle">Active campus job openings and placement drives</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'briefcase\', \'No Active Job Openings\', \'There are currently no active placement drives published for your batch.\', \'Return to Dashboard\', () => CampusLinkApp.navigateTo(\'#student/dashboard\'))}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Campus Placement Opportunities</h1>',
  '            <p class="page-subtitle">Active campus job openings and placement drives</p>',
  '          </div>',
  '        </div>'
].join('\n');

code = replaceExact(code, targetStudentJobs, replacementStudentJobs);

// 12. studentJobDetails guard
const targetJobDetailGuard = '      const job = data.jobs.find(j => j.id === jobId) || data.jobs[0];';
const replacementJobDetailGuard = [
  '      const job = data.jobs.find(j => j.id === jobId) || (data.jobs.length > 0 ? data.jobs[0] : null);',
  '      if (!job) {',
  '        return `',
  '          <div class="page-header">',
  '            <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo(\'#student/jobs\')" style="margin-bottom:8px;">',
  '              <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>',
  '              <span>Back to Job Listings</span>',
  '            </button>',
  '            <h1 class="page-title">Job Details</h1>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'briefcase\', \'Job Not Found\', \'The requested campus placement opening was not found or is no longer active.\', \'View All Drives\', () => CampusLinkApp.navigateTo(\'#student/jobs\'))}',
  '        `;',
  '      }'
].join('\n');

code = replaceExact(code, targetJobDetailGuard, replacementJobDetailGuard);

// 13. studentApplications empty state
const targetStudentApps = [
  '    studentApplications: () => {',
  '      const data = CampusLinkStore.get();',
  '      const apps = data.applications;',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">My Placement Applications</h1>',
  '            <p class="page-subtitle">Live multi-stage recruitment pipeline tracker across active campus drives</p>',
  '          </div>',
  '        </div>',
  '',
  '        <div style="display:flex; flex-direction:column; gap:20px;">',
  '          ${apps.map(a => `'
].join('\n');

const replacementStudentApps = [
  '    studentApplications: () => {',
  '      const data = CampusLinkStore.get();',
  '      const apps = data.applications;',
  '',
  '      if (!apps || apps.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">My Placement Applications</h1>',
  '              <p class="page-subtitle">Live multi-stage recruitment pipeline tracker across active campus drives</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'file-text\', \'No Applications Yet\', \'You have not submitted applications to any campus drives yet.\', \'Explore Open Drives\', () => CampusLinkApp.navigateTo(\'#student/jobs\'))}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">My Placement Applications</h1>',
  '            <p class="page-subtitle">Live multi-stage recruitment pipeline tracker across active campus drives</p>',
  '          </div>',
  '        </div>',
  '',
  '        <div style="display:flex; flex-direction:column; gap:20px;">',
  '          ${apps.map(a => `'
].join('\n');

code = replaceExact(code, targetStudentApps, replacementStudentApps);

// 14. studentInterviews empty state
const targetStudentInts = [
  '    studentInterviews: () => {',
  '      const data = CampusLinkStore.get();',
  '      const ints = data.interviews;',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Interviews & Live Schedule</h1>',
  '            <p class="page-subtitle">Confirmed interview loops, meeting links, and personalized preparation strategies</p>',
  '          </div>',
  '        </div>',
  '',
  '        <div style="display:flex; flex-direction:column; gap:20px;">',
  '          ${ints.map(i => `'
].join('\n');

const replacementStudentInts = [
  '    studentInterviews: () => {',
  '      const data = CampusLinkStore.get();',
  '      const ints = data.interviews;',
  '',
  '      if (!ints || ints.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Interviews & Live Schedule</h1>',
  '              <p class="page-subtitle">Confirmed interview loops, meeting links, and preparation strategies</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'calendar\', \'No Interviews Scheduled\', \'There are no active or upcoming interview rounds scheduled for your profile.\', \'View Applications\', () => CampusLinkApp.navigateTo(\'#student/applications\'))}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Interviews & Live Schedule</h1>',
  '            <p class="page-subtitle">Confirmed interview loops, meeting links, and preparation strategies</p>',
  '          </div>',
  '        </div>',
  '',
  '        <div style="display:flex; flex-direction:column; gap:20px;">',
  '          ${ints.map(i => `'
].join('\n');

code = replaceExact(code, targetStudentInts, replacementStudentInts);

// 15. studentDocuments empty state
const targetStudentDocs = [
  '    studentDocuments: () => {',
  '      const data = CampusLinkStore.get();',
  '      const docs = data.documents;',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Document Verification Vault</h1>',
  '            <p class="page-subtitle">Academic grade cards, bonafide approvals, and certificates verified by the placement office</p>',
  '          </div>',
  '          <div class="page-actions">',
  '            <button class="btn btn-primary" onclick="CampusLinkApp.showToast(\'Document upload dialog opened.\', \'info\')">',
  '              <i data-lucide="upload" style="width:16px; height:16px;"></i>',
  '              <span>Upload Document</span>',
  '            </button>',
  '          </div>',
  '        </div>',
  '',
  '        <div class="table-container">'
].join('\n');

const replacementStudentDocs = [
  '    studentDocuments: () => {',
  '      const data = CampusLinkStore.get();',
  '      const docs = data.documents;',
  '',
  '      if (!docs || docs.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Document Verification Vault</h1>',
  '              <p class="page-subtitle">Academic grade cards, bonafide approvals, and certificates verified by the placement office</p>',
  '            </div>',
  '            <div class="page-actions">',
  '              <button class="btn btn-primary" onclick="CampusLinkApp.showToast(\'Document upload dialog opened.\', \'info\')">',
  '                <i data-lucide="upload" style="width:16px; height:16px;"></i>',
  '                <span>Upload Document</span>',
  '              </button>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'folder\', \'No Documents Uploaded\', \'Your document vault is currently empty. Upload transcripts and certificates for verification.\', \'Upload Document\', () => CampusLinkApp.showToast(\'Document upload dialog opened.\', \'info\'))}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Document Verification Vault</h1>',
  '            <p class="page-subtitle">Academic grade cards, bonafide approvals, and certificates verified by the placement office</p>',
  '          </div>',
  '          <div class="page-actions">',
  '            <button class="btn btn-primary" onclick="CampusLinkApp.showToast(\'Document upload dialog opened.\', \'info\')">',
  '              <i data-lucide="upload" style="width:16px; height:16px;"></i>',
  '              <span>Upload Document</span>',
  '            </button>',
  '          </div>',
  '        </div>',
  '',
  '        <div class="table-container">'
].join('\n');

code = replaceExact(code, targetStudentDocs, replacementStudentDocs);

// 16. studentOffers empty state
const targetStudentOffers = [
  '    studentOffers: () => {',
  '      const data = CampusLinkStore.get();',
  '      const offers = data.offers;',
  '',
  '      return `'
].join('\n');

const replacementStudentOffers = [
  '    studentOffers: () => {',
  '      const data = CampusLinkStore.get();',
  '      const offers = data.offers;',
  '',
  '      if (!offers || offers.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Offer Letters & Placement Selection</h1>',
  '              <p class="page-subtitle">Official selection letters and compensation breakdowns</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'award\', \'No Offers Recorded\', \'Official selection letters and corporate offer letters will appear here once released by recruiters.\', null, null)}',
  '        `;',
  '      }',
  '',
  '      return `'
].join('\n');

code = replaceExact(code, targetStudentOffers, replacementStudentOffers);

// 17. studentNotifications empty state
const targetStudentNotifs = [
  '    studentNotifications: () => {',
  '      const data = CampusLinkStore.get();',
  '      const notifs = data.notifications;',
  '',
  '      return `'
].join('\n');

const replacementStudentNotifs = [
  '    studentNotifications: () => {',
  '      const data = CampusLinkStore.get();',
  '      const notifs = data.notifications;',
  '',
  '      if (!notifs || notifs.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Placement Notifications & Announcements</h1>',
  '              <p class="page-subtitle">Official notices, drive reminders, and interview schedules</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'bell-off\', "You\'re All Caught Up", \'There are no unread placement notices or company announcements.\', null, null)}',
  '        `;',
  '      }',
  '',
  '      return `'
].join('\n');

code = replaceExact(code, targetStudentNotifs, replacementStudentNotifs);

// 18. remove password123 in studentSettings
code = code.replace('value="password123"', 'placeholder="Current password"');

// 19. recruiterAIMatching empty state & honest AI messaging
const targetAIMatching = [
  '    recruiterAIMatching: () => {',
  '      const data = CampusLinkStore.get();',
  '      const pool = data.aiMatchingPool;',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">AI Candidate Matching & Ranking Engine</h1>',
  '            <p class="page-subtitle">Multi-vector ranking evaluating DSA, CGPA, Git projects, and interview consistency</p>',
  '          </div>',
  '          <div class="page-actions">',
  '            <button class="btn btn-secondary" onclick="CampusLinkApp.showToast(\'Exporting ranked batch to CSV...\', \'success\')">',
  '              <i data-lucide="download" style="width:16px; height:16px;"></i>',
  '              <span>Export Ranking</span>',
  '            </button>',
  '          </div>',
  '        </div>'
].join('\n');

const replacementAIMatching = [
  '    recruiterAIMatching: () => {',
  '      const data = CampusLinkStore.get();',
  '      const pool = data.aiMatchingPool;',
  '',
  '      if (!pool || pool.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">AI Candidate Matching & Ranking Engine</h1>',
  '              <p class="page-subtitle">Multi-vector ranking evaluating DSA, CGPA, projects, and interview consistency</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'sparkles\', \'Matching Analysis Is Currently Unavailable\', \'AI candidate matching requires active job criteria and an eligible candidate batch to analyze.\', \'Select Job Opening\', () => CampusLinkApp.navigateTo(\'#recruiter/jobs\'))}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">AI Candidate Matching & Ranking Engine</h1>',
  '            <p class="page-subtitle">Multi-vector ranking evaluating DSA, CGPA, Git projects, and interview consistency</p>',
  '          </div>',
  '          <div class="page-actions">',
  '            <button class="btn btn-secondary" onclick="CampusLinkApp.showToast(\'Exporting ranked batch to CSV...\', \'success\')">',
  '              <i data-lucide="download" style="width:16px; height:16px;"></i>',
  '              <span>Export Ranking</span>',
  '            </button>',
  '          </div>',
  '        </div>'
].join('\n');

code = replaceExact(code, targetAIMatching, replacementAIMatching);

// 20. recruiterJobs empty state
const targetRecruiterJobs = [
  '    recruiterJobs: () => {',
  '      const data = CampusLinkStore.get();',
  '      const jobs = data.jobs.filter(j => j.company.includes(\'Google\') || true);',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Active Campus Postings</h1>',
  '            <p class="page-subtitle">Manage campus openings, configure cutoff benchmarks, and track applicant pools</p>',
  '          </div>',
  '          <div class="page-actions">',
  '            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo(\'#recruiter/create-job\')">',
  '              <i data-lucide="plus" style="width:16px; height:16px;"></i>',
  '              <span>Create New Posting</span>',
  '            </button>',
  '          </div>',
  '        </div>',
  '',
  '        <div class="table-container">'
].join('\n');

const replacementRecruiterJobs = [
  '    recruiterJobs: () => {',
  '      const data = CampusLinkStore.get();',
  '      const jobs = data.jobs;',
  '',
  '      if (!jobs || jobs.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Active Campus Postings</h1>',
  '              <p class="page-subtitle">Manage campus openings, configure cutoff benchmarks, and track applicant pools</p>',
  '            </div>',
  '            <div class="page-actions">',
  '              <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo(\'#recruiter/create-job\')">',
  '                <i data-lucide="plus" style="width:16px; height:16px;"></i>',
  '                <span>Create Job</span>',
  '              </button>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'briefcase\', \'No Active Job Openings\', \'You have not published any job openings for campus placement yet.\', \'Create Job\', () => CampusLinkApp.navigateTo(\'#recruiter/create-job\'))}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Active Campus Postings</h1>',
  '            <p class="page-subtitle">Manage campus openings, configure cutoff benchmarks, and track applicant pools</p>',
  '          </div>',
  '          <div class="page-actions">',
  '            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo(\'#recruiter/create-job\')">',
  '              <i data-lucide="plus" style="width:16px; height:16px;"></i>',
  '              <span>Create Job</span>',
  '            </button>',
  '          </div>',
  '        </div>',
  '',
  '        <div class="table-container">'
].join('\n');

code = replaceExact(code, targetRecruiterJobs, replacementRecruiterJobs);

// 21. recruiterCandidates empty state
const targetRecruiterCand = [
  '    recruiterCandidates: () => {',
  '      const data = CampusLinkStore.get();',
  '      const list = data.studentsDirectory;',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Candidate Pool & Directory</h1>',
  '            <p class="page-subtitle">Batch of 2026 registered candidates eligible for Google technical drives</p>',
  '          </div>',
  '          <div class="page-actions">',
  '            <button class="btn btn-secondary" onclick="CampusLinkApp.showToast(\'Exporting candidate profiles to Excel...\', \'success\')">',
  '              <i data-lucide="download" style="width:16px; height:16px;"></i>',
  '              <span>Export Pool</span>',
  '            </button>',
  '          </div>',
  '        </div>'
].join('\n');

const replacementRecruiterCand = [
  '    recruiterCandidates: () => {',
  '      const data = CampusLinkStore.get();',
  '      const list = data.studentsDirectory;',
  '',
  '      if (!list || list.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Candidate Pool & Directory</h1>',
  '              <p class="page-subtitle">Registered student candidates eligible for placement drives</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'users\', \'No Candidates Found\', \'There are currently no candidates registered in the applicant pool.\', null, null)}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Candidate Pool & Directory</h1>',
  '            <p class="page-subtitle">Registered student candidates eligible for placement drives</p>',
  '          </div>',
  '          <div class="page-actions">',
  '            <button class="btn btn-secondary" onclick="CampusLinkApp.showToast(\'Exporting candidate profiles to Excel...\', \'success\')">',
  '              <i data-lucide="download" style="width:16px; height:16px;"></i>',
  '              <span>Export Pool</span>',
  '            </button>',
  '          </div>',
  '        </div>'
].join('\n');

code = replaceExact(code, targetRecruiterCand, replacementRecruiterCand);

// 22. recruiterDrives empty state
const targetRecruiterDrives = [
  '    recruiterDrives: () => {',
  '      const drvs = CampusLinkStore.get().drives;',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Placement Drive Operations</h1>',
  '            <p class="page-subtitle">Manage drive dates, room allocations, test links, and student attendance rosters</p>',
  '          </div>',
  '          <div class="page-actions">',
  '            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo(\'#recruiter/scheduler\')">',
  '              <i data-lucide="calendar" style="width:16px; height:16px;"></i>',
  '              <span>View Slot Calendar</span>',
  '            </button>',
  '          </div>',
  '        </div>',
  '',
  '        <div style="display:flex; flex-direction:column; gap:16px;">'
].join('\n');

const replacementRecruiterDrives = [
  '    recruiterDrives: () => {',
  '      const drvs = CampusLinkStore.get().drives;',
  '',
  '      if (!drvs || drvs.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Placement Drive Operations</h1>',
  '              <p class="page-subtitle">Manage drive dates, room allocations, test links, and student attendance rosters</p>',
  '            </div>',
  '            <div class="page-actions">',
  '              <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo(\'#recruiter/create-job\')">',
  '                <i data-lucide="calendar-plus" style="width:16px; height:16px;"></i>',
  '                <span>Schedule Drive</span>',
  '              </button>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'calendar\', \'No Placement Drives Scheduled\', \'There are no active or upcoming placement drives scheduled.\', \'Schedule Drive\', () => CampusLinkApp.navigateTo(\'#recruiter/create-job\'))}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Placement Drive Operations</h1>',
  '            <p class="page-subtitle">Manage drive dates, room allocations, test links, and student attendance rosters</p>',
  '          </div>',
  '          <div class="page-actions">',
  '            <button class="btn btn-primary" onclick="CampusLinkApp.navigateTo(\'#recruiter/scheduler\')">',
  '              <i data-lucide="calendar" style="width:16px; height:16px;"></i>',
  '              <span>View Slot Calendar</span>',
  '            </button>',
  '          </div>',
  '        </div>',
  '',
  '        <div style="display:flex; flex-direction:column; gap:16px;">'
].join('\n');

code = replaceExact(code, targetRecruiterDrives, replacementRecruiterDrives);

// 23. officerDashboard empty state
const targetOfficerDash = [
  '    officerDashboard: () => {',
  '      const data = CampusLinkStore.get();',
  '      const stats = data.officerDashboardStats;',
  '      const branches = data.branchAnalytics;',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Placement Command Center</h1>',
  '            <p class="page-subtitle">National Institute of Technology • 2026 Placement Performance Command</p>',
  '          </div>'
].join('\n');

const replacementOfficerDash = [
  '    officerDashboard: () => {',
  '      const data = CampusLinkStore.get();',
  '      const stats = data.officerDashboardStats;',
  '      const branches = data.branchAnalytics;',
  '',
  '      if (!stats || !branches || branches.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Placement Command Center</h1>',
  '              <p class="page-subtitle">Academic Session: ${CampusLinkApp.CURRENT_ACADEMIC_SESSION} • Placement Performance Command</p>',
  '            </div>',
  '            <div class="page-actions">',
  '              <button class="btn btn-secondary" onclick="CampusLinkApp.navigateTo(\'#officer/reports\')">',
  '                <i data-lucide="file-spreadsheet" style="width:16px; height:16px;"></i>',
  '                <span>Institutional Reports</span>',
  '              </button>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'bar-chart-3\', \'No Placement Data Available Yet\', \'Institutional placement records, branch conversions, and package analytics will appear once placement drives commence for the current academic session.\', \'Manage Placement Drives\', () => CampusLinkApp.navigateTo(\'#officer/drives\'))}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Placement Command Center</h1>',
  '            <p class="page-subtitle">Academic Session: ${CampusLinkApp.CURRENT_ACADEMIC_SESSION} • Placement Performance Command</p>',
  '          </div>'
].join('\n');

code = replaceExact(code, targetOfficerDash, replacementOfficerDash);

// 24. officerRiskPrediction empty state
const targetRiskPred = [
  '    officerRiskPrediction: () => {',
  '      const data = CampusLinkStore.get();',
  '      const highRisk = data.riskPrediction.highRisk;',
  '',
  '      return `'
].join('\n');

const replacementRiskPred = [
  '    officerRiskPrediction: () => {',
  '      const data = CampusLinkStore.get();',
  '      const highRisk = data.riskPrediction && data.riskPrediction.highRisk ? data.riskPrediction.highRisk : [];',
  '',
  '      if (!highRisk || highRisk.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Predictive Risk & Intervention Matrix</h1>',
  '              <p class="page-subtitle">Early risk detection identifying students needing remedial algorithmic training before Tier-2 cycles</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'shield-alert\', \'Prediction Requires Historical Placement Data\', \'AI risk prediction models require historical assessment and placement records to identify at-risk student cohorts.\', null, null)}',
  '        `;',
  '      }',
  '',
  '      return `'
].join('\n');

code = replaceExact(code, targetRiskPred, replacementRiskPred);

// 25. officerStudents empty state
const targetOfficerStudents = [
  '    officerStudents: () => {',
  '      const data = CampusLinkStore.get();',
  '      const list = data.studentsDirectory;',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Master Student Directory</h1>',
  '            <p class="page-subtitle">Batch of 2026 • 680 Total Candidates</p>',
  '          </div>',
  '        </div>'
].join('\n');

const replacementOfficerStudents = [
  '    officerStudents: () => {',
  '      const data = CampusLinkStore.get();',
  '      const list = data.studentsDirectory;',
  '',
  '      if (!list || list.length === 0) {',
  '        return `',
  '          <div class="page-header">',
  '            <div>',
  '              <h1 class="page-title">Master Student Directory</h1>',
  '              <p class="page-subtitle">Academic Session: ${CampusLinkApp.CURRENT_ACADEMIC_SESSION}</p>',
  '            </div>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'users\', \'No Students Found\', \'There are no students registered in the institutional placement directory.\', \'Add Student\', () => CampusLinkApp.showToast(\'Student registration modal will connect to institutional SIS API.\', \'info\'))}',
  '        `;',
  '      }',
  '',
  '      return `',
  '        <div class="page-header">',
  '          <div>',
  '            <h1 class="page-title">Master Student Directory</h1>',
  '            <p class="page-subtitle">Academic Session: ${CampusLinkApp.CURRENT_ACADEMIC_SESSION} • ${list.length} Candidates</p>',
  '          </div>',
  '        </div>'
].join('\n');

code = replaceExact(code, targetOfficerStudents, replacementOfficerStudents);

// 26. officerStudentDetails guard
const targetOfficerDetails = [
  '    officerStudentDetails: () => {',
  '      const data = CampusLinkStore.get();',
  '      const st = data.studentsDirectory[0];',
  '      const p = data.studentProfile;',
  '      return `'
].join('\n');

const replacementOfficerDetails = [
  '    officerStudentDetails: () => {',
  '      const data = CampusLinkStore.get();',
  '      const st = data.studentsDirectory && data.studentsDirectory.length > 0 ? data.studentsDirectory[0] : null;',
  '      if (!st) {',
  '        return `',
  '          <div class="page-header">',
  '            <button class="btn btn-secondary btn-sm" onclick="CampusLinkApp.navigateTo(\'#officer/students\')" style="margin-bottom:8px;">',
  '              <i data-lucide="arrow-left" style="width:14px; height:14px;"></i>',
  '              <span>Back to Student Directory</span>',
  '            </button>',
  '            <h1 class="page-title">Student 360° Dossier</h1>',
  '          </div>',
  '          ${CampusLinkApp.renderEmptyState(\'user-x\', \'Student Record Not Found\', \'No student details available for this record.\', \'Back to Directory\', () => CampusLinkApp.navigateTo(\'#officer/students\'))}',
  '        `;',
  '      }',
  '      const p = data.studentProfile;',
  '      return `'
].join('\n');

code = replaceExact(code, targetOfficerDetails, replacementOfficerDetails);

// 27. officerRecruiters empty state
const targetOfficerRecs = [
  '    officerRecruiters: () => {',
  '      const recs = CampusLinkStore.get().recruitersDirectory;',
  '      return `',
  '        <div class="page-header"><h1 class="page-title">Recruiter Directory & Tier Partners</h1></div>',
  '        <div class="table-container">'
].join('\n');

const replacementOfficerRecs = [
  '    officerRecruiters: () => {',
  '      const recs = CampusLinkStore.get().recruitersDirectory;',
  '      if (!recs || recs.length === 0) {',
  '        return `',
  '          <div class="page-header"><h1 class="page-title">Recruiter Directory & Tier Partners</h1></div>',
  '          ${CampusLinkApp.renderEmptyState(\'building-2\', \'No Recruiters Registered\', \'No corporate recruiter accounts are currently associated with the placement portal.\', \'Invite Recruiter\', () => CampusLinkApp.showToast(\'Corporate invitation dispatch will connect to partner API.\', \'info\'))}',
  '        `;',
  '      }',
  '      return `',
  '        <div class="page-header"><h1 class="page-title">Recruiter Directory & Tier Partners</h1></div>',
  '        <div class="table-container">'
].join('\n');

code = replaceExact(code, targetOfficerRecs, replacementOfficerRecs);

// 28. officerDrives empty state
const targetOfficerDrives = [
  '    officerDrives: () => {',
  '      const drvs = CampusLinkStore.get().drives;',
  '      return `',
  '        <div class="page-header"><h1 class="page-title">Master Placement Drives</h1></div>',
  '        <div class="table-container">'
].join('\n');

const replacementOfficerDrives = [
  '    officerDrives: () => {',
  '      const drvs = CampusLinkStore.get().drives;',
  '      if (!drvs || drvs.length === 0) {',
  '        return `',
  '          <div class="page-header"><h1 class="page-title">Master Placement Drives</h1></div>',
  '          ${CampusLinkApp.renderEmptyState(\'calendar\', \'No Placement Drives Scheduled\', \'There are no placement drives currently scheduled for the academic session.\', \'Schedule Drive\', () => CampusLinkApp.navigateTo(\'#officer/scheduler\'))}',
  '        `;',
  '      }',
  '      return `',
  '        <div class="page-header"><h1 class="page-title">Master Placement Drives</h1></div>',
  '        <div class="table-container">'
].join('\n');

code = replaceExact(code, targetOfficerDrives, replacementOfficerDrives);

// 29. officerOffers empty state
const targetOfficerOffers = [
  '    officerOffers: () => {',
  '      const off = CampusLinkStore.get().offers;',
  '      return `',
  '        <div class="page-header"><h1 class="page-title">Master Offers Registry</h1></div>',
  '        <div class="table-container">'
].join('\n');

const replacementOfficerOffers = [
  '    officerOffers: () => {',
  '      const off = CampusLinkStore.get().offers;',
  '      if (!off || off.length === 0) {',
  '        return `',
  '          <div class="page-header"><h1 class="page-title">Master Offers Registry</h1></div>',
  '          ${CampusLinkApp.renderEmptyState(\'award\', \'No Offers Recorded\', \'No corporate placement offers have been logged in the institutional database yet.\', null, null)}',
  '        `;',
  '      }',
  '      return `',
  '        <div class="page-header"><h1 class="page-title">Master Offers Registry</h1></div>',
  '        <div class="table-container">'
].join('\n');

code = replaceExact(code, targetOfficerOffers, replacementOfficerOffers);

// 30. officerDocuments empty state
const targetOfficerDocs = [
  '    officerDocuments: () => {',
  '      const q = CampusLinkStore.get().documentVerificationQueue;',
  '      return `',
  '        <div class="page-header"><h1 class="page-title">Institutional Document Verification Desk</h1></div>',
  '        <div class="table-container">'
].join('\n');

const replacementOfficerDocs = [
  '    officerDocuments: () => {',
  '      const q = CampusLinkStore.get().documentVerificationQueue;',
  '      if (!q || q.length === 0) {',
  '        return `',
  '          <div class="page-header"><h1 class="page-title">Institutional Document Verification Desk</h1></div>',
  '          ${CampusLinkApp.renderEmptyState(\'check-circle-2\', \'No Pending Documents\', \'All student credentials, grade cards, and bonafide records are verified and up to date.\', null, null)}',
  '        `;',
  '      }',
  '      return `',
  '        <div class="page-header"><h1 class="page-title">Institutional Document Verification Desk</h1></div>',
  '        <div class="table-container">'
].join('\n');

code = replaceExact(code, targetOfficerDocs, replacementOfficerDocs);

// 31. officerSettings academic session
code = code.replace('value="2025 - 2026"', 'value="${CampusLinkApp.CURRENT_ACADEMIC_SESSION}"');

fs.writeFileSync('FRONTEND/app.js', code, 'utf8');
console.log('Successfully updated all subviews with empty states and proper guards!');
