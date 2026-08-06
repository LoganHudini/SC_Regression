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

// Load env vars from .env first, then .env.local so local overrides are applied.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type ModuleStats = { name: string; passed: number; failed: number };

function buildTestSummaryCard(payload: {
    project: string;
    environment: string;
    triggeredBy: string;
    executionTime: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    reportUrl: string;
    modules: ModuleStats[];
}) {
    const moduleText = payload.modules.length > 0 
        ? payload.modules.map(m => `${m.name}: ${m.passed} passed, ${m.failed} failed`).join(', ')
        : 'All modules';

    return {
        type: 'message',
        attachments: [
            {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: {
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    type: 'AdaptiveCard',
                    version: '1.4',
                    body: [
                        {
                            type: 'TextBlock',
                            text: 'Staff Connect - Test Execution Summary',
                            weight: 'Bolder',
                            size: 'Large',
                            wrap: true
                        },
                        {
                            type: 'TextBlock',
                            text: `Run completed at ${payload.executionTime}`,
                            isSubtle: true,
                            spacing: 'None',
                            wrap: true
                        },
                        {
                            type: 'TextBlock',
                            text: `Module: ${moduleText}`,
                            weight: 'Bolder',
                            size: 'Medium',
                            color: 'Accent',
                            spacing: 'Small',
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
                                        { type: 'TextBlock', text: 'Passed', weight: 'Bolder', wrap: true },
                                        { type: 'TextBlock', text: `${payload.passed}`, size: 'ExtraLarge', color: 'Good', weight: 'Bolder', wrap: true }
                                    ]
                                },
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
                                        { type: 'TextBlock', text: 'Failed', weight: 'Bolder', wrap: true },
                                        { type: 'TextBlock', text: `${payload.failed}`, size: 'ExtraLarge', color: 'Attention', weight: 'Bolder', wrap: true }
                                    ]
                                },
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
                                        { type: 'TextBlock', text: 'Skipped', weight: 'Bolder', wrap: true },
                                        { type: 'TextBlock', text: `${payload.skipped}`, size: 'ExtraLarge', color: 'Warning', weight: 'Bolder', wrap: true }
                                    ]
                                },
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
                                        { type: 'TextBlock', text: 'Flaky', weight: 'Bolder', wrap: true },
                                        { type: 'TextBlock', text: `${payload.flaky}`, size: 'ExtraLarge', color: 'Accent', weight: 'Bolder', wrap: true }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'TextBlock',
                            text: `Total Tests: ${payload.total}`,
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
        // console.log(`TeamsReporter: starting run for ${this.projectName}`);
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
        this.modules.set(moduleName, current);
    }

    async onEnd() {
        const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
        // console.log('TeamsReporter: process.env.TEAMS_WEBHOOK_URL=', process.env.TEAMS_WEBHOOK_URL);
        if (!webhookUrl) {
            console.warn('TeamsReporter: TEAMS_WEBHOOK_URL is not set, skipping Teams notification.');
            return;
        }

        const executionTime = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'long'
        }).format(new Date());

        const reportUrl = process.env.PLAYWRIGHT_REPORT_URL || '';
        const modulesSummary: ModuleStats[] = Array.from(this.modules.entries()).map(
            ([name, stats]) => ({ name, ...stats })
        );

        const moduleText = modulesSummary.length > 0 
            ? modulesSummary.map(m => `${m.name}: ${m.passed} passed, ${m.failed} failed`).join(', ')
            : 'All modules';

        // Send data in Power Automate trigger body format
        const triggerBodyPayload = {
            runTime: executionTime,
            moduleName: moduleText,
            passed: this.passed,
            failed: this.failed,
            skipped: this.skipped,
            flaky: this.flaky,
            total: this.total,
            reportUrl: reportUrl
        };

        try {
            const trimmedWebhook = webhookUrl?.trim();
            // console.log('TeamsReporter: webhook url =', trimmedWebhook);
            // console.log('TeamsReporter: payload summary', triggerBodyPayload);
            const res = await axios.post(trimmedWebhook, triggerBodyPayload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            // console.log('TeamsReporter: sent to Teams, status=', res.status, 'data=', JSON.stringify(res.data).slice(0,2000));
        } catch (error: any) {
            console.error('TeamsReporter: failed to send to Teams:', error?.response?.data || error?.message || error);
            try {
                // console.error('TeamsReporter: payload (truncated)=', JSON.stringify(triggerBodyPayload).slice(0, 2000));
            } catch (e) {
                console.error('TeamsReporter: failed to stringify payload', e);
            }
        }
    }
}

export default TeamsReporter;
