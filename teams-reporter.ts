import type {
    Reporter,
    FullConfig,
    Suite,
    TestCase,
    TestResult
} from '@playwright/test/reporter';
import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';

<<<<<<< HEAD
// Load environment variables from .env file
dotenv.config();
=======
// Load env vars from .env first, then .env.local so local overrides are applied.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)

type ModuleStats = { name: string; passed: number; failed: number };

function buildTestSummaryCard(payload: {
    project: string;
    environment: string;
    triggeredBy: string;
<<<<<<< HEAD
    runTime: string;
=======
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
    executionTime: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    reportUrl: string;
    modules: ModuleStats[];
}) {
    return {
<<<<<<< HEAD
        runTime: payload.runTime,
        total: payload.total,
        passed: payload.passed,
        failed: payload.failed,
        skipped: payload.skipped,
        flaky: payload.flaky,
        reportUrl: payload.reportUrl,
=======
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
        type: 'message',
        attachments: [
            {
                contentType: 'application/vnd.microsoft.card.adaptive',
<<<<<<< HEAD
                contentUrl: null,
=======
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
                content: {
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    type: 'AdaptiveCard',
                    version: '1.4',
<<<<<<< HEAD
                    msteams: {
                        width: 'Full'
                    },
                    body: [
                        {
                            type: 'TextBlock',
                            size: 'Large',
                            weight: 'Bolder',
                            text: '✅ StaffConnect - Test Execution Summary',
=======
                    body: [
                        {
                            type: 'TextBlock',
                            text: 'StaffConnect Test Execution Summary',
                            weight: 'Bolder',
                            size: 'Large',
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
                            wrap: true
                        },
                        {
                            type: 'TextBlock',
<<<<<<< HEAD
                            spacing: 'None',
                            text: `Project: *${payload.project}*`,
                            wrap: true
                        },
                        {
                            type: 'TextBlock',
                            spacing: 'None',
                            text: `Environment: **${payload.environment}**`,
                            wrap: true
                        },
                        {
                            type: 'TextBlock',
                            spacing: 'None',
                            text: `Triggered by: **${payload.triggeredBy}**`,
                            wrap: true
                        },
                        {
                            type: 'TextBlock',
                            spacing: 'Small',
                            text: `Execution Time: \`${payload.executionTime}\``,
                            isSubtle: true,
=======
                            text: `Run completed at ${payload.executionTime}`,
                            isSubtle: true,
                            spacing: 'None',
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
                            wrap: true
                        },
                        {
                            type: 'ColumnSet',
                            spacing: 'Medium',
                            columns: [
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
<<<<<<< HEAD
                                        { type: 'TextBlock', weight: 'Bolder', text: 'Total', wrap: true },
                                        { type: 'TextBlock', text: `${payload.total}`, wrap: true }
=======
                                        { type: 'TextBlock', text: 'Passed', weight: 'Bolder', wrap: true },
                                        { type: 'TextBlock', text: `${payload.passed}`, size: 'ExtraLarge', color: 'Good', weight: 'Bolder', wrap: true }
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
                                    ]
                                },
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
<<<<<<< HEAD
                                        { type: 'TextBlock', weight: 'Bolder', color: 'Good', text: 'Passed', wrap: true },
                                        { type: 'TextBlock', color: 'Good', text: `${payload.passed}`, wrap: true }
=======
                                        { type: 'TextBlock', text: 'Failed', weight: 'Bolder', wrap: true },
                                        { type: 'TextBlock', text: `${payload.failed}`, size: 'ExtraLarge', color: 'Attention', weight: 'Bolder', wrap: true }
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
                                    ]
                                },
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
<<<<<<< HEAD
                                        { type: 'TextBlock', weight: 'Bolder', color: 'Warning', text: 'Failed', wrap: true },
                                        { type: 'TextBlock', color: 'Warning', text: `${payload.failed}`, wrap: true }
=======
                                        { type: 'TextBlock', text: 'Skipped', weight: 'Bolder', wrap: true },
                                        { type: 'TextBlock', text: `${payload.skipped}`, size: 'ExtraLarge', color: 'Warning', weight: 'Bolder', wrap: true }
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
                                    ]
                                },
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
<<<<<<< HEAD
                                        { type: 'TextBlock', weight: 'Bolder', color: 'Attention', text: 'Skipped', wrap: true },
                                        { type: 'TextBlock', color: 'Attention', text: `${payload.skipped}`, wrap: true }
=======
                                        { type: 'TextBlock', text: 'Flaky', weight: 'Bolder', wrap: true },
                                        { type: 'TextBlock', text: `${payload.flaky}`, size: 'ExtraLarge', color: 'Accent', weight: 'Bolder', wrap: true }
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'TextBlock',
<<<<<<< HEAD
                            spacing: 'Medium',
                            text: '**Modules Summary**',
                            wrap: true
                        },
                        {
                            type: 'FactSet',
                            facts: payload.modules.map(m => ({
                                title: `${m.name}:`,
                                value: `${m.passed} passed, ${m.failed} failed`
                            }))
                        }
                    ]
                    // 🔥 No actions[] here — Buttons removed completely
=======
                            text: `Total tests: ${payload.total}`,
                            spacing: 'Medium',
                            weight: 'Bolder',
                            wrap: true
                        }
                    ],
                    actions: payload.reportUrl
                        ? [
                              {
                                  type: 'Action.OpenUrl',
                                  title: 'Open HTML Report',
                                  url: payload.reportUrl
                              }
                          ]
                        : []
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
                }
            }
        ]
    };
}

class TeamsReporter implements Reporter {
    private total = 0;
    private passed = 0;
    private failed = 0;
    private skipped = 0;
    private flaky = 0;
    private modules = new Map<string, { passed: number; failed: number }>();

    private projectName = 'StaffConnect';
    private environment = process.env.TEST_ENV || 'UAT';
    private triggeredBy =
        process.env.BITBUCKET_COMMIT_AUTHOR ||
        process.env.GITHUB_ACTOR ||
        process.env.USER ||
        'Playwright';

    onBegin(config: FullConfig, suite: Suite) {
<<<<<<< HEAD
        //this.projectName = config.projects.map(p => p.name).join(', ') || 'Playwright Tests';
        console.log(`TeamsReporter: starting run for projects: ${this.projectName}`);
    }

    onTestEnd(test: TestCase, result: TestResult) {
        this.total++;

        if (result.retry > 0) this.flaky++;

        if (result.status === 'passed') this.passed++;
        else if (result.status === 'failed') this.failed++;
        else this.skipped++;

        // Use the spec file name as module name
        const file = test.location.file;
        const moduleName = path.basename(file).replace(/\.[tj]s$/, '').replace('.spec', '');

        const current = this.modules.get(moduleName) || { passed: 0, failed: 0 };
        if (result.status === 'passed') current.passed++;
        if (result.status === 'failed') current.failed++;
=======
        console.log(`TeamsReporter: starting run for ${this.projectName}`);
    }

    onTestEnd(test: TestCase, result: TestResult) {
        this.total += 1;
        if (result.status === 'passed') this.passed += 1;
        else if (result.status === 'failed') this.failed += 1;
        else this.skipped += 1;

        if (result.retry > 0) this.flaky += 1;

        const file = test.location.file;
        const moduleName = path.basename(file).replace(/\.(ts|tsx|js|jsx)$/, '').replace('.spec', '');
        const current = this.modules.get(moduleName) || { passed: 0, failed: 0 };
        if (result.status === 'passed') current.passed += 1;
        if (result.status === 'failed') current.failed += 1;
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
        this.modules.set(moduleName, current);
    }

    async onEnd() {
        const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
<<<<<<< HEAD
=======
        console.log('TeamsReporter: process.env.TEAMS_WEBHOOK_URL=', process.env.TEAMS_WEBHOOK_URL);
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
        if (!webhookUrl) {
            console.warn('TeamsReporter: TEAMS_WEBHOOK_URL is not set, skipping Teams notification.');
            return;
        }

        const executionTime = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'long'
        }).format(new Date());
<<<<<<< HEAD
=======

>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
        const reportUrl = process.env.PLAYWRIGHT_REPORT_URL || '';
        const modulesSummary: ModuleStats[] = Array.from(this.modules.entries()).map(
            ([name, stats]) => ({ name, ...stats })
        );

        const cardPayload = buildTestSummaryCard({
            project: this.projectName,
            environment: this.environment,
            triggeredBy: this.triggeredBy,
<<<<<<< HEAD
            runTime: executionTime,
=======
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
            executionTime,
            total: this.total,
            passed: this.passed,
            failed: this.failed,
            skipped: this.skipped,
            flaky: this.flaky,
            reportUrl,
            modules: modulesSummary
        });

        try {
<<<<<<< HEAD
            const resp = await axios.post(webhookUrl, cardPayload, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('TeamsReporter: sent summary to Teams:', resp.status, resp.statusText);
        } catch (err: any) {
            console.error('TeamsReporter: failed to send to Teams:', err.response?.data || err.message);
=======
            const trimmedWebhook = webhookUrl?.trim();
            console.log('TeamsReporter: webhook url =', trimmedWebhook);
            console.log('TeamsReporter: payload summary', {
                total: this.total,
                passed: this.passed,
                failed: this.failed,
                skipped: this.skipped,
                flaky: this.flaky,
                modules: modulesSummary
            });
            const res = await axios.post(trimmedWebhook, cardPayload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            console.log('TeamsReporter: sent to Teams, status=', res.status, 'data=', JSON.stringify(res.data).slice(0,2000));
        } catch (error: any) {
            console.error('TeamsReporter: failed to send to Teams:', error?.response?.data || error?.message || error);
            try {
                console.error('TeamsReporter: payload (truncated)=', JSON.stringify(cardPayload).slice(0, 2000));
            } catch (e) {
                console.error('TeamsReporter: failed to stringify payload', e);
            }
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
        }
    }
}

<<<<<<< HEAD
export default TeamsReporter;
=======
export default TeamsReporter;
>>>>>>> 214c4e1e (Added Teams webhook integration and getGuestActivityBookings)
