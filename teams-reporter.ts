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

// Load environment variables from .env file
dotenv.config();

type ModuleStats = { name: string; passed: number; failed: number };

function buildTestSummaryCard(payload: {
    project: string;
    environment: string;
    triggeredBy: string;
    runTime: string;
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
        runTime: payload.runTime,
        total: payload.total,
        passed: payload.passed,
        failed: payload.failed,
        skipped: payload.skipped,
        flaky: payload.flaky,
        reportUrl: payload.reportUrl,
        type: 'message',
        attachments: [
            {
                contentType: 'application/vnd.microsoft.card.adaptive',
                contentUrl: null,
                content: {
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    type: 'AdaptiveCard',
                    version: '1.4',
                    msteams: {
                        width: 'Full'
                    },
                    body: [
                        {
                            type: 'TextBlock',
                            size: 'Large',
                            weight: 'Bolder',
                            text: '✅ StaffConnect - Test Execution Summary',
                            wrap: true
                        },
                        {
                            type: 'TextBlock',
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
                                        { type: 'TextBlock', weight: 'Bolder', text: 'Total', wrap: true },
                                        { type: 'TextBlock', text: `${payload.total}`, wrap: true }
                                    ]
                                },
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
                                        { type: 'TextBlock', weight: 'Bolder', color: 'Good', text: 'Passed', wrap: true },
                                        { type: 'TextBlock', color: 'Good', text: `${payload.passed}`, wrap: true }
                                    ]
                                },
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
                                        { type: 'TextBlock', weight: 'Bolder', color: 'Warning', text: 'Failed', wrap: true },
                                        { type: 'TextBlock', color: 'Warning', text: `${payload.failed}`, wrap: true }
                                    ]
                                },
                                {
                                    type: 'Column',
                                    width: 'stretch',
                                    items: [
                                        { type: 'TextBlock', weight: 'Bolder', color: 'Attention', text: 'Skipped', wrap: true },
                                        { type: 'TextBlock', color: 'Attention', text: `${payload.skipped}`, wrap: true }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'TextBlock',
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
        this.modules.set(moduleName, current);
    }

    async onEnd() {
        const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
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

        const cardPayload = buildTestSummaryCard({
            project: this.projectName,
            environment: this.environment,
            triggeredBy: this.triggeredBy,
            runTime: executionTime,
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
            const resp = await axios.post(webhookUrl, cardPayload, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('TeamsReporter: sent summary to Teams:', resp.status, resp.statusText);
        } catch (err: any) {
            console.error('TeamsReporter: failed to send to Teams:', err.response?.data || err.message);
        }
    }
}

export default TeamsReporter;